"""
============================================================================
Organism Handler - DNALang Organism Mutation and Evolution
Handles organism mutation, evolution, and quantum enhancement
============================================================================
"""

import json
import logging
import re
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime

logger = logging.getLogger('organism_handler')

# Import quantum agent for circuit execution
from workers.agents.quantum_agent import QuantumAgent

class OrganismHandler:
    """Handler for DNALang organism operations"""

    def __init__(self, supabase_client):
        """Initialize organism handler"""
        self.supabase = supabase_client
        self.quantum_agent = QuantumAgent(supabase_client)

    def mutate_organism(
        self,
        genome: str,
        mutation_type: str,
        parameters: Dict[str, Any],
        backend: str = 'ibm_fez'
    ) -> Dict[str, Any]:
        """
        Mutate DNALang organism

        Args:
            genome: DNA-Lang organism code
            mutation_type: 'evolve' | 'crossover' | 'quantum_enhance' | 'self_heal'
            parameters: Mutation-specific parameters
            backend: IBM Quantum backend name

        Returns:
            Dict with mutated genome and metrics
        """
        logger.info(f"Mutating organism: {mutation_type}")

        if mutation_type == 'evolve':
            return self._mutate_evolve(genome, parameters)
        elif mutation_type == 'crossover':
            return self._mutate_crossover(genome, parameters)
        elif mutation_type == 'quantum_enhance':
            return self._mutate_quantum_enhance(genome, parameters, backend)
        elif mutation_type == 'self_heal':
            return self._mutate_self_heal(genome, parameters)
        else:
            raise ValueError(f"Unknown mutation type: {mutation_type}")

    def _mutate_evolve(self, genome: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evolution mutation: Modify traits based on fitness

        Parameters:
        - mutation_rate: float (0.0-1.0)
        - fitness_target: float
        """
        logger.info("Evolution mutation")

        mutation_rate = parameters.get('mutation_rate', 0.1)
        mutated_genome = genome

        # Extract TRAITS section
        traits_match = re.search(r'TRAITS\s*\{([^}]+)\}', genome, re.DOTALL)
        if not traits_match:
            return {'mutated_genome': genome, 'changes': 0}

        traits_section = traits_match.group(1)
        original_traits = traits_section

        # Parse traits (key: value format)
        trait_lines = [line.strip() for line in traits_section.split('\n') if ':' in line]

        changes = 0
        mutated_traits = []

        for trait_line in trait_lines:
            if not trait_line:
                continue

            try:
                key, value = trait_line.split(':', 1)
                key = key.strip()
                value = value.strip()

                # Try to mutate numeric values
                if value.replace('.', '', 1).replace('-', '', 1).isdigit():
                    import random
                    if random.random() < mutation_rate:
                        original_val = float(value)
                        mutation_factor = 1.0 + random.uniform(-0.2, 0.2)
                        mutated_val = original_val * mutation_factor
                        mutated_traits.append(f"        {key}: {mutated_val:.4f}")
                        changes += 1
                    else:
                        mutated_traits.append(f"        {trait_line}")
                else:
                    mutated_traits.append(f"        {trait_line}")

            except Exception as e:
                logger.warning(f"Failed to parse trait line: {trait_line}")
                mutated_traits.append(f"        {trait_line}")

        # Reconstruct genome with mutated traits
        new_traits_section = '\n'.join(mutated_traits)
        mutated_genome = genome.replace(original_traits, new_traits_section)

        logger.info(f"Evolution complete: {changes} traits mutated")

        return {
            'mutated_genome': mutated_genome,
            'changes': changes,
            'mutation_type': 'evolve',
            'mutation_rate': mutation_rate,
        }

    def _mutate_crossover(self, genome: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crossover mutation: Combine with another genome

        Parameters:
        - partner_genome: str
        - crossover_point: float (0.0-1.0)
        """
        logger.info("Crossover mutation")

        partner_genome = parameters.get('partner_genome')
        if not partner_genome:
            raise ValueError("partner_genome required for crossover")

        crossover_point = parameters.get('crossover_point', 0.5)

        # Simple crossover: take first half from genome, second half from partner
        genome_lines = genome.split('\n')
        partner_lines = partner_genome.split('\n')

        split_index = int(len(genome_lines) * crossover_point)

        mutated_lines = genome_lines[:split_index] + partner_lines[split_index:]
        mutated_genome = '\n'.join(mutated_lines)

        logger.info(f"Crossover complete at {crossover_point}")

        return {
            'mutated_genome': mutated_genome,
            'crossover_point': crossover_point,
            'mutation_type': 'crossover',
        }

    def _mutate_quantum_enhance(
        self,
        genome: str,
        parameters: Dict[str, Any],
        backend: str
    ) -> Dict[str, Any]:
        """
        Quantum enhancement: Use quantum circuit execution to guide mutation

        Parameters:
        - num_qubits: int
        - shots: int
        """
        logger.info(f"Quantum enhancement on {backend}")

        num_qubits = parameters.get('num_qubits', 3)
        shots = parameters.get('shots', 1024)

        # Create simple test circuit
        from qiskit import QuantumCircuit

        circuit = QuantumCircuit(num_qubits, num_qubits)
        circuit.h(0)
        for i in range(1, num_qubits):
            circuit.cx(0, i)
        circuit.measure(range(num_qubits), range(num_qubits))

        circuit_qasm = circuit.qasm()

        # Execute on quantum hardware
        try:
            quantum_result = self.quantum_agent.execute_circuit({
                'circuit_qasm': circuit_qasm,
                'backend': backend,
                'shots': shots,
                'num_qubits': num_qubits,
            })

            phi = quantum_result['metrics']['phi']
            lambda_val = quantum_result['metrics']['lambda']
            gamma = quantum_result['metrics']['gamma']

            logger.info(f"Quantum metrics: Φ={phi:.4f}, Λ={lambda_val:.6e}, Γ={gamma:.4f}")

            # Use quantum metrics to guide mutation
            # Higher Φ → more aggressive mutation
            mutation_intensity = min(phi / 5.0, 1.0)

            # Apply mutation based on quantum metrics
            mutated_result = self._mutate_evolve(genome, {
                'mutation_rate': mutation_intensity,
                'fitness_target': phi,
            })

            return {
                'mutated_genome': mutated_result['mutated_genome'],
                'changes': mutated_result['changes'],
                'mutation_type': 'quantum_enhance',
                'quantum_metrics': {
                    'phi': phi,
                    'lambda': lambda_val,
                    'gamma': gamma,
                },
                'backend': backend,
                'mutation_intensity': mutation_intensity,
            }

        except Exception as e:
            logger.error(f"Quantum enhancement failed: {e}")
            # Fallback to regular evolution
            return self._mutate_evolve(genome, {'mutation_rate': 0.1})

    def _mutate_self_heal(self, genome: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Self-healing mutation: Detect and fix structural issues

        Parameters:
        - fix_syntax: bool
        - balance_braces: bool
        """
        logger.info("Self-healing mutation")

        mutated_genome = genome

        # Balance braces
        if parameters.get('balance_braces', True):
            open_braces = genome.count('{')
            close_braces = genome.count('}')

            if open_braces > close_braces:
                mutated_genome += '\n' + '}' * (open_braces - close_braces)
            elif close_braces > open_braces:
                # Remove excess closing braces
                excess = close_braces - open_braces
                for _ in range(excess):
                    idx = mutated_genome.rfind('}')
                    if idx != -1:
                        mutated_genome = mutated_genome[:idx] + mutated_genome[idx+1:]

        # Fix common syntax issues
        if parameters.get('fix_syntax', True):
            # Ensure sections exist
            required_sections = ['DNA', 'GENOME', 'QUANTUM']
            for section in required_sections:
                if section not in mutated_genome:
                    mutated_genome += f"\n\n{section} {{\n    # TODO: Implement {section}\n}}"

        logger.info("Self-healing complete")

        return {
            'mutated_genome': mutated_genome,
            'mutation_type': 'self_heal',
            'fixes_applied': ['balance_braces', 'fix_syntax'],
        }
