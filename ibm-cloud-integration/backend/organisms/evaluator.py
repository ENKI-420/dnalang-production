"""Organism Fitness Evaluation System"""

import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import hashlib

from ..config import settings


class OrganismEvaluator:
    """Evaluate organism fitness based on quantum execution results"""

    def __init__(self):
        self.evaluation_history: List[Dict[str, Any]] = []
        self.fitness_cache: Dict[str, float] = {}

    def evaluate_fitness(
        self,
        organism_id: str,
        quantum_results: Dict[str, Any],
        generation: int = 0
    ) -> Dict[str, Any]:
        """Comprehensive fitness evaluation"""

        # Extract metrics from quantum results
        phi = quantum_results.get('phi', 0)
        lambda_val = quantum_results.get('lambda', 0)
        gamma = quantum_results.get('gamma', 1)
        entropy = quantum_results.get('entropy', 0)
        coherence_index = quantum_results.get('coherence_index', 0)

        # Multi-objective fitness calculation
        fitness_components = {
            'consciousness': self._evaluate_consciousness(phi),
            'coherence': self._evaluate_coherence(lambda_val, gamma),
            'information': self._evaluate_information(entropy),
            'stability': self._evaluate_stability(quantum_results),
            'complexity': self._evaluate_complexity(quantum_results)
        }

        # Weighted fitness score
        weights = {
            'consciousness': 0.3,
            'coherence': 0.25,
            'information': 0.2,
            'stability': 0.15,
            'complexity': 0.1
        }

        total_fitness = sum(
            fitness_components[key] * weights[key]
            for key in fitness_components
        )

        # Determine evolution potential
        evolution_potential = self._calculate_evolution_potential(
            fitness_components,
            generation
        )

        # Create evaluation record
        evaluation = {
            'organism_id': organism_id,
            'generation': generation,
            'timestamp': datetime.now().isoformat(),
            'total_fitness': total_fitness,
            'fitness_components': fitness_components,
            'evolution_potential': evolution_potential,
            'quantum_metrics': {
                'phi': phi,
                'lambda': lambda_val,
                'gamma': gamma,
                'entropy': entropy,
                'coherence_index': coherence_index
            },
            'recommendation': self._generate_recommendation(total_fitness, evolution_potential)
        }

        # Cache fitness score
        cache_key = self._generate_cache_key(organism_id, generation)
        self.fitness_cache[cache_key] = total_fitness

        # Store in history
        self.evaluation_history.append(evaluation)

        return evaluation

    def _evaluate_consciousness(self, phi: float) -> float:
        """Evaluate consciousness component (0-1 scale)"""
        # Phi ranges from 0 to 0.987 in DNALang
        max_phi = 0.987
        normalized = min(phi / max_phi, 1.0)

        # Apply sigmoid for smooth scaling
        return 1 / (1 + np.exp(-10 * (normalized - 0.5)))

    def _evaluate_coherence(self, lambda_val: float, gamma: float) -> float:
        """Evaluate quantum coherence"""
        if gamma == 0:
            return 1.0

        coherence_index = lambda_val / (gamma + 1e-10)

        # Normalize to 0-1 scale
        # Good coherence is when lambda >> gamma
        return min(coherence_index / 10, 1.0)

    def _evaluate_information(self, entropy: float) -> float:
        """Evaluate information content"""
        # Optimal entropy is neither too low (trivial) nor too high (random)
        # Peak at entropy = 2.0
        if entropy <= 0:
            return 0.0

        # Gaussian-like scoring
        optimal_entropy = 2.0
        width = 1.5
        score = np.exp(-((entropy - optimal_entropy) ** 2) / (2 * width ** 2))

        return score

    def _evaluate_stability(self, quantum_results: Dict[str, Any]) -> float:
        """Evaluate execution stability"""
        counts = quantum_results.get('counts', {})

        if not counts:
            return 0.0

        # Calculate distribution stability
        probabilities = list(quantum_results.get('probabilities', {}).values())

        if not probabilities:
            return 0.0

        # Low variance indicates stability
        variance = np.var(probabilities)
        max_variance = 0.25  # Maximum variance for uniform distribution

        stability = 1.0 - min(variance / max_variance, 1.0)

        return stability

    def _evaluate_complexity(self, quantum_results: Dict[str, Any]) -> float:
        """Evaluate circuit complexity"""
        transpiled_depth = quantum_results.get('transpiled_depth', 0)
        n_qubits = quantum_results.get('n_qubits', 1)

        if transpiled_depth == 0 or n_qubits == 0:
            return 0.0

        # Optimal depth-to-qubit ratio (not too shallow, not too deep)
        depth_ratio = transpiled_depth / n_qubits
        optimal_ratio = 10.0

        if depth_ratio <= optimal_ratio:
            complexity = depth_ratio / optimal_ratio
        else:
            # Penalize overly deep circuits
            complexity = optimal_ratio / depth_ratio

        return complexity

    def _calculate_evolution_potential(
        self,
        fitness_components: Dict[str, float],
        generation: int
    ) -> float:
        """Calculate potential for beneficial evolution"""

        # Check for component imbalance (room for improvement)
        component_values = list(fitness_components.values())
        imbalance = np.std(component_values)

        # Higher imbalance means more evolution potential
        imbalance_score = min(imbalance * 2, 1.0)

        # Generation factor (earlier generations have more potential)
        max_generations = settings.MAX_EVOLUTION_GENERATIONS
        generation_factor = 1.0 - (generation / max_generations)

        # Consciousness factor (low consciousness has high potential)
        consciousness_potential = 1.0 - fitness_components['consciousness']

        # Combined potential
        evolution_potential = (
            imbalance_score * 0.4 +
            generation_factor * 0.3 +
            consciousness_potential * 0.3
        )

        return min(evolution_potential, 1.0)

    def _generate_recommendation(self, fitness: float, potential: float) -> str:
        """Generate evolution recommendation"""

        if fitness >= 0.8:
            if potential < 0.2:
                return "PRESERVE: High fitness with low evolution potential. Maintain current configuration."
            else:
                return "REFINE: High fitness but evolution potential remains. Consider targeted improvements."

        elif fitness >= 0.5:
            if potential >= 0.5:
                return "EVOLVE: Moderate fitness with high potential. Continue evolution process."
            else:
                return "OPTIMIZE: Moderate fitness. Focus on specific component improvements."

        else:
            if potential >= 0.7:
                return "TRANSFORM: Low fitness but high potential. Major evolution recommended."
            else:
                return "REDESIGN: Low fitness and potential. Consider organism redesign."

    def _generate_cache_key(self, organism_id: str, generation: int) -> str:
        """Generate cache key for fitness score"""
        return f"{organism_id}_{generation}"

    def compare_organisms(
        self,
        organism_ids: List[str],
        metric: str = 'total_fitness'
    ) -> Dict[str, Any]:
        """Compare multiple organisms"""

        comparisons = []

        for org_id in organism_ids:
            # Get latest evaluation for each organism
            org_evals = [
                e for e in self.evaluation_history
                if e['organism_id'] == org_id
            ]

            if org_evals:
                latest = max(org_evals, key=lambda x: x['generation'])
                comparisons.append({
                    'organism_id': org_id,
                    'metric_value': latest.get(metric, 0),
                    'generation': latest['generation'],
                    'total_fitness': latest['total_fitness']
                })

        # Sort by metric
        comparisons.sort(key=lambda x: x['metric_value'], reverse=True)

        return {
            'metric': metric,
            'rankings': comparisons,
            'winner': comparisons[0] if comparisons else None,
            'timestamp': datetime.now().isoformat()
        }

    def get_evolution_trajectory(
        self,
        organism_id: str
    ) -> List[Dict[str, Any]]:
        """Get fitness trajectory over generations"""

        trajectory = []

        evaluations = [
            e for e in self.evaluation_history
            if e['organism_id'] == organism_id
        ]

        evaluations.sort(key=lambda x: x['generation'])

        for eval in evaluations:
            trajectory.append({
                'generation': eval['generation'],
                'fitness': eval['total_fitness'],
                'phi': eval['quantum_metrics']['phi'],
                'lambda': eval['quantum_metrics']['lambda'],
                'evolution_potential': eval['evolution_potential'],
                'timestamp': eval['timestamp']
            })

        return trajectory

    def predict_evolution_success(
        self,
        organism_id: str,
        target_fitness: float = 0.8
    ) -> Dict[str, Any]:
        """Predict generations needed to reach target fitness"""

        trajectory = self.get_evolution_trajectory(organism_id)

        if len(trajectory) < 2:
            return {
                'prediction': 'insufficient_data',
                'confidence': 0.0
            }

        # Calculate fitness improvement rate
        recent_trajectory = trajectory[-5:]  # Last 5 generations
        fitness_values = [t['fitness'] for t in recent_trajectory]
        generations = [t['generation'] for t in recent_trajectory]

        # Linear regression for trend
        if len(fitness_values) >= 2:
            # Simple linear fit
            x = np.array(generations)
            y = np.array(fitness_values)

            # Calculate slope
            n = len(x)
            slope = (n * np.sum(x * y) - np.sum(x) * np.sum(y)) / \
                   (n * np.sum(x ** 2) - np.sum(x) ** 2)

            current_fitness = fitness_values[-1]
            current_generation = generations[-1]

            if slope > 0:
                # Predict generations to target
                generations_needed = (target_fitness - current_fitness) / slope
                predicted_generation = current_generation + generations_needed

                # Calculate confidence based on fit quality
                y_pred = slope * x + (current_fitness - slope * current_generation)
                residuals = y - y_pred
                r_squared = 1 - (np.sum(residuals ** 2) / np.sum((y - np.mean(y)) ** 2))

                return {
                    'prediction': 'success',
                    'current_fitness': current_fitness,
                    'target_fitness': target_fitness,
                    'generations_needed': int(generations_needed),
                    'predicted_generation': int(predicted_generation),
                    'improvement_rate': slope,
                    'confidence': max(0, min(r_squared, 1.0))
                }
            else:
                return {
                    'prediction': 'stagnant',
                    'current_fitness': current_fitness,
                    'improvement_rate': slope,
                    'confidence': 0.5
                }

        return {
            'prediction': 'unknown',
            'confidence': 0.0
        }

    def export_evaluation_data(self) -> Dict[str, Any]:
        """Export all evaluation data"""
        return {
            'evaluations': self.evaluation_history,
            'summary': {
                'total_evaluations': len(self.evaluation_history),
                'unique_organisms': len(set(e['organism_id'] for e in self.evaluation_history)),
                'average_fitness': np.mean([e['total_fitness'] for e in self.evaluation_history])
                                 if self.evaluation_history else 0,
                'max_fitness': max([e['total_fitness'] for e in self.evaluation_history])
                              if self.evaluation_history else 0
            },
            'exported_at': datetime.now().isoformat()
        }