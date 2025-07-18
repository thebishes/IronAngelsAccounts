export interface JobItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Job {
  id: string;
  clientName: string;
  date: string;
  type: 'ironing' | 'cleaning' | 'both';
  items: JobItem[];
  total: number;
  status: 'completed' | 'pending' | 'invoiced';
  notes?: string;
  createdAt: string;
  invoiceNumber?: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  clientName?: string;
  type?: 'ironing' | 'cleaning' | 'both' | 'all';
  status?: 'completed' | 'pending' | 'invoiced' | 'all';
}

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  user?: {
    email: string;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface UserTeamInfo {
  team: Team;
  role: TeamRole;
  member_id: string;
}