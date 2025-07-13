import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, Crown, Shield, Edit, Eye, Trash2, UserPlus, X, User } from 'lucide-react';
import { Team, TeamMember, UserTeamInfo, TeamRole } from '../types';
import { teamService } from '../services/teamService';
import { userService, User as UserType } from '../services/userService';

interface TeamManagementProps {
  onViewChange: (view: string) => void;
  onTeamSelect: (teamInfo: UserTeamInfo | null) => void;
  currentTeam: UserTeamInfo | null;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ onViewChange, onTeamSelect, currentTeam }) => {
  const [userTeams, setUserTeams] = useState<UserTeamInfo[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserAdmin, setShowUserAdmin] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamRole>('viewer');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentTeam) {
      loadTeamDetails();
    }
  }, [currentTeam]);

  const loadData = async () => {
    try {
      setError(null);
      const [teams, users] = await Promise.all([
        teamService.getUserTeams(),
        userService.getAllUsers()
      ]);
      setUserTeams(teams);
      setAllUsers(users);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async () => {
    if (!currentTeam) return;

    try {
      const members = await teamService.getTeamMembers(currentTeam.team.id);
      setTeamMembers(members);
    } catch (err) {
      console.error('Error loading team details:', err);
      setError('Failed to load team details');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await teamService.createTeam(newTeamName, newTeamDescription);
      setNewTeamName('');
      setNewTeamDescription('');
      setShowCreateTeam(false);
      await loadData();
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await userService.createUser(newUserEmail, newUserPassword);
      setNewUserEmail('');
      setNewUserPassword('');
      setShowCreateUser(false);
      await loadData();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
    }
  };

  const handleAddUserToTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !selectedUserId) return;

    try {
      setError(null);
      await teamService.addUserToTeam(currentTeam.team.id, selectedUserId, selectedRole);
      setSelectedUserId('');
      setSelectedRole('viewer');
      setShowAddUser(false);
      await loadTeamDetails();
    } catch (err) {
      console.error('Error adding user to team:', err);
      setError('Failed to add user to team');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: TeamRole) => {
    try {
      setError(null);
      await teamService.updateMemberRole(memberId, role);
      await loadTeamDetails();
    } catch (err) {
      console.error('Error updating member role:', err);
      setError('Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      setError(null);
      await teamService.removeMember(memberId);
      await loadTeamDetails();
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      setError(null);
      await userService.deleteUser(userId);
      await loadData();
      if (currentTeam) {
        await loadTeamDetails();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'editor': return <Edit className="h-4 w-4 text-green-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-slate-600" />;
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-slate-100 text-slate-800';
    }
  };

  const canManageTeam = (role: TeamRole) => ['owner', 'admin'].includes(role);

  // Get available users (not already in the current team)
  const availableUsers = allUsers.filter(user => 
    !teamMembers.some(member => member.user_id === user.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Team Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUserAdmin(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <User className="h-4 w-4 mr-2" />
            User Admin
          </button>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </button>
          <button
            onClick={() => onViewChange('dashboard')}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Team Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Your Teams</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Personal Account */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                !currentTeam 
                  ? 'border-slate-700 bg-slate-50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => onTeamSelect(null)}
            >
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-slate-600 mr-2" />
                <h4 className="font-medium text-slate-800">Personal Account</h4>
              </div>
              <p className="text-sm text-slate-600">Your individual jobs and data</p>
            </div>

            {/* Team Accounts */}
            {userTeams.map((teamInfo) => (
              <div
                key={teamInfo.team.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentTeam?.team.id === teamInfo.team.id
                    ? 'border-slate-700 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => onTeamSelect(teamInfo)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-slate-600 mr-2" />
                    <h4 className="font-medium text-slate-800">{teamInfo.team.name}</h4>
                  </div>
                  <div className="flex items-center">
                    {getRoleIcon(teamInfo.role)}
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  {teamInfo.team.description || 'No description'}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(teamInfo.role)}`}>
                    {teamInfo.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Details */}
      {currentTeam && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">
              {currentTeam.team.name} - Team Members
            </h3>
            {canManageTeam(currentTeam.role) && (
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </button>
            )}
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      {getRoleIcon(member.role)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{member.user?.email || 'Unknown User'}</p>
                      <p className="text-sm text-slate-600">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                    {canManageTeam(currentTeam.role) && member.role !== 'owner' && (
                      <div className="flex space-x-2">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as TeamRole)}
                          className="text-xs px-2 py-1 border border-slate-300 rounded"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Admin Modal */}
      {showUserAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">User Administration</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create User
                </button>
                <button
                  onClick={() => setShowUserAdmin(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{user.email}</p>
                      <p className="text-sm text-slate-600">
                        Created {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Create New User</h3>
              <button
                onClick={() => setShowCreateUser(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Enter password"
                  minLength={6}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Create New Team</h3>
              <button
                onClick={() => setShowCreateTeam(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Describe your team..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User to Team Modal */}
      {showAddUser && currentTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Add User to Team</h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddUserToTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select User *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a user...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer - Can view jobs and reports</option>
                  <option value="editor">Editor - Can create and edit jobs</option>
                  <option value="admin">Admin - Can manage team and jobs</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors duration-200"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;