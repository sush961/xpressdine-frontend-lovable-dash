const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xpressdine-backend.vercel.app/api';

export interface TeamMember {
  _id: string;
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  loginStatus: 'active' | 'inactive' | 'deactivated';
  lastLogin: string;
  initials: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamMemberData {
  name: string;
  role: string;
  email: string;
  phone?: string;
  loginStatus?: 'active' | 'inactive' | 'deactivated';
  avatar?: string;
}

export interface UpdateTeamMemberData extends CreateTeamMemberData {
  _id: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  deactivatedMembers: number;
  roleDistribution: Array<{ _id: string; count: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  error?: string;
}

class TeamService {
  private async fetchWithErrorHandling<T>(
    url: string, 
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getAllTeamMembers(params?: {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<TeamMember[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/team${queryString ? `?${queryString}` : ''}`;

    return this.fetchWithErrorHandling<TeamMember[]>(url);
  }

  async getTeamMemberById(id: string): Promise<ApiResponse<TeamMember>> {
    return this.fetchWithErrorHandling<TeamMember>(`${API_BASE_URL}/team/${id}`);
  }

  async createTeamMember(memberData: CreateTeamMemberData): Promise<ApiResponse<TeamMember>> {
    return this.fetchWithErrorHandling<TeamMember>(`${API_BASE_URL}/team`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateTeamMember(
    id: string, 
    memberData: Partial<CreateTeamMemberData>
  ): Promise<ApiResponse<TeamMember>> {
    return this.fetchWithErrorHandling<TeamMember>(`${API_BASE_URL}/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async updateTeamMemberStatus(
    id: string, 
    loginStatus: 'active' | 'inactive' | 'deactivated'
  ): Promise<ApiResponse<TeamMember>> {
    return this.fetchWithErrorHandling<TeamMember>(`${API_BASE_URL}/team/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ loginStatus }),
    });
  }

  async deleteTeamMember(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithErrorHandling<void>(`${API_BASE_URL}/team/${id}`, {
      method: 'DELETE',
    });
  }

  async getTeamStats(): Promise<ApiResponse<TeamStats>> {
    return this.fetchWithErrorHandling<TeamStats>(`${API_BASE_URL}/team/stats/overview`);
  }
}

export const teamService = new TeamService();
