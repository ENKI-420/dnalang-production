"""Team Collaboration Features for DNALang"""

import uuid
from typing import Dict, List, Optional, Any, Set
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum

from ..config import settings


class Role(Enum):
    """Team member roles"""
    ADMIN = "admin"
    DEVELOPER = "developer"
    RESEARCHER = "researcher"
    VIEWER = "viewer"


class Permission(Enum):
    """System permissions"""
    CREATE_ORGANISM = "create_organism"
    EDIT_ORGANISM = "edit_organism"
    DELETE_ORGANISM = "delete_organism"
    EXECUTE_QUANTUM = "execute_quantum"
    VIEW_RESULTS = "view_results"
    MANAGE_TEAM = "manage_team"
    ACCESS_BILLING = "access_billing"
    SHARE_ORGANISM = "share_organism"


@dataclass
class TeamMember:
    """Team member definition"""
    id: str
    email: str
    name: str
    role: Role
    permissions: Set[Permission]
    joined_at: datetime
    last_active: datetime
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['role'] = self.role.value
        data['permissions'] = [p.value for p in self.permissions]
        data['joined_at'] = self.joined_at.isoformat()
        data['last_active'] = self.last_active.isoformat()
        return data


@dataclass
class Team:
    """Team definition"""
    id: str
    name: str
    created_at: datetime
    owner_id: str
    members: List[TeamMember]
    settings: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        data['members'] = [m.to_dict() for m in self.members]
        return data


@dataclass
class SharedResource:
    """Shared resource (organism, circuit, etc.)"""
    id: str
    resource_type: str  # organism, circuit, dataset
    resource_id: str
    owner_id: str
    team_id: str
    shared_at: datetime
    permissions: Set[Permission]
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class Comment:
    """Comment on shared resource"""
    id: str
    resource_id: str
    author_id: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    parent_id: Optional[str] = None  # For threaded comments


class TeamManager:
    """Manage team collaboration features"""

    # Role-based default permissions
    ROLE_PERMISSIONS = {
        Role.ADMIN: {
            Permission.CREATE_ORGANISM,
            Permission.EDIT_ORGANISM,
            Permission.DELETE_ORGANISM,
            Permission.EXECUTE_QUANTUM,
            Permission.VIEW_RESULTS,
            Permission.MANAGE_TEAM,
            Permission.ACCESS_BILLING,
            Permission.SHARE_ORGANISM
        },
        Role.DEVELOPER: {
            Permission.CREATE_ORGANISM,
            Permission.EDIT_ORGANISM,
            Permission.EXECUTE_QUANTUM,
            Permission.VIEW_RESULTS,
            Permission.SHARE_ORGANISM
        },
        Role.RESEARCHER: {
            Permission.CREATE_ORGANISM,
            Permission.EXECUTE_QUANTUM,
            Permission.VIEW_RESULTS,
            Permission.SHARE_ORGANISM
        },
        Role.VIEWER: {
            Permission.VIEW_RESULTS
        }
    }

    def __init__(self):
        self.teams: Dict[str, Team] = {}
        self.members: Dict[str, TeamMember] = {}
        self.shared_resources: Dict[str, SharedResource] = {}
        self.comments: Dict[str, List[Comment]] = {}
        self.activity_log: List[Dict[str, Any]] = []

    def create_team(
        self,
        name: str,
        owner_email: str,
        owner_name: str
    ) -> str:
        """Create a new team"""

        team_id = str(uuid.uuid4())
        owner_id = str(uuid.uuid4())
        now = datetime.now()

        # Create owner as admin
        owner = TeamMember(
            id=owner_id,
            email=owner_email,
            name=owner_name,
            role=Role.ADMIN,
            permissions=self.ROLE_PERMISSIONS[Role.ADMIN],
            joined_at=now,
            last_active=now
        )

        # Create team
        team = Team(
            id=team_id,
            name=name,
            created_at=now,
            owner_id=owner_id,
            members=[owner],
            settings={
                'quantum_backends': settings.FALLBACK_BACKENDS,
                'max_shots': 1024,
                'auto_evolution': True,
                'sharing_enabled': True
            }
        )

        self.teams[team_id] = team
        self.members[owner_id] = owner

        self._log_activity(
            'team_created',
            team_id,
            owner_id,
            {'team_name': name}
        )

        return team_id

    def add_member(
        self,
        team_id: str,
        email: str,
        name: str,
        role: Role,
        added_by: str
    ) -> Optional[str]:
        """Add member to team"""

        if team_id not in self.teams:
            return None

        team = self.teams[team_id]

        # Check if adder has permission
        adder = self._get_member(team, added_by)
        if not adder or Permission.MANAGE_TEAM not in adder.permissions:
            return None

        # Create new member
        member_id = str(uuid.uuid4())
        now = datetime.now()

        member = TeamMember(
            id=member_id,
            email=email,
            name=name,
            role=role,
            permissions=self.ROLE_PERMISSIONS[role],
            joined_at=now,
            last_active=now
        )

        team.members.append(member)
        self.members[member_id] = member

        self._log_activity(
            'member_added',
            team_id,
            added_by,
            {'member_id': member_id, 'role': role.value}
        )

        return member_id

    def remove_member(
        self,
        team_id: str,
        member_id: str,
        removed_by: str
    ) -> bool:
        """Remove member from team"""

        if team_id not in self.teams:
            return False

        team = self.teams[team_id]

        # Check permissions
        remover = self._get_member(team, removed_by)
        if not remover or Permission.MANAGE_TEAM not in remover.permissions:
            return False

        # Cannot remove owner
        if member_id == team.owner_id:
            return False

        # Remove member
        team.members = [m for m in team.members if m.id != member_id]

        if member_id in self.members:
            del self.members[member_id]

        self._log_activity(
            'member_removed',
            team_id,
            removed_by,
            {'member_id': member_id}
        )

        return True

    def update_member_role(
        self,
        team_id: str,
        member_id: str,
        new_role: Role,
        updated_by: str
    ) -> bool:
        """Update member's role"""

        if team_id not in self.teams:
            return False

        team = self.teams[team_id]

        # Check permissions
        updater = self._get_member(team, updated_by)
        if not updater or Permission.MANAGE_TEAM not in updater.permissions:
            return False

        # Find and update member
        for member in team.members:
            if member.id == member_id:
                member.role = new_role
                member.permissions = self.ROLE_PERMISSIONS[new_role]

                self._log_activity(
                    'role_updated',
                    team_id,
                    updated_by,
                    {'member_id': member_id, 'new_role': new_role.value}
                )

                return True

        return False

    def share_resource(
        self,
        team_id: str,
        resource_type: str,
        resource_id: str,
        shared_by: str,
        permissions: Optional[Set[Permission]] = None
    ) -> Optional[str]:
        """Share a resource with team"""

        if team_id not in self.teams:
            return None

        team = self.teams[team_id]

        # Check if sharer has permission
        sharer = self._get_member(team, shared_by)
        if not sharer or Permission.SHARE_ORGANISM not in sharer.permissions:
            return None

        # Default permissions
        if permissions is None:
            permissions = {Permission.VIEW_RESULTS}

        # Create shared resource
        share_id = str(uuid.uuid4())

        shared_resource = SharedResource(
            id=share_id,
            resource_type=resource_type,
            resource_id=resource_id,
            owner_id=shared_by,
            team_id=team_id,
            shared_at=datetime.now(),
            permissions=permissions
        )

        self.shared_resources[share_id] = shared_resource

        self._log_activity(
            'resource_shared',
            team_id,
            shared_by,
            {
                'resource_type': resource_type,
                'resource_id': resource_id,
                'share_id': share_id
            }
        )

        return share_id

    def unshare_resource(
        self,
        share_id: str,
        unshared_by: str
    ) -> bool:
        """Unshare a resource"""

        if share_id not in self.shared_resources:
            return False

        shared_resource = self.shared_resources[share_id]

        # Check if unsharer is owner or admin
        team = self.teams.get(shared_resource.team_id)
        if not team:
            return False

        unsharer = self._get_member(team, unshared_by)
        if not unsharer:
            return False

        if (shared_resource.owner_id != unshared_by and
            Permission.MANAGE_TEAM not in unsharer.permissions):
            return False

        # Remove share
        del self.shared_resources[share_id]

        self._log_activity(
            'resource_unshared',
            shared_resource.team_id,
            unshared_by,
            {'share_id': share_id}
        )

        return True

    def add_comment(
        self,
        resource_id: str,
        author_id: str,
        content: str,
        parent_id: Optional[str] = None
    ) -> str:
        """Add comment to shared resource"""

        comment_id = str(uuid.uuid4())

        comment = Comment(
            id=comment_id,
            resource_id=resource_id,
            author_id=author_id,
            content=content,
            created_at=datetime.now(),
            parent_id=parent_id
        )

        if resource_id not in self.comments:
            self.comments[resource_id] = []

        self.comments[resource_id].append(comment)

        self._log_activity(
            'comment_added',
            None,
            author_id,
            {'resource_id': resource_id, 'comment_id': comment_id}
        )

        return comment_id

    def get_team_resources(
        self,
        team_id: str,
        resource_type: Optional[str] = None
    ) -> List[SharedResource]:
        """Get all resources shared with team"""

        resources = []

        for shared_resource in self.shared_resources.values():
            if shared_resource.team_id == team_id:
                if resource_type and shared_resource.resource_type != resource_type:
                    continue
                resources.append(shared_resource)

        return resources

    def get_member_permissions(
        self,
        team_id: str,
        member_id: str
    ) -> Set[Permission]:
        """Get member's permissions in team"""

        if team_id not in self.teams:
            return set()

        team = self.teams[team_id]
        member = self._get_member(team, member_id)

        if member:
            return member.permissions

        return set()

    def check_permission(
        self,
        team_id: str,
        member_id: str,
        permission: Permission
    ) -> bool:
        """Check if member has specific permission"""

        permissions = self.get_member_permissions(team_id, member_id)
        return permission in permissions

    def get_team_activity(
        self,
        team_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get team activity log"""

        activities = [
            a for a in self.activity_log
            if a['team_id'] == team_id
        ]

        return activities[-limit:]

    def get_team_statistics(
        self,
        team_id: str
    ) -> Dict[str, Any]:
        """Get team statistics"""

        if team_id not in self.teams:
            return {}

        team = self.teams[team_id]

        # Count resources by type
        resource_counts = {}
        for shared in self.shared_resources.values():
            if shared.team_id == team_id:
                if shared.resource_type not in resource_counts:
                    resource_counts[shared.resource_type] = 0
                resource_counts[shared.resource_type] += 1

        # Count comments
        total_comments = sum(
            len(comments)
            for resource_id, comments in self.comments.items()
            if any(
                s.resource_id == resource_id
                for s in self.shared_resources.values()
                if s.team_id == team_id
            )
        )

        return {
            'team_id': team_id,
            'team_name': team.name,
            'member_count': len(team.members),
            'role_distribution': self._get_role_distribution(team),
            'shared_resources': resource_counts,
            'total_comments': total_comments,
            'created_at': team.created_at.isoformat(),
            'activity_count': len([
                a for a in self.activity_log
                if a['team_id'] == team_id
            ])
        }

    def _get_member(
        self,
        team: Team,
        member_id: str
    ) -> Optional[TeamMember]:
        """Get member from team"""
        for member in team.members:
            if member.id == member_id:
                return member
        return None

    def _get_role_distribution(
        self,
        team: Team
    ) -> Dict[str, int]:
        """Get role distribution in team"""

        distribution = {}
        for member in team.members:
            role_name = member.role.value
            if role_name not in distribution:
                distribution[role_name] = 0
            distribution[role_name] += 1

        return distribution

    def _log_activity(
        self,
        action: str,
        team_id: Optional[str],
        actor_id: str,
        details: Dict[str, Any]
    ):
        """Log team activity"""

        activity = {
            'timestamp': datetime.now().isoformat(),
            'action': action,
            'team_id': team_id,
            'actor_id': actor_id,
            'details': details
        }

        self.activity_log.append(activity)

        # Keep only recent activities
        if len(self.activity_log) > 10000:
            self.activity_log = self.activity_log[-10000:]

    def export_team_data(
        self,
        team_id: str
    ) -> Optional[Dict[str, Any]]:
        """Export all team data"""

        if team_id not in self.teams:
            return None

        team = self.teams[team_id]

        return {
            'team': team.to_dict(),
            'shared_resources': [
                asdict(r) for r in self.shared_resources.values()
                if r.team_id == team_id
            ],
            'activity': self.get_team_activity(team_id, 100),
            'statistics': self.get_team_statistics(team_id),
            'exported_at': datetime.now().isoformat()
        }