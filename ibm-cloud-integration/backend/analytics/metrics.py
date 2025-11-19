"""Metrics Collection and Analysis for DNALang"""

import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import numpy as np
from collections import defaultdict

from prometheus_client import Counter, Histogram, Gauge, generate_latest

from ..config import settings


@dataclass
class MetricPoint:
    """Single metric data point"""
    timestamp: datetime
    metric_name: str
    value: float
    labels: Dict[str, str]
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data


class MetricsCollector:
    """Collect and analyze system metrics"""

    def __init__(self):
        # Time series storage
        self.metrics_history: List[MetricPoint] = []
        self.aggregates: Dict[str, Dict[str, float]] = defaultdict(dict)

        # Prometheus metrics
        self._init_prometheus_metrics()

        # Performance tracking
        self.operation_timings: Dict[str, List[float]] = defaultdict(list)

    def _init_prometheus_metrics(self):
        """Initialize Prometheus metrics"""
        # Quantum metrics
        self.quantum_executions = Counter(
            'dnalang_quantum_executions_total',
            'Total quantum circuit executions',
            ['backend', 'organism']
        )

        self.quantum_execution_time = Histogram(
            'dnalang_quantum_execution_seconds',
            'Quantum execution duration',
            ['backend']
        )

        self.circuit_depth = Histogram(
            'dnalang_circuit_depth',
            'Quantum circuit depth distribution'
        )

        self.phi_consciousness = Histogram(
            'dnalang_phi_consciousness',
            'Consciousness metric distribution'
        )

        self.lambda_coherence = Histogram(
            'dnalang_lambda_coherence',
            'Lambda coherence values'
        )

        # Organism metrics
        self.organism_fitness = Gauge(
            'dnalang_organism_fitness',
            'Current organism fitness',
            ['organism_id']
        )

        self.organism_generation = Gauge(
            'dnalang_organism_generation',
            'Current organism generation',
            ['organism_id']
        )

        self.evolution_rate = Histogram(
            'dnalang_evolution_rate',
            'Evolution improvement rate'
        )

        # System metrics
        self.api_requests = Counter(
            'dnalang_api_requests_total',
            'Total API requests',
            ['method', 'endpoint', 'status']
        )

        self.api_latency = Histogram(
            'dnalang_api_latency_seconds',
            'API request latency',
            ['endpoint']
        )

        self.websocket_connections = Gauge(
            'dnalang_websocket_connections',
            'Active WebSocket connections'
        )

        self.job_queue_size = Gauge(
            'dnalang_job_queue_size',
            'Quantum job queue size'
        )

        # Resource metrics
        self.storage_usage = Gauge(
            'dnalang_storage_bytes',
            'Storage usage in bytes',
            ['type']
        )

        self.memory_usage = Gauge(
            'dnalang_memory_usage_bytes',
            'Memory usage in bytes'
        )

    def record_quantum_execution(
        self,
        backend: str,
        organism_id: str,
        execution_time: float,
        depth: int,
        phi: float,
        lambda_val: float,
        success: bool = True
    ):
        """Record quantum execution metrics"""

        # Update Prometheus metrics
        self.quantum_executions.labels(
            backend=backend,
            organism=organism_id
        ).inc()

        self.quantum_execution_time.labels(backend=backend).observe(execution_time)
        self.circuit_depth.observe(depth)
        self.phi_consciousness.observe(phi)
        self.lambda_coherence.observe(lambda_val)

        # Store in time series
        self._record_metric('quantum_execution_time', execution_time, {
            'backend': backend,
            'organism': organism_id
        })

        self._record_metric('phi', phi, {
            'backend': backend,
            'organism': organism_id
        })

        self._record_metric('lambda', lambda_val, {
            'backend': backend,
            'organism': organism_id
        })

        # Track success rate
        self._update_aggregate(
            f"success_rate_{backend}",
            1.0 if success else 0.0
        )

    def record_organism_evolution(
        self,
        organism_id: str,
        generation: int,
        fitness: float,
        improvement: float
    ):
        """Record organism evolution metrics"""

        self.organism_fitness.labels(organism_id=organism_id).set(fitness)
        self.organism_generation.labels(organism_id=organism_id).set(generation)
        self.evolution_rate.observe(improvement)

        self._record_metric('fitness', fitness, {
            'organism': organism_id,
            'generation': str(generation)
        })

        self._record_metric('improvement', improvement, {
            'organism': organism_id
        })

    def record_api_request(
        self,
        method: str,
        endpoint: str,
        status: int,
        latency: float
    ):
        """Record API request metrics"""

        self.api_requests.labels(
            method=method,
            endpoint=endpoint,
            status=str(status)
        ).inc()

        self.api_latency.labels(endpoint=endpoint).observe(latency)

        self._record_metric('api_latency', latency, {
            'method': method,
            'endpoint': endpoint,
            'status': str(status)
        })

    def record_operation_timing(
        self,
        operation: str,
        duration: float
    ):
        """Record operation timing"""
        self.operation_timings[operation].append(duration)

        # Keep only recent timings
        if len(self.operation_timings[operation]) > 1000:
            self.operation_timings[operation] = self.operation_timings[operation][-1000:]

    def _record_metric(
        self,
        name: str,
        value: float,
        labels: Dict[str, str],
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Record a metric point"""

        point = MetricPoint(
            timestamp=datetime.now(),
            metric_name=name,
            value=value,
            labels=labels,
            metadata=metadata
        )

        self.metrics_history.append(point)

        # Cleanup old metrics (keep last 24 hours)
        cutoff = datetime.now() - timedelta(hours=24)
        self.metrics_history = [
            p for p in self.metrics_history
            if p.timestamp >= cutoff
        ]

    def _update_aggregate(self, key: str, value: float):
        """Update aggregate statistics"""

        if key not in self.aggregates:
            self.aggregates[key] = {
                'count': 0,
                'sum': 0,
                'min': float('inf'),
                'max': float('-inf')
            }

        agg = self.aggregates[key]
        agg['count'] += 1
        agg['sum'] += value
        agg['min'] = min(agg['min'], value)
        agg['max'] = max(agg['max'], value)
        agg['avg'] = agg['sum'] / agg['count']

    def get_time_series(
        self,
        metric_name: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        labels: Optional[Dict[str, str]] = None
    ) -> List[Dict[str, Any]]:
        """Get time series data for a metric"""

        series = []

        for point in self.metrics_history:
            if point.metric_name != metric_name:
                continue

            if start_time and point.timestamp < start_time:
                continue

            if end_time and point.timestamp > end_time:
                continue

            if labels:
                if not all(
                    point.labels.get(k) == v
                    for k, v in labels.items()
                ):
                    continue

            series.append({
                'timestamp': point.timestamp.isoformat(),
                'value': point.value,
                'labels': point.labels
            })

        return series

    def calculate_statistics(
        self,
        metric_name: str,
        period: str = 'hour'
    ) -> Dict[str, Any]:
        """Calculate statistics for a metric"""

        # Get time window
        now = datetime.now()
        if period == 'hour':
            start_time = now - timedelta(hours=1)
        elif period == 'day':
            start_time = now - timedelta(days=1)
        elif period == 'week':
            start_time = now - timedelta(weeks=1)
        else:
            start_time = datetime.min

        # Collect values
        values = []
        for point in self.metrics_history:
            if point.metric_name == metric_name and point.timestamp >= start_time:
                values.append(point.value)

        if not values:
            return {
                'metric': metric_name,
                'period': period,
                'count': 0
            }

        return {
            'metric': metric_name,
            'period': period,
            'count': len(values),
            'mean': np.mean(values),
            'median': np.median(values),
            'std': np.std(values),
            'min': min(values),
            'max': max(values),
            'percentiles': {
                'p25': np.percentile(values, 25),
                'p50': np.percentile(values, 50),
                'p75': np.percentile(values, 75),
                'p95': np.percentile(values, 95),
                'p99': np.percentile(values, 99)
            }
        }

    def get_backend_performance(self) -> Dict[str, Any]:
        """Get backend performance metrics"""

        backends = defaultdict(lambda: {
            'executions': 0,
            'avg_time': 0,
            'success_rate': 0,
            'avg_phi': 0,
            'avg_depth': 0
        })

        # Aggregate by backend
        for point in self.metrics_history:
            if 'backend' in point.labels:
                backend = point.labels['backend']

                if point.metric_name == 'quantum_execution_time':
                    backends[backend]['executions'] += 1
                    backends[backend]['avg_time'] = (
                        backends[backend]['avg_time'] * (backends[backend]['executions'] - 1) +
                        point.value
                    ) / backends[backend]['executions']

                elif point.metric_name == 'phi':
                    backends[backend]['avg_phi'] = (
                        backends[backend]['avg_phi'] * (backends[backend]['executions'] - 1) +
                        point.value
                    ) / backends[backend]['executions']

        # Add success rates
        for backend in backends:
            key = f"success_rate_{backend}"
            if key in self.aggregates:
                backends[backend]['success_rate'] = self.aggregates[key].get('avg', 0)

        return dict(backends)

    def get_organism_rankings(
        self,
        metric: str = 'fitness',
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get organism rankings by metric"""

        organism_metrics = defaultdict(list)

        # Collect metrics by organism
        for point in self.metrics_history:
            if point.metric_name == metric and 'organism' in point.labels:
                organism_id = point.labels['organism']
                organism_metrics[organism_id].append(point.value)

        # Calculate averages and rank
        rankings = []
        for organism_id, values in organism_metrics.items():
            rankings.append({
                'organism_id': organism_id,
                'metric': metric,
                'current_value': values[-1] if values else 0,
                'average_value': np.mean(values),
                'max_value': max(values) if values else 0,
                'sample_count': len(values)
            })

        # Sort by current value
        rankings.sort(key=lambda x: x['current_value'], reverse=True)

        return rankings[:limit]

    def get_system_health(self) -> Dict[str, Any]:
        """Get overall system health metrics"""

        # Calculate health score components
        recent_errors = sum(
            1 for p in self.metrics_history
            if p.timestamp >= datetime.now() - timedelta(minutes=5)
            and p.labels.get('status') in ['500', '503']
        )

        avg_latency = self.calculate_statistics('api_latency', 'hour').get('mean', 0)

        # Get queue size
        queue_metrics = [
            p.value for p in self.metrics_history
            if p.metric_name == 'queue_size'
            and p.timestamp >= datetime.now() - timedelta(minutes=5)
        ]
        current_queue = queue_metrics[-1] if queue_metrics else 0

        # Calculate health score (0-100)
        health_score = 100

        # Deduct for errors
        health_score -= min(recent_errors * 5, 30)

        # Deduct for high latency
        if avg_latency > 5:
            health_score -= 20
        elif avg_latency > 2:
            health_score -= 10

        # Deduct for queue buildup
        if current_queue > 100:
            health_score -= 20
        elif current_queue > 50:
            health_score -= 10

        # Determine status
        if health_score >= 90:
            status = 'healthy'
        elif health_score >= 70:
            status = 'degraded'
        else:
            status = 'unhealthy'

        return {
            'health_score': max(0, health_score),
            'status': status,
            'components': {
                'api': {
                    'recent_errors': recent_errors,
                    'avg_latency': avg_latency,
                    'status': 'healthy' if recent_errors < 5 else 'degraded'
                },
                'quantum': {
                    'queue_size': current_queue,
                    'backends_online': len(self.get_backend_performance()),
                    'status': 'healthy' if current_queue < 50 else 'degraded'
                },
                'storage': {
                    'status': 'healthy'  # Simplified
                }
            },
            'timestamp': datetime.now().isoformat()
        }

    def get_operation_performance(self) -> Dict[str, Dict[str, float]]:
        """Get performance statistics for operations"""

        performance = {}

        for operation, timings in self.operation_timings.items():
            if timings:
                performance[operation] = {
                    'count': len(timings),
                    'mean': np.mean(timings),
                    'median': np.median(timings),
                    'p95': np.percentile(timings, 95),
                    'p99': np.percentile(timings, 99),
                    'min': min(timings),
                    'max': max(timings)
                }

        return performance

    def export_prometheus_metrics(self) -> bytes:
        """Export metrics in Prometheus format"""
        return generate_latest()

    def export_metrics_report(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Export comprehensive metrics report"""

        # Filter metrics by time range
        if start_time or end_time:
            filtered_metrics = []
            for point in self.metrics_history:
                if start_time and point.timestamp < start_time:
                    continue
                if end_time and point.timestamp > end_time:
                    continue
                filtered_metrics.append(point)
        else:
            filtered_metrics = self.metrics_history

        # Calculate key statistics
        quantum_stats = self.calculate_statistics('quantum_execution_time', 'day')
        phi_stats = self.calculate_statistics('phi', 'day')
        fitness_stats = self.calculate_statistics('fitness', 'day')

        return {
            'period': {
                'start': start_time.isoformat() if start_time else 'all_time',
                'end': end_time.isoformat() if end_time else 'current'
            },
            'summary': {
                'total_metrics': len(filtered_metrics),
                'unique_metrics': len(set(p.metric_name for p in filtered_metrics)),
                'unique_organisms': len(set(
                    p.labels.get('organism')
                    for p in filtered_metrics
                    if 'organism' in p.labels
                ))
            },
            'quantum_performance': quantum_stats,
            'consciousness_metrics': phi_stats,
            'fitness_evolution': fitness_stats,
            'backend_performance': self.get_backend_performance(),
            'organism_rankings': self.get_organism_rankings(),
            'system_health': self.get_system_health(),
            'operation_performance': self.get_operation_performance(),
            'generated_at': datetime.now().isoformat()
        }