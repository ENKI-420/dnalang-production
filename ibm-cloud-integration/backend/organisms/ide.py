"""Organism IDE Backend Services"""

import re
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

from ..config import settings


class OrganismIDEBackend:
    """Backend services for DNALang organism IDE"""

    # DNALang keywords for syntax highlighting
    KEYWORDS = [
        'ORGANISM', 'DNA', 'GENOME', 'GENE', 'TRAITS', 'MUTATIONS',
        'PHENOME', 'QUANTUM', 'IMMUNE', 'MEMORY', 'CONSCIOUSNESS'
    ]

    # DNALang types
    TYPES = [
        'string', 'number', 'boolean', 'array', 'object',
        'circuit', 'qubit', 'gate', 'measurement'
    ]

    # Quantum gates
    GATES = [
        'H', 'X', 'Y', 'Z', 'CNOT', 'CX', 'CZ', 'SWAP',
        'RX', 'RY', 'RZ', 'T', 'S', 'TOFFOLI', 'CCX'
    ]

    def __init__(self):
        self.validation_rules = self._initialize_validation_rules()
        self.autocomplete_cache = {}

    def _initialize_validation_rules(self) -> Dict[str, Any]:
        """Initialize DNALang validation rules"""
        return {
            'required_sections': ['ORGANISM', 'DNA', 'GENOME'],
            'optional_sections': ['PHENOME', 'QUANTUM', 'IMMUNE', 'MEMORY'],
            'dna_fields': [
                'domain', 'version', 'quantum_enabled', 'lambda_phi'
            ],
            'gene_fields': [
                'purpose', 'expression_level', 'regulatory_network'
            ],
            'trait_types': [
                'behavioral', 'structural', 'functional', 'adaptive'
            ]
        }

    def validate_dna_syntax(self, dna_code: str) -> Dict[str, Any]:
        """Validate DNALang syntax"""

        errors = []
        warnings = []
        line_errors = {}

        lines = dna_code.split('\n')

        # Track opened/closed braces
        brace_stack = []
        current_section = None
        current_subsection = None

        for line_num, line in enumerate(lines, 1):
            stripped = line.strip()

            # Skip empty lines and comments
            if not stripped or stripped.startswith('#'):
                continue

            # Check for section declarations
            for keyword in self.KEYWORDS:
                if stripped.startswith(keyword):
                    current_section = keyword
                    if '{' in stripped:
                        brace_stack.append((keyword, line_num))
                    break

            # Check brace matching
            open_braces = line.count('{')
            close_braces = line.count('}')

            for _ in range(open_braces):
                if current_section:
                    brace_stack.append((current_section, line_num))

            for _ in range(close_braces):
                if brace_stack:
                    brace_stack.pop()
                else:
                    errors.append({
                        'line': line_num,
                        'type': 'error',
                        'message': 'Unexpected closing brace'
                    })
                    line_errors[line_num] = 'Unexpected closing brace'

            # Validate field assignments
            if ':' in stripped and not stripped.startswith('#'):
                field_name = stripped.split(':')[0].strip()
                field_value = stripped.split(':', 1)[1].strip()

                # Check for required DNA fields
                if current_section == 'DNA':
                    if field_name == 'lambda_phi':
                        try:
                            value = float(field_value)
                            if abs(value - settings.LAMBDA_PHI) > 1e-10:
                                warnings.append({
                                    'line': line_num,
                                    'type': 'warning',
                                    'message': f'lambda_phi should be {settings.LAMBDA_PHI}'
                                })
                        except:
                            errors.append({
                                'line': line_num,
                                'type': 'error',
                                'message': 'lambda_phi must be a number'
                            })

        # Check for unclosed braces
        if brace_stack:
            for section, line_num in brace_stack:
                errors.append({
                    'line': line_num,
                    'type': 'error',
                    'message': f'Unclosed brace for {section}'
                })

        # Check for required sections
        required_found = {section: False for section in self.validation_rules['required_sections']}

        for section in self.validation_rules['required_sections']:
            if section in dna_code:
                required_found[section] = True

        for section, found in required_found.items():
            if not found:
                errors.append({
                    'line': 0,
                    'type': 'error',
                    'message': f'Missing required section: {section}'
                })

        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'line_errors': line_errors,
            'statistics': {
                'total_lines': len(lines),
                'sections': sum(1 for k in self.KEYWORDS if k in dna_code),
                'genes': dna_code.count('GENE')
            }
        }

    def get_autocomplete_suggestions(
        self,
        dna_code: str,
        cursor_position: int
    ) -> List[Dict[str, Any]]:
        """Get autocomplete suggestions based on context"""

        suggestions = []

        # Find cursor context
        before_cursor = dna_code[:cursor_position]
        lines_before = before_cursor.split('\n')
        current_line = lines_before[-1] if lines_before else ""

        # Determine context
        context = self._determine_context(before_cursor)

        if not current_line.strip():
            # Suggest section keywords
            if context == 'root':
                suggestions.extend([
                    {'label': kw, 'kind': 'keyword', 'detail': 'Section'}
                    for kw in ['ORGANISM', 'DNA', 'GENOME', 'PHENOME', 'QUANTUM']
                ])

        elif current_line.strip().endswith(':'):
            # Suggest values based on field
            field = current_line.strip()[:-1].strip()
            suggestions.extend(self._get_field_value_suggestions(field, context))

        else:
            # Partial typing - filter existing suggestions
            partial = current_line.strip().split()[-1] if current_line.strip() else ""

            if context == 'GENOME':
                suggestions.extend([
                    {'label': 'GENE', 'kind': 'keyword', 'detail': 'Define gene'},
                    {'label': 'regulatory_network', 'kind': 'property'},
                    {'label': 'expression_level', 'kind': 'property'}
                ])

            elif context == 'GENE':
                suggestions.extend([
                    {'label': 'purpose', 'kind': 'property'},
                    {'label': 'TRAITS', 'kind': 'keyword'},
                    {'label': 'MUTATIONS', 'kind': 'keyword'}
                ])

            elif context == 'QUANTUM':
                suggestions.extend([
                    {'label': 'backend', 'kind': 'property'},
                    {'label': 'circuits', 'kind': 'property'},
                    {'label': 'optimization_level', 'kind': 'property'}
                ])

            # Add quantum gates if in circuit context
            if 'circuit' in current_line.lower():
                suggestions.extend([
                    {'label': gate, 'kind': 'function', 'detail': 'Quantum gate'}
                    for gate in self.GATES
                ])

            # Filter by partial match
            if partial:
                suggestions = [
                    s for s in suggestions
                    if s['label'].lower().startswith(partial.lower())
                ]

        return suggestions[:20]  # Limit suggestions

    def _determine_context(self, code: str) -> str:
        """Determine current context in DNA code"""

        # Count braces to determine nesting
        open_braces = code.count('{')
        close_braces = code.count('}')
        depth = open_braces - close_braces

        # Find most recent section
        for keyword in reversed(self.KEYWORDS):
            if keyword in code:
                last_occurrence = code.rfind(keyword)
                # Check if we're still within this section
                after_keyword = code[last_occurrence:]
                keyword_open = after_keyword.count('{')
                keyword_close = after_keyword.count('}')
                if keyword_open > keyword_close:
                    return keyword

        return 'root' if depth == 0 else 'unknown'

    def _get_field_value_suggestions(
        self,
        field: str,
        context: str
    ) -> List[Dict[str, Any]]:
        """Get suggestions for field values"""

        suggestions = []

        if field == 'backend':
            suggestions = [
                {'label': 'ibm_torino', 'kind': 'value', 'detail': '133 qubits'},
                {'label': 'ibm_kyoto', 'kind': 'value', 'detail': '127 qubits'},
                {'label': 'ibm_osaka', 'kind': 'value', 'detail': '127 qubits'},
                {'label': 'aer_simulator', 'kind': 'value', 'detail': 'Simulator'}
            ]

        elif field == 'quantum_enabled':
            suggestions = [
                {'label': 'true', 'kind': 'value'},
                {'label': 'false', 'kind': 'value'}
            ]

        elif field == 'domain':
            suggestions = [
                {'label': 'quantum_computing', 'kind': 'value'},
                {'label': 'optimization', 'kind': 'value'},
                {'label': 'machine_learning', 'kind': 'value'},
                {'label': 'cryptography', 'kind': 'value'}
            ]

        elif field == 'version':
            suggestions = [
                {'label': '"1.0.0"', 'kind': 'value'},
                {'label': '"0.1.0"', 'kind': 'value'}
            ]

        elif field == 'lambda_phi':
            suggestions = [
                {'label': str(settings.LAMBDA_PHI), 'kind': 'value',
                 'detail': 'Universal constant'}
            ]

        elif field == 'optimization_level':
            suggestions = [
                {'label': '3', 'kind': 'value', 'detail': 'Maximum optimization'},
                {'label': '2', 'kind': 'value', 'detail': 'Medium optimization'},
                {'label': '1', 'kind': 'value', 'detail': 'Light optimization'}
            ]

        return suggestions

    def format_dna_code(self, dna_code: str) -> str:
        """Format DNALang code with proper indentation"""

        formatted_lines = []
        indent_level = 0
        indent_size = 2

        lines = dna_code.split('\n')

        for line in lines:
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                formatted_lines.append('')
                continue

            # Decrease indent for closing braces
            if stripped.startswith('}'):
                indent_level = max(0, indent_level - 1)

            # Add indented line
            formatted_lines.append(' ' * (indent_level * indent_size) + stripped)

            # Increase indent after opening braces
            if stripped.endswith('{'):
                indent_level += 1

        return '\n'.join(formatted_lines)

    def get_documentation(self, keyword: str) -> Optional[Dict[str, Any]]:
        """Get documentation for DNALang keyword"""

        docs = {
            'ORGANISM': {
                'syntax': 'ORGANISM <name> { ... }',
                'description': 'Defines a quantum organism with unique identity',
                'example': 'ORGANISM QuantumOptimizer {\n  DNA { ... }\n  GENOME { ... }\n}'
            },
            'DNA': {
                'syntax': 'DNA { <properties> }',
                'description': 'Organism metadata and configuration',
                'required_fields': ['domain', 'version', 'quantum_enabled', 'lambda_phi'],
                'example': 'DNA {\n  domain: "quantum_computing"\n  version: "1.0.0"\n  quantum_enabled: true\n  lambda_phi: 2.176435e-8\n}'
            },
            'GENOME': {
                'syntax': 'GENOME { <genes> }',
                'description': 'Collection of genes defining organism behavior',
                'example': 'GENOME {\n  GENE optimizer { ... }\n  GENE evaluator { ... }\n}'
            },
            'GENE': {
                'syntax': 'GENE <name> { <properties> }',
                'description': 'Individual functional unit of organism',
                'properties': ['purpose', 'TRAITS', 'MUTATIONS'],
                'example': 'GENE optimizer {\n  purpose: "Optimize quantum circuits"\n  TRAITS { ... }\n}'
            },
            'TRAITS': {
                'syntax': 'TRAITS { <trait_definitions> }',
                'description': 'Behavioral characteristics of a gene',
                'example': 'TRAITS {\n  learning_rate: 0.01\n  mutation_probability: 0.1\n}'
            },
            'MUTATIONS': {
                'syntax': 'MUTATIONS { <mutation_rules> }',
                'description': 'Evolution rules for gene adaptation',
                'example': 'MUTATIONS {\n  adaptive_learning {\n    trigger: "fitness < 0.5"\n    action: "increase learning_rate"\n  }\n}'
            },
            'QUANTUM': {
                'syntax': 'QUANTUM { <quantum_config> }',
                'description': 'Quantum backend and circuit configuration',
                'properties': ['backend', 'circuits', 'optimization_level'],
                'example': 'QUANTUM {\n  backend: "ibm_torino"\n  optimization_level: 3\n}'
            }
        }

        return docs.get(keyword)

    def compile_to_quantum_circuit(self, dna_code: str) -> Tuple[bool, Any]:
        """Compile DNALang to quantum circuit"""

        try:
            # Parse DNA code
            organism_data = self._parse_dna_code(dna_code)

            if not organism_data:
                return False, "Failed to parse DNA code"

            # Extract quantum configuration
            quantum_config = organism_data.get('quantum', {})

            # Generate circuit based on genes
            from qiskit import QuantumCircuit
            n_qubits = quantum_config.get('n_qubits', 5)
            circuit = QuantumCircuit(n_qubits)

            # Add gates based on genome
            genes = organism_data.get('genome', {}).get('genes', [])

            for gene in genes:
                traits = gene.get('traits', {})

                # Add quantum gates based on traits
                if traits.get('entanglement', False):
                    for i in range(n_qubits - 1):
                        circuit.cx(i, i + 1)

                if traits.get('superposition', False):
                    for i in range(n_qubits):
                        circuit.h(i)

                if traits.get('phase_shift', False):
                    for i in range(n_qubits):
                        circuit.p(settings.LAMBDA_PHI * 1e8, i)

            # Add measurements
            circuit.measure_all()

            return True, circuit

        except Exception as e:
            return False, str(e)

    def _parse_dna_code(self, dna_code: str) -> Optional[Dict[str, Any]]:
        """Parse DNALang code to dictionary"""

        try:
            result = {
                'organism': None,
                'dna': {},
                'genome': {'genes': []},
                'quantum': {}
            }

            # Simple regex-based parser
            # Extract organism name
            organism_match = re.search(r'ORGANISM\s+(\w+)', dna_code)
            if organism_match:
                result['organism'] = organism_match.group(1)

            # Extract DNA section
            dna_match = re.search(r'DNA\s*{([^}]+)}', dna_code, re.DOTALL)
            if dna_match:
                dna_content = dna_match.group(1)
                for line in dna_content.split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        result['dna'][key.strip()] = value.strip()

            # Extract genes
            gene_pattern = r'GENE\s+(\w+)\s*{([^}]+)}'
            for match in re.finditer(gene_pattern, dna_code, re.DOTALL):
                gene_name = match.group(1)
                gene_content = match.group(2)

                gene_data = {'name': gene_name, 'traits': {}}

                # Extract traits
                traits_match = re.search(r'TRAITS\s*{([^}]+)}', gene_content)
                if traits_match:
                    traits_content = traits_match.group(1)
                    for line in traits_content.split('\n'):
                        if ':' in line:
                            key, value = line.split(':', 1)
                            gene_data['traits'][key.strip()] = value.strip()

                result['genome']['genes'].append(gene_data)

            # Extract quantum config
            quantum_match = re.search(r'QUANTUM\s*{([^}]+)}', dna_code, re.DOTALL)
            if quantum_match:
                quantum_content = quantum_match.group(1)
                for line in quantum_content.split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        result['quantum'][key.strip()] = value.strip()

            return result

        except Exception as e:
            print(f"Parse error: {e}")
            return None

    def get_template(self, template_type: str = 'basic') -> str:
        """Get DNALang template"""

        templates = {
            'basic': '''ORGANISM MyOrganism {
  DNA {
    domain: "quantum_computing"
    version: "1.0.0"
    quantum_enabled: true
    lambda_phi: 2.176435e-8
  }

  GENOME {
    GENE primary {
      purpose: "Main functionality"

      TRAITS {
        adaptability: 0.8
        learning_rate: 0.01
      }

      MUTATIONS {
        enhance_learning {
          trigger: "fitness < 0.5"
          action: "increase learning_rate by 0.005"
        }
      }
    }
  }

  QUANTUM {
    backend: "ibm_torino"
    optimization_level: 3
  }
}''',
            'advanced': '''ORGANISM AdvancedOrganism {
  DNA {
    domain: "quantum_optimization"
    version: "2.0.0"
    quantum_enabled: true
    lambda_phi: 2.176435e-8
    consciousness_target: 0.8
  }

  GENOME {
    GENE optimizer {
      purpose: "Quantum circuit optimization"

      TRAITS {
        algorithm: "VQE"
        max_iterations: 100
        convergence_threshold: 0.001
      }

      MUTATIONS {
        adaptive_algorithm {
          trigger: "convergence_rate < 0.1"
          action: "switch algorithm to QAOA"
        }
      }
    }

    GENE evaluator {
      purpose: "Fitness evaluation"

      TRAITS {
        metrics: ["fidelity", "coherence", "entanglement"]
        weight_fidelity: 0.4
        weight_coherence: 0.3
        weight_entanglement: 0.3
      }
    }
  }

  PHENOME {
    visualization: "3d_bloch_sphere"
    update_frequency: 10
  }

  QUANTUM {
    backend: "ibm_torino"
    optimization_level: 3
    resilience_level: 1
    shots: 1024
  }

  IMMUNE {
    error_threshold: 0.1
    self_healing: true
    checkpointing: true
  }
}'''
        }

        return templates.get(template_type, templates['basic'])