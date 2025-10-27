import { executeExternalQuery } from '../lib/externalPostgres';
import { Team, TeamMember, UserTeamInfo, TeamRole } from '../types';
import { authService } from './authService';

interface TeamRow {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
}

interface UserRow {
  id: string;
  email: string;
}

export const teamService = {
  async getUserTeams(): Promise<UserTeamInfo[]> {
    const { user } = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const ownedTeamsResult = await executeExternalQuery<TeamRow>(
      'SELECT * FROM teams WHERE owner_id = $1',
      [user.id]
    );

    const memberTeamsResult = await executeExternalQuery<TeamMemberRow & { team_name: string; team_description: string | null; team_owner_id: string; team_created_at: string; team_updated_at: string }>(
      `SELECT tm.id, tm.team_id, tm.user_id, tm.role, tm.joined_at,
              t.name as team_name, t.description as team_description,
              t.owner_id as team_owner_id, t.created_at as team_created_at,
              t.updated_at as team_updated_at
       FROM team_members tm
       JOIN teams t ON tm.team_id = t.id
       WHERE tm.user_id = $1`,
      [user.id]
    );

    const userTeams: UserTeamInfo[] = [];
    const addedTeamIds = new Set<string>();

    if (ownedTeamsResult.success && ownedTeamsResult.data) {
      ownedTeamsResult.data.forEach(team => {
        userTeams.push({
          team,
          role: 'owner' as TeamRole,
          member_id: team.id
        });
        addedTeamIds.add(team.id);
      });
    }

    if (memberTeamsResult.success && memberTeamsResult.data) {
      memberTeamsResult.data.forEach(member => {
        if (!addedTeamIds.has(member.team_id)) {
          userTeams.push({
            team: {
              id: member.team_id,
              name: member.team_name,
              description: member.team_description,
              owner_id: member.team_owner_id,
              created_at: member.team_created_at,
              updated_at: member.team_updated_at
            },
            role: member.role,
            member_id: member.id
          });
          addedTeamIds.add(member.team_id);
        }
      });
    }

    return userTeams;
  },

  async createTeam(name: string, description?: string): Promise<Team> {
    const { user } = await authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const result = await executeExternalQuery<TeamRow>(
      `INSERT INTO teams (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, user.id]
    );

    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error(result.error || 'Failed to create team');
    }

    return result.data[0];
  },

  async updateTeam(teamId: string, updates: Partial<Pick<Team, 'name' | 'description'>>): Promise<Team> {
    const setParts: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setParts.push(`name = $${paramIndex++}`);
      params.push(updates.name);
    }

    if (updates.description !== undefined) {
      setParts.push(`description = $${paramIndex++}`);
      params.push(updates.description);
    }

    setParts.push(`updated_at = NOW()`);
    params.push(teamId);

    const result = await executeExternalQuery<TeamRow>(
      `UPDATE teams SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error(result.error || 'Failed to update team');
    }

    return result.data[0];
  },

  async deleteTeam(teamId: string): Promise<void> {
    const result = await executeExternalQuery(
      'DELETE FROM teams WHERE id = $1',
      [teamId]
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete team');
    }
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const membersResult = await executeExternalQuery<TeamMemberRow>(
      'SELECT * FROM team_members WHERE team_id = $1',
      [teamId]
    );

    if (!membersResult.success || !membersResult.data || membersResult.data.length === 0) {
      return [];
    }

    const userIds = membersResult.data.map(m => m.user_id);
    const usersResult = await executeExternalQuery<UserRow>(
      `SELECT id, email FROM users WHERE id = ANY($1)`,
      [userIds]
    );

    const users = usersResult.success && usersResult.data ? usersResult.data : [];

    return membersResult.data.map(member => ({
      ...member,
      user: users.find(u => u.id === member.user_id)
    }));
  },

  async addUserToTeam(teamId: string, userId: string, role: TeamRole = 'viewer'): Promise<TeamMember> {
    const result = await executeExternalQuery<TeamMemberRow>(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [teamId, userId, role]
    );

    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error(result.error || 'Failed to add user to team');
    }

    return result.data[0];
  },

  async updateMemberRole(memberId: string, role: TeamRole): Promise<void> {
    const result = await executeExternalQuery(
      'UPDATE team_members SET role = $1 WHERE id = $2',
      [role, memberId]
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to update member role');
    }
  },

  async removeMember(memberId: string): Promise<void> {
    const result = await executeExternalQuery(
      'DELETE FROM team_members WHERE id = $1',
      [memberId]
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to remove member');
    }
  }
};
