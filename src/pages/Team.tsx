
import { useState } from 'react';
import { Search, Filter, Settings, Plus, FileText } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(teamData);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Waiter',
    email: '',
    phone: '',
    loginStatus: 'inactive' as 'active' | 'inactive' | 'deactivated'
  });
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Filter team members based on search term and filters
  const filteredTeamMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || member.role === roleFilter;
    const matchesStatus = !statusFilter || member.loginStatus === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get unique roles for filter
  const roles = Array.from(new Set(members.map(member => member.role)));

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    // Generate initials from name
    const initials = newMember.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substr(0, 2);

    const newId = (members.length + 1).toString();
    
    const memberToAdd: TeamMember = {
      id: newId,
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      phone: newMember.phone,
      loginStatus: newMember.loginStatus,
      lastLogin: new Date().toISOString(),
      initials: initials
    };

    setMembers([...members, memberToAdd]);
    setIsAddMemberOpen(false);
    setNewMember({
      name: '',
      role: 'Waiter',
      email: '',
      phone: '',
      loginStatus: 'inactive'
    });
    
    toast({
      title: "Team member added",
      description: `${newMember.name} has been successfully added.`
    });
  };
  
  const handleEditMember = () => {
    if (!selectedMember) return;
    
    const updatedMembers = members.map(member => {
      if (member.id === selectedMember.id) {
        return selectedMember;
      }
      return member;
    });

    setMembers(updatedMembers);
    setIsEditMemberOpen(false);
    
    toast({
      title: "Team member updated",
      description: `${selectedMember.name}'s information has been successfully updated.`
    });
  };
  
  const handleMemberStatusChange = (memberId: string, status: 'active' | 'inactive' | 'deactivated') => {
    const updatedMembers = members.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          loginStatus: status,
          ...(status === 'active' ? { lastLogin: new Date().toISOString() } : {})
        };
      }
      return member;
    });
    
    setMembers(updatedMembers);
    
    toast({
      title: "Status updated",
      description: `Team member status changed to ${status}.`
    });
  };
  
  const handleExport = () => {
    // Mock CSV export functionality
    const headers = ['ID', 'Name', 'Role', 'Email', 'Phone', 'Status', 'Last Login'];
    const csvContent = [
      headers.join(','),
      ...filteredTeamMembers.map(member => [
        member.id,
        member.name,
        member.role,
        member.email,
        member.phone,
        member.loginStatus,
        new Date(member.lastLogin).toLocaleString()
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'team_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export successful",
      description: "Team member data has been exported to CSV."
    });
    
    setIsExportDialogOpen(false);
  };

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

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExportDialogOpen(true)}
              className="hidden sm:flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Team Member</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-name">Name</Label>
                    <Input 
                      id="member-name" 
                      value={newMember.name} 
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-role">Role</Label>
                    <select 
                      id="member-role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      value={newMember.role}
                      onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                    >
                      <option value="Restaurant Manager">Restaurant Manager</option>
                      <option value="Head Chef">Head Chef</option>
                      <option value="Sous Chef">Sous Chef</option>
                      <option value="Host">Host</option>
                      <option value="Waiter">Waiter</option>
                      <option value="Waitress">Waitress</option>
                      <option value="Bartender">Bartender</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-email">Email</Label>
                    <Input 
                      id="member-email" 
                      type="email"
                      value={newMember.email} 
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-phone">Phone Number</Label>
                    <Input 
                      id="member-phone" 
                      value={newMember.phone} 
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-status">Login Status</Label>
                    <select 
                      id="member-status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      value={newMember.loginStatus}
                      onChange={(e) => setNewMember({
                        ...newMember, 
                        loginStatus: e.target.value as 'active' | 'inactive' | 'deactivated'
                      })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Not logged in</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddMember}>Add Team Member</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                  {statusFilter ? `Status: ${getStatusText(statusFilter)}` : 'Filter by status'}
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
                      <div className="flex justify-end">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-56 p-0">
                            <div className="p-2 space-y-1">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setIsEditMemberOpen(true);
                                }}
                              >
                                Edit Team Member
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm"
                                onClick={() => handleMemberStatusChange(member.id, 'active')}
                                disabled={member.loginStatus === 'active'}
                              >
                                Set as Active
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm"
                                onClick={() => handleMemberStatusChange(member.id, 'inactive')}
                                disabled={member.loginStatus === 'inactive'}
                              >
                                Set as Inactive
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleMemberStatusChange(member.id, 'deactivated')}
                                disabled={member.loginStatus === 'deactivated'}
                              >
                                Deactivate Account
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
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
        
        {/* Edit Member Dialog */}
        <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-member-name">Name</Label>
                  <Input 
                    id="edit-member-name" 
                    value={selectedMember.name} 
                    onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-role">Role</Label>
                  <select 
                    id="edit-member-role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={selectedMember.role}
                    onChange={(e) => setSelectedMember({...selectedMember, role: e.target.value})}
                  >
                    <option value="Restaurant Manager">Restaurant Manager</option>
                    <option value="Head Chef">Head Chef</option>
                    <option value="Sous Chef">Sous Chef</option>
                    <option value="Host">Host</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Waitress">Waitress</option>
                    <option value="Bartender">Bartender</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-email">Email</Label>
                  <Input 
                    id="edit-member-email" 
                    type="email"
                    value={selectedMember.email} 
                    onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-phone">Phone Number</Label>
                  <Input 
                    id="edit-member-phone" 
                    value={selectedMember.phone} 
                    onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-member-status">Login Status</Label>
                  <select 
                    id="edit-member-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={selectedMember.loginStatus}
                    onChange={(e) => setSelectedMember({
                      ...selectedMember, 
                      loginStatus: e.target.value as 'active' | 'inactive' | 'deactivated'
                    })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Not logged in</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditMemberOpen(false)}>Cancel</Button>
              <Button onClick={handleEditMember}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Export Team Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <h4 className="text-sm font-medium">Select fields to export</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Name', 'Role', 'Email', 'Phone', 'Status', 'Last Login'].map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <input type="checkbox" id={`export-${field}`} defaultChecked className="rounded border-gray-300" />
                    <Label htmlFor={`export-${field}`} className="text-sm">{field}</Label>
                  </div>
                ))}
              </div>
              
              <h4 className="text-sm font-medium pt-2">Team members to export</h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1">Current View</Button>
                <Button variant="outline" className="flex-1">All Members</Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleExport}>Export CSV</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
