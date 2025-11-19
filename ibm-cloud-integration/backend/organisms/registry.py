"""Organism Registry and Management System"""

import json
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict
import hashlib

from ..config import settings


@dataclass
class Organism:
    """Organism data structure"""
    id: str
    name: str
    dna_code: str
    version: str
    created_at: datetime
    updated_at: datetime
    author: str
    consciousness_level: float = 0.0
    fitness: float = 0.0
    generation: int = 0
    lineage: List[str] = None
    metadata: Dict[str, Any] = None
    circuit_qasm: Optional[str] = None
    tags: List[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        data['updated_at'] = self.updated_at.isoformat()
        return data

    def calculate_hash(self) -> str:
        """Calculate unique hash for organism"""
        content = f"{self.dna_code}_{self.version}_{self.generation}"
        return hashlib.sha256(content.encode()).hexdigest()


class OrganismRegistry:
    """Central registry for all organisms"""

    def __init__(self):
        self.organisms: Dict[str, Organism] = {}
        self.species_map: Dict[str, List[str]] = {}  # Species to organism IDs
        self.evolution_tree: Dict[str, List[str]] = {}  # Parent to children

    def register_organism(
        self,
        name: str,
        dna_code: str,
        author: str = "system",
        parent_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Register a new organism"""

        organism_id = str(uuid.uuid4())
        now = datetime.now()

        # Determine lineage
        lineage = []
        generation = 0
        if parent_id and parent_id in self.organisms:
            parent = self.organisms[parent_id]
            lineage = parent.lineage + [parent_id] if parent.lineage else [parent_id]
            generation = parent.generation + 1

        # Create organism
        organism = Organism(
            id=organism_id,
            name=name,
            dna_code=dna_code,
            version="1.0.0",
            created_at=now,
            updated_at=now,
            author=author,
            generation=generation,
            lineage=lineage,
            metadata=metadata or {},
            tags=[]
        )

        # Store in registry
        self.organisms[organism_id] = organism

        # Update species map
        species = self._extract_species(dna_code)
        if species not in self.species_map:
            self.species_map[species] = []
        self.species_map[species].append(organism_id)

        # Update evolution tree
        if parent_id:
            if parent_id not in self.evolution_tree:
                self.evolution_tree[parent_id] = []
            self.evolution_tree[parent_id].append(organism_id)

        return organism_id

    def _extract_species(self, dna_code: str) -> str:
        """Extract species name from DNA code"""
        # Parse DNALang to find ORGANISM name
        lines = dna_code.split('\n')
        for line in lines:
            if line.strip().startswith('ORGANISM'):
                parts = line.strip().split()
                if len(parts) >= 2:
                    return parts[1].rstrip('{').strip()
        return "unknown"

    def get_organism(self, organism_id: str) -> Optional[Organism]:
        """Get organism by ID"""
        return self.organisms.get(organism_id)

    def update_organism(
        self,
        organism_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """Update organism properties"""
        if organism_id not in self.organisms:
            return False

        organism = self.organisms[organism_id]

        # Update allowed fields
        allowed_fields = [
            'consciousness_level', 'fitness', 'circuit_qasm',
            'metadata', 'tags'
        ]

        for field in allowed_fields:
            if field in updates:
                setattr(organism, field, updates[field])

        organism.updated_at = datetime.now()

        # Update version if DNA changed
        if 'dna_code' in updates:
            organism.dna_code = updates['dna_code']
            version_parts = organism.version.split('.')
            version_parts[1] = str(int(version_parts[1]) + 1)
            organism.version = '.'.join(version_parts)

        return True

    def evolve_organism(
        self,
        parent_id: str,
        mutations: Dict[str, Any],
        author: str = "evolution"
    ) -> Optional[str]:
        """Create evolved version of organism"""

        if parent_id not in self.organisms:
            return None

        parent = self.organisms[parent_id]

        # Apply mutations to DNA
        evolved_dna = self._apply_mutations(parent.dna_code, mutations)

        # Create evolved organism
        evolved_id = self.register_organism(
            name=f"{parent.name}_gen{parent.generation + 1}",
            dna_code=evolved_dna,
            author=author,
            parent_id=parent_id,
            metadata={
                'mutations': mutations,
                'parent_fitness': parent.fitness,
                'evolution_timestamp': datetime.now().isoformat()
            }
        )

        return evolved_id

    def _apply_mutations(
        self,
        dna_code: str,
        mutations: Dict[str, Any]
    ) -> str:
        """Apply mutations to DNA code"""

        # Simple mutation application
        # In production, this would be more sophisticated
        mutated_dna = dna_code

        for mutation_type, mutation_value in mutations.items():
            if mutation_type == 'gate_substitution':
                # Replace quantum gates
                for old_gate, new_gate in mutation_value.items():
                    mutated_dna = mutated_dna.replace(old_gate, new_gate)

            elif mutation_type == 'parameter_shift':
                # Shift numerical parameters
                import re
                pattern = r'(\d+\.?\d*)'

                def shift_param(match):
                    value = float(match.group(1))
                    return str(value * mutation_value.get('factor', 1.1))

                mutated_dna = re.sub(pattern, shift_param, mutated_dna)

            elif mutation_type == 'trait_modification':
                # Modify traits
                for trait, value in mutation_value.items():
                    trait_pattern = f"{trait}:\\s*\\S+"
                    new_trait = f"{trait}: {value}"
                    mutated_dna = re.sub(trait_pattern, new_trait, mutated_dna)

        return mutated_dna

    def get_species_members(self, species: str) -> List[Organism]:
        """Get all organisms of a species"""
        organism_ids = self.species_map.get(species, [])
        return [self.organisms[oid] for oid in organism_ids if oid in self.organisms]

    def get_lineage(self, organism_id: str) -> List[Organism]:
        """Get complete lineage of an organism"""
        if organism_id not in self.organisms:
            return []

        organism = self.organisms[organism_id]
        lineage = []

        for ancestor_id in organism.lineage or []:
            if ancestor_id in self.organisms:
                lineage.append(self.organisms[ancestor_id])

        return lineage

    def get_descendants(self, organism_id: str) -> List[Organism]:
        """Get all descendants of an organism"""
        descendants = []

        def collect_descendants(parent_id):
            if parent_id in self.evolution_tree:
                for child_id in self.evolution_tree[parent_id]:
                    if child_id in self.organisms:
                        descendants.append(self.organisms[child_id])
                        collect_descendants(child_id)

        collect_descendants(organism_id)
        return descendants

    def search_organisms(
        self,
        query: Optional[str] = None,
        min_fitness: Optional[float] = None,
        max_generation: Optional[int] = None,
        tags: Optional[List[str]] = None,
        author: Optional[str] = None
    ) -> List[Organism]:
        """Search organisms with filters"""

        results = []

        for organism in self.organisms.values():
            # Text search in name and DNA
            if query:
                if query.lower() not in organism.name.lower() and \
                   query.lower() not in organism.dna_code.lower():
                    continue

            # Fitness filter
            if min_fitness is not None and organism.fitness < min_fitness:
                continue

            # Generation filter
            if max_generation is not None and organism.generation > max_generation:
                continue

            # Tag filter
            if tags:
                if not organism.tags or not any(tag in organism.tags for tag in tags):
                    continue

            # Author filter
            if author and organism.author != author:
                continue

            results.append(organism)

        # Sort by fitness (highest first)
        results.sort(key=lambda x: x.fitness, reverse=True)

        return results

    def get_top_organisms(
        self,
        limit: int = 10,
        metric: str = "fitness"
    ) -> List[Organism]:
        """Get top organisms by metric"""

        organisms = list(self.organisms.values())

        if metric == "fitness":
            organisms.sort(key=lambda x: x.fitness, reverse=True)
        elif metric == "consciousness":
            organisms.sort(key=lambda x: x.consciousness_level, reverse=True)
        elif metric == "generation":
            organisms.sort(key=lambda x: x.generation, reverse=True)
        elif metric == "recent":
            organisms.sort(key=lambda x: x.updated_at, reverse=True)

        return organisms[:limit]

    def calculate_diversity_index(self) -> float:
        """Calculate diversity index of organism population"""

        if not self.organisms:
            return 0.0

        # Shannon diversity index based on species
        species_counts = {}
        total = len(self.organisms)

        for species, members in self.species_map.items():
            species_counts[species] = len(members)

        # Calculate Shannon index
        diversity = 0
        for count in species_counts.values():
            if count > 0:
                proportion = count / total
                diversity -= proportion * np.log(proportion)

        # Normalize to 0-1 scale
        max_diversity = np.log(len(species_counts)) if len(species_counts) > 1 else 1
        normalized_diversity = diversity / max_diversity if max_diversity > 0 else 0

        return normalized_diversity

    def export_organism(self, organism_id: str) -> Optional[Dict[str, Any]]:
        """Export organism data for sharing"""

        if organism_id not in self.organisms:
            return None

        organism = self.organisms[organism_id]

        return {
            'organism': organism.to_dict(),
            'lineage': [o.to_dict() for o in self.get_lineage(organism_id)],
            'hash': organism.calculate_hash(),
            'export_timestamp': datetime.now().isoformat(),
            'format_version': '1.0'
        }

    def import_organism(
        self,
        organism_data: Dict[str, Any],
        preserve_lineage: bool = False
    ) -> Optional[str]:
        """Import organism from exported data"""

        try:
            org_data = organism_data['organism']

            # Create new organism
            organism_id = self.register_organism(
                name=org_data['name'],
                dna_code=org_data['dna_code'],
                author=org_data.get('author', 'imported'),
                metadata=org_data.get('metadata', {})
            )

            # Update properties
            if organism_id:
                self.update_organism(organism_id, {
                    'consciousness_level': org_data.get('consciousness_level', 0),
                    'fitness': org_data.get('fitness', 0),
                    'circuit_qasm': org_data.get('circuit_qasm'),
                    'tags': org_data.get('tags', [])
                })

                # Import lineage if requested
                if preserve_lineage and 'lineage' in organism_data:
                    for ancestor_data in organism_data['lineage']:
                        self.import_organism({'organism': ancestor_data}, False)

            return organism_id

        except Exception as e:
            print(f"Import failed: {e}")
            return None

    def get_statistics(self) -> Dict[str, Any]:
        """Get registry statistics"""

        organisms = list(self.organisms.values())

        if not organisms:
            return {
                'total_organisms': 0,
                'species_count': 0,
                'diversity_index': 0
            }

        return {
            'total_organisms': len(organisms),
            'species_count': len(self.species_map),
            'average_fitness': np.mean([o.fitness for o in organisms]),
            'max_fitness': max(o.fitness for o in organisms),
            'average_generation': np.mean([o.generation for o in organisms]),
            'max_generation': max(o.generation for o in organisms),
            'average_consciousness': np.mean([o.consciousness_level for o in organisms]),
            'diversity_index': self.calculate_diversity_index(),
            'authors': list(set(o.author for o in organisms)),
            'total_lineages': len(self.evolution_tree)
        }