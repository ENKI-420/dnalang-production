#!/usr/bin/env python3
"""DNALang Autoscaling Logic"""

import math
from typing import Dict, Any

class QuantumAutoscaler:
    """Autoscale based on quantum metrics"""
    
    def __init__(self, lambda_phi: float = 2.176435e-8):
        self.lambda_phi = lambda_phi
        
    def calculate_replicas(
        self,
        current_phi: float,
        target_phi: float,
        current_lambda: float,
        current_gamma: float,
        min_replicas: int = 1,
        max_replicas: int = 10
    ) -> int:
        """Calculate optimal replica count based on quantum metrics"""
        
        # Calculate coherence index
        coherence = current_lambda / (current_gamma + 1e-10)
        
        # Calculate phi deficit
        phi_deficit = target_phi - current_phi
        
        if phi_deficit <= 0:
            # Target achieved, maintain current or scale down
            return min_replicas
            
        # Calculate scaling factor based on quantum metrics
        # More replicas needed when phi is low and coherence is high
        scaling_factor = 1.0
        
        if coherence > 0.5:
            # Good coherence, scale up to improve phi
            scaling_factor = 1 + (phi_deficit / target_phi) * 2
        else:
            # Poor coherence, be conservative with scaling
            scaling_factor = 1 + (phi_deficit / target_phi) * 0.5
            
        # Apply Lambda-Phi constant influence
        lambda_influence = math.log10(current_lambda / self.lambda_phi + 1)
        scaling_factor *= (1 + lambda_influence * 0.1)
        
        # Calculate target replicas
        target_replicas = int(math.ceil(min_replicas * scaling_factor))
        
        # Apply bounds
        return max(min_replicas, min(target_replicas, max_replicas))
        
    def should_scale(
        self,
        current_metrics: Dict[str, Any],
        target_metrics: Dict[str, Any],
        threshold: float = 0.1
    ) -> bool:
        """Determine if scaling is needed"""
        
        phi_diff = abs(current_metrics['phi'] - target_metrics['phi'])
        lambda_diff = abs(current_metrics['lambda'] - target_metrics['lambda'])
        
        # Scale if significant difference in key metrics
        return phi_diff > threshold or lambda_diff > (self.lambda_phi * 10)

if __name__ == "__main__":
    scaler = QuantumAutoscaler()
    
    # Example usage
    replicas = scaler.calculate_replicas(
        current_phi=0.3,
        target_phi=0.7,
        current_lambda=2.5e-8,
        current_gamma=1.5
    )
    print(f"Recommended replicas: {replicas}")
