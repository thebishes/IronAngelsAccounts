import { supabase } from '../lib/supabase';
import { Team, TeamMember, TeamInvitation, UserTeamInfo, TeamRole } from '../types';
import { Database } from '../lib/database.types';

type TeamRow = Database['public']['Tables']['teams']['Row'];
type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];
type TeamInvitationRow = Database['public']['Tables']['team_invitations']['Row'];

export const teamService = {
  // Get all teams for current user
  async getUserTeams(): Promise<UserTeamInfo[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get teams where user is owner
    const { data: ownedTeams, error: ownedError } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', user.id);

    if (ownedError) throw ownedError;

    // Get teams where user is a member
    const { data: memberTeams, error: memberError } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        teams (*)
      `)
      .eq('user_id', user.id);

    if (memberError) throw memberError;

    const userTeams: UserTeamInfo[] = [];

    // Add owned teams
    ownedTeams.forEach(team => {
      userTeams.push({
        team,
        role: 'owner' as TeamRole,
        member_id: team.id // Use team id as member id for owners
      });
    });

    // Add member teams
    memberTeams.forEach(member => {
      if (member.teams) {
        userTeams.push({
          team: member.teams as Team,
          role: member.role as TeamRole,
          member_id: member.id
        });
      }
    });

    return userTeams;
  },

  // Create a new team
  async createTeam(name: string, description?: string): Promise<Team> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        description,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update team
  async updateTeam(teamId: string, updates: Partial<Pick<Team, 'name' | 'description'>>): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete team
  async deleteTeam(teamId: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
  },

  // Get team members
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:user_id (email)
      `)
      .eq('team_id', teamId);

    if (error) throw error;

    return data.map(member => ({
      ...member,
      user: member.user ? { email: (member.user as any).email } : undefined
    }));
  },

  // Invite user to team
  async inviteToTeam(teamId: string, email: string, role: TeamRole = 'viewer'): Promise<TeamInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        email,
        role,
        invited_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get team invitations
  async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', teamId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;
    return data;
  },

  // Accept team invitation
  async acceptInvitation(invitationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('email', user.email)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError) throw inviteError;
    if (!invitation) throw new Error('Invalid or expired invitation');

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: invitation.team_id,
        user_id: user.id,
        role: invitation.role
      });

    if (memberError) throw memberError;

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitationId);

    if (updateError) throw updateError;
  },

  // Update team member role
  async updateMemberRole(memberId: string, role: TeamRole): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', memberId);

    if (error) throw error;
  },

  // Remove team member
  async removeMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
  },

  // Cancel invitation
  async cancelInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) throw error;
  },

  // Get user's pending invitations
  async getUserInvitations(): Promise<TeamInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        teams (name)
      `)
      .eq('email', user.email)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;
    return data;
  }
};