"""IBM Cloud Cost Tracking for DNALang"""

import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import numpy as np

from ..config import settings


@dataclass
class CostEntry:
    """Cost tracking entry"""
    timestamp: datetime
    service: str  # quantum, storage, compute
    resource: str  # backend name, bucket, etc.
    operation: str  # execution, upload, download
    units: float  # runtime seconds, GB stored, etc.
    unit_cost: float  # cost per unit
    total_cost: float  # calculated total
    organism_id: Optional[str] = None
    job_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data


class CostTracker:
    """Track and analyze IBM Cloud costs"""

    # IBM Quantum pricing (simplified model)
    QUANTUM_COST_PER_SECOND = 0.00135  # USD per runtime second

    # IBM COS pricing (simplified model)
    COS_STORAGE_PER_GB_MONTH = 0.023  # USD per GB per month
    COS_REQUEST_COST = 0.0004  # USD per 1000 requests

    # Compute pricing (simplified model)
    COMPUTE_PER_VCPU_HOUR = 0.08  # USD per vCPU hour

    def __init__(self):
        self.cost_history: List[CostEntry] = []
        self.budget_limits: Dict[str, float] = {}
        self.alerts: List[Dict[str, Any]] = []

    def track_quantum_execution(
        self,
        job_id: str,
        organism_id: str,
        backend: str,
        runtime_seconds: float,
        shots: int,
        circuit_depth: int
    ) -> float:
        """Track quantum execution cost"""

        # Calculate cost
        # Runtime includes queue time estimation
        estimated_runtime = runtime_seconds + (shots * circuit_depth * 0.001)
        cost = estimated_runtime * self.QUANTUM_COST_PER_SECOND

        # Create cost entry
        entry = CostEntry(
            timestamp=datetime.now(),
            service='quantum',
            resource=backend,
            operation='execution',
            units=estimated_runtime,
            unit_cost=self.QUANTUM_COST_PER_SECOND,
            total_cost=cost,
            organism_id=organism_id,
            job_id=job_id,
            metadata={
                'shots': shots,
                'circuit_depth': circuit_depth,
                'backend': backend
            }
        )

        self.cost_history.append(entry)

        # Check budget alerts
        self._check_budget_alerts('quantum', cost)

        return cost

    def track_storage_operation(
        self,
        operation: str,  # upload, download, delete
        size_bytes: int,
        organism_id: Optional[str] = None
    ) -> float:
        """Track storage operation cost"""

        # Calculate cost
        size_gb = size_bytes / (1024 ** 3)

        if operation in ['upload', 'download']:
            # Request cost
            cost = self.COS_REQUEST_COST / 1000  # Cost per request
        else:
            # Storage cost (prorated daily)
            cost = (size_gb * self.COS_STORAGE_PER_GB_MONTH) / 30

        entry = CostEntry(
            timestamp=datetime.now(),
            service='storage',
            resource='cos',
            operation=operation,
            units=size_gb,
            unit_cost=self.COS_STORAGE_PER_GB_MONTH if operation == 'store'
                      else self.COS_REQUEST_COST,
            total_cost=cost,
            organism_id=organism_id,
            metadata={
                'size_bytes': size_bytes,
                'size_gb': size_gb
            }
        )

        self.cost_history.append(entry)

        return cost

    def track_compute_usage(
        self,
        vcpu_hours: float,
        memory_gb: float,
        organism_id: Optional[str] = None
    ) -> float:
        """Track compute resource usage"""

        # Calculate cost
        compute_cost = vcpu_hours * self.COMPUTE_PER_VCPU_HOUR
        memory_cost = memory_gb * 0.01  # Simplified memory pricing

        total_cost = compute_cost + memory_cost

        entry = CostEntry(
            timestamp=datetime.now(),
            service='compute',
            resource='openshift',
            operation='runtime',
            units=vcpu_hours,
            unit_cost=self.COMPUTE_PER_VCPU_HOUR,
            total_cost=total_cost,
            organism_id=organism_id,
            metadata={
                'vcpu_hours': vcpu_hours,
                'memory_gb': memory_gb,
                'compute_cost': compute_cost,
                'memory_cost': memory_cost
            }
        )

        self.cost_history.append(entry)

        return total_cost

    def set_budget_limit(
        self,
        service: str,
        daily_limit: float,
        monthly_limit: float
    ):
        """Set budget limits for a service"""
        self.budget_limits[service] = {
            'daily': daily_limit,
            'monthly': monthly_limit
        }

    def _check_budget_alerts(self, service: str, new_cost: float):
        """Check if budget limits are exceeded"""

        if service not in self.budget_limits:
            return

        limits = self.budget_limits[service]

        # Calculate current spending
        daily_spending = self.get_spending_by_period(service, 'day')
        monthly_spending = self.get_spending_by_period(service, 'month')

        # Check daily limit
        if daily_spending + new_cost > limits['daily']:
            self.alerts.append({
                'timestamp': datetime.now().isoformat(),
                'type': 'budget_exceeded',
                'service': service,
                'period': 'daily',
                'spending': daily_spending + new_cost,
                'limit': limits['daily'],
                'severity': 'warning'
            })

        # Check monthly limit
        if monthly_spending + new_cost > limits['monthly']:
            self.alerts.append({
                'timestamp': datetime.now().isoformat(),
                'type': 'budget_exceeded',
                'service': service,
                'period': 'monthly',
                'spending': monthly_spending + new_cost,
                'limit': limits['monthly'],
                'severity': 'critical'
            })

    def get_spending_by_period(
        self,
        service: Optional[str] = None,
        period: str = 'day'
    ) -> float:
        """Get spending for a period"""

        now = datetime.now()

        if period == 'day':
            start_time = now - timedelta(days=1)
        elif period == 'week':
            start_time = now - timedelta(weeks=1)
        elif period == 'month':
            start_time = now - timedelta(days=30)
        else:
            start_time = datetime.min

        total = 0
        for entry in self.cost_history:
            if entry.timestamp >= start_time:
                if service is None or entry.service == service:
                    total += entry.total_cost

        return total

    def get_organism_costs(
        self,
        organism_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get costs for a specific organism"""

        costs = []
        for entry in self.cost_history:
            if entry.organism_id == organism_id:
                if start_date and entry.timestamp < start_date:
                    continue
                if end_date and entry.timestamp > end_date:
                    continue
                costs.append(entry)

        # Calculate totals by service
        service_totals = {}
        for entry in costs:
            if entry.service not in service_totals:
                service_totals[entry.service] = 0
            service_totals[entry.service] += entry.total_cost

        return {
            'organism_id': organism_id,
            'total_cost': sum(service_totals.values()),
            'service_breakdown': service_totals,
            'entry_count': len(costs),
            'period': {
                'start': start_date.isoformat() if start_date else None,
                'end': end_date.isoformat() if end_date else None
            },
            'details': [entry.to_dict() for entry in costs[-10:]]  # Last 10 entries
        }

    def get_cost_analytics(self) -> Dict[str, Any]:
        """Get comprehensive cost analytics"""

        if not self.cost_history:
            return {
                'total_spending': 0,
                'service_breakdown': {},
                'trend': 'stable'
            }

        # Total spending
        total_spending = sum(entry.total_cost for entry in self.cost_history)

        # Service breakdown
        service_breakdown = {}
        for entry in self.cost_history:
            if entry.service not in service_breakdown:
                service_breakdown[entry.service] = 0
            service_breakdown[entry.service] += entry.total_cost

        # Calculate trend
        recent_spending = self.get_spending_by_period(period='day')
        weekly_spending = self.get_spending_by_period(period='week') / 7

        if recent_spending > weekly_spending * 1.2:
            trend = 'increasing'
        elif recent_spending < weekly_spending * 0.8:
            trend = 'decreasing'
        else:
            trend = 'stable'

        # Top organisms by cost
        organism_costs = {}
        for entry in self.cost_history:
            if entry.organism_id:
                if entry.organism_id not in organism_costs:
                    organism_costs[entry.organism_id] = 0
                organism_costs[entry.organism_id] += entry.total_cost

        top_organisms = sorted(
            organism_costs.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        # Hourly distribution
        hourly_costs = [0] * 24
        for entry in self.cost_history:
            hour = entry.timestamp.hour
            hourly_costs[hour] += entry.total_cost

        return {
            'total_spending': total_spending,
            'service_breakdown': service_breakdown,
            'trend': trend,
            'daily_spending': self.get_spending_by_period(period='day'),
            'weekly_spending': self.get_spending_by_period(period='week'),
            'monthly_spending': self.get_spending_by_period(period='month'),
            'top_organisms': [
                {'organism_id': org_id, 'cost': cost}
                for org_id, cost in top_organisms
            ],
            'hourly_distribution': hourly_costs,
            'active_alerts': self.alerts[-10:],  # Last 10 alerts
            'budget_status': self._get_budget_status()
        }

    def _get_budget_status(self) -> Dict[str, Any]:
        """Get current budget status"""

        status = {}
        for service, limits in self.budget_limits.items():
            daily_spending = self.get_spending_by_period(service, 'day')
            monthly_spending = self.get_spending_by_period(service, 'month')

            status[service] = {
                'daily': {
                    'spending': daily_spending,
                    'limit': limits['daily'],
                    'percentage': (daily_spending / limits['daily'] * 100)
                                if limits['daily'] > 0 else 0
                },
                'monthly': {
                    'spending': monthly_spending,
                    'limit': limits['monthly'],
                    'percentage': (monthly_spending / limits['monthly'] * 100)
                                if limits['monthly'] > 0 else 0
                }
            }

        return status

    def predict_monthly_cost(self) -> Dict[str, float]:
        """Predict monthly cost based on current usage"""

        # Get daily average from last 7 days
        weekly_spending = self.get_spending_by_period(period='week')
        daily_average = weekly_spending / 7

        # Predict for 30 days
        predicted_monthly = daily_average * 30

        # Break down by service
        service_predictions = {}
        for service in ['quantum', 'storage', 'compute']:
            service_weekly = self.get_spending_by_period(service, 'week')
            service_daily = service_weekly / 7
            service_predictions[service] = service_daily * 30

        return {
            'total_predicted': predicted_monthly,
            'service_breakdown': service_predictions,
            'daily_average': daily_average,
            'confidence': self._calculate_prediction_confidence()
        }

    def _calculate_prediction_confidence(self) -> float:
        """Calculate confidence in cost prediction"""

        if len(self.cost_history) < 10:
            return 0.3  # Low confidence with little data

        # Calculate variance in daily spending
        daily_costs = []
        for i in range(7):
            date = datetime.now() - timedelta(days=i)
            day_start = date.replace(hour=0, minute=0, second=0)
            day_end = date.replace(hour=23, minute=59, second=59)

            day_cost = sum(
                entry.total_cost
                for entry in self.cost_history
                if day_start <= entry.timestamp <= day_end
            )
            daily_costs.append(day_cost)

        if not daily_costs or np.mean(daily_costs) == 0:
            return 0.5

        # Lower variance = higher confidence
        cv = np.std(daily_costs) / np.mean(daily_costs)  # Coefficient of variation

        # Convert to confidence score (0-1)
        confidence = max(0, min(1, 1 - cv))

        return confidence

    def export_cost_report(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Export detailed cost report"""

        filtered_entries = []
        for entry in self.cost_history:
            if start_date and entry.timestamp < start_date:
                continue
            if end_date and entry.timestamp > end_date:
                continue
            filtered_entries.append(entry)

        return {
            'report_period': {
                'start': start_date.isoformat() if start_date else 'all_time',
                'end': end_date.isoformat() if end_date else 'current'
            },
            'summary': {
                'total_cost': sum(e.total_cost for e in filtered_entries),
                'entry_count': len(filtered_entries),
                'unique_organisms': len(set(e.organism_id for e in filtered_entries if e.organism_id))
            },
            'entries': [entry.to_dict() for entry in filtered_entries],
            'analytics': self.get_cost_analytics(),
            'predictions': self.predict_monthly_cost(),
            'generated_at': datetime.now().isoformat()
        }

    def clear_old_entries(self, days_to_keep: int = 90):
        """Clear old cost entries"""
        cutoff = datetime.now() - timedelta(days=days_to_keep)
        self.cost_history = [
            entry for entry in self.cost_history
            if entry.timestamp >= cutoff
        ]