"""
============================================================================
Coder Agent - Code Generation and Mutation
Handles code generation, refactoring, and mutations
============================================================================
"""

import logging
from typing import Dict, Any

logger = logging.getLogger('coder_agent')

class CoderAgent:
    """Agent for code generation and mutation"""

    def __init__(self, supabase_client):
        """Initialize coder agent"""
        self.supabase = supabase_client

    def generate_code(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate code based on specification

        Payload:
        {
            "language": str,
            "specification": str,
            "template": str (optional)
        }
        """
        language = payload.get('language', 'python')
        specification = payload.get('specification', '')
        template = payload.get('template')

        logger.info(f"Generating {language} code")

        # Basic template-based code generation
        if language == 'python':
            generated_code = self._generate_python_code(specification, template)
        elif language == 'javascript':
            generated_code = self._generate_javascript_code(specification, template)
        else:
            generated_code = f"# TODO: Implement {specification}"

        return {
            'language': language,
            'code': generated_code,
            'lines': len(generated_code.split('\n')),
        }

    def mutate_code(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mutate existing code

        Payload:
        {
            "code": str,
            "mutation_type": str,
            "parameters": dict
        }
        """
        code = payload.get('code', '')
        mutation_type = payload.get('mutation_type', 'refactor')

        logger.info(f"Mutating code: {mutation_type}")

        if mutation_type == 'refactor':
            mutated_code = self._refactor_code(code)
        elif mutation_type == 'optimize':
            mutated_code = self._optimize_code(code)
        elif mutation_type == 'document':
            mutated_code = self._add_documentation(code)
        else:
            mutated_code = code

        return {
            'original_lines': len(code.split('\n')),
            'mutated_lines': len(mutated_code.split('\n')),
            'code': mutated_code,
            'mutation_type': mutation_type,
        }

    def _generate_python_code(self, spec: str, template: Optional[str]) -> str:
        """Generate Python code"""
        if template:
            return template

        return f'''"""
{spec}
"""

def main():
    """Main function"""
    # TODO: Implement {spec}
    pass

if __name__ == '__main__':
    main()
'''

    def _generate_javascript_code(self, spec: str, template: Optional[str]) -> str:
        """Generate JavaScript code"""
        if template:
            return template

        return f'''/**
 * {spec}
 */

function main() {{
    // TODO: Implement {spec}
}}

main();
'''

    def _refactor_code(self, code: str) -> str:
        """Refactor code (basic cleanup)"""
        # Remove empty lines
        lines = [line for line in code.split('\n') if line.strip()]
        return '\n'.join(lines)

    def _optimize_code(self, code: str) -> str:
        """Optimize code"""
        # Placeholder: return as-is
        return code

    def _add_documentation(self, code: str) -> str:
        """Add documentation to code"""
        lines = code.split('\n')

        # Add header docstring if missing
        if not lines[0].strip().startswith('"""'):
            lines.insert(0, '"""')
            lines.insert(1, 'Generated code with documentation')
            lines.insert(2, '"""')

        return '\n'.join(lines)
