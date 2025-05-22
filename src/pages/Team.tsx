
import { useState } from 'react';
import { Search, Filter, Settings } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  loginStatus: 'active' | 'inactive' | 'deactivated';
  lastLogin: string;
  avatar?: string;
  initials: string;
}

// Mock data - would be fetched from API in real implementation
const teamData: TeamMember[] = [
  {
    id: '1',
    name: 'David Rodriguez',
    role: 'Restaurant Manager',
    email: 'david.r@xpressdine.com',
    phone: '(555) 123-4567',
    loginStatus: 'active',
    lastLogin: '2025-05-22T09:30:00',
    initials: 'DR'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Head Chef',
    email: 'maria.g@xpressdine.com',
    phone: '(555) 234-5678',
    loginStatus: 'active',
    lastLogin: '2025-05-22T08:15:00',
    initials: 'MG'
  },
  {
    id: '3',
    name: 'James Wilson',
    role: 'Sous Chef',
    email: 'james.w@xpressdine.com',
    phone: '(555) 345-6789',
    loginStatus: 'inactive',
    lastLogin: '2025-05-21T17:45:00',
    initials: 'JW'
  },
  {
    id: '4',
    name: 'Sophie Chen',
    role: 'Host',
    email: 'sophie.c@xpressdine.com',
    phone: '(555) 456-7890',
    loginStatus: 'active',
    lastLogin: '2025-05-22T10:00:00',
    initials: 'SC'
  },
  {
    id: '5',
    name: 'Robert Johnson',
    role: 'Waiter',
    email: 'robert.j@xpressdine.com',
    phone: '(555) 567-8901',
    loginStatus: 'inactive',
    lastLogin: '2025-05-20T19:20:00',
    initials: 'RJ'
  },
  {
    id: '6',
    name: 'Lisa Brown',
    role: 'Waitress',
    email: 'lisa.b@xpressdine.com',
    phone: '(555) 678-9012',
    loginStatus: 'deactivated',
    lastLogin: '2025-05-15T16:30:00',
    initials: 'LB'
  },
  {
    id: '7',
    name: 'Carlos Mendez',
    role: 'Bartender',
    email: 'carlos.m@xpressdine.com',
    phone: '(555) 789-0123',
    loginStatus: 'active',
    lastLogin: '2025-05-22T11:10:00',
    initials: 'CM'
  }
];

export default function Team() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter team members based on search term and filters
  const filteredTeamMembers = teamData.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || member.role === roleFilter;
    const matchesStatus = !statusFilter || member.loginStatus === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-amber-500';
      case 'deactivated': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Not logged in';
      case 'deactivated': return 'Deactivated';
      default: return status;
    }
  };

  // Get unique roles for filter
  const roles = Array.from(new Set(teamData.map(member => member.role)));

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <Button variant="default">Add Team Member</Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center max-w-sm w-full">
            <Input
              placeholder="Search by name, role or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mr-2"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {roleFilter ? `Role: ${roleFilter}` : 'Filter by role'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <div className="p-2 space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setRoleFilter(null)}
                  >
                    All roles
                  </Button>
                  {roles.map(role => (
                    <Button 
                      key={role}
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setRoleFilter(role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {statusFilter ? `Status: ${statusFilter}` : 'Filter by status'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <div className="p-2 space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setStatusFilter(null)}
                  >
                    All statuses
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setStatusFilter('active')}
                  >
                    Active
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setStatusFilter('inactive')}
                  >
                    Not logged in
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setStatusFilter('deactivated')}
                  >
                    Deactivated
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeamMembers.length > 0 ? (
                filteredTeamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {member.avatar ? (
                            <AvatarImage src={member.avatar} alt={member.name} />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member.initials}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        {member.name}
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{member.phone}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(member.loginStatus)}`}></div>
                        <span>{getStatusText(member.loginStatus)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(member.lastLogin).toLocaleString(undefined, { 
                        dateStyle: 'short', 
                        timeStyle: 'short' 
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No team members found matching your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
