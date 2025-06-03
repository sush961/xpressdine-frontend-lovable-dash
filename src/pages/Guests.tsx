import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ApiClient } from '../lib/ApiClient';

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
  initials: string;
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  partySize: number;
  tableNumber: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  billAmount?: number;
}

export default function Guests() {
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isEditGuestOpen, setIsEditGuestOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Fetch guests from API
  const fetchGuests = async () => {
    console.log('[Guests.tsx] Starting to fetch guests...');
    setIsLoading(true);
    try {
      // Type assertion for the expected response structure from /api/customers GET
      const result = await ApiClient.get<{ data: Guest[], error: any | null }>('/customers');
      console.log('[Guests.tsx] Response data from ApiClient.get:', result);

      if (result.error) {
        throw new Error(result.error.message || result.error || 'Failed to fetch guests');
      }
      
      const formattedGuests = result.data.map((guest: Guest) => ({
        ...guest,
        initials: guest.name
          .split(' ')
          .map(part => part[0])
          .join('')
          .toUpperCase()
          .substring(0, 2),
      }));
      
      console.log('[Guests.tsx] Formatted guests:', formattedGuests);
      setGuests(formattedGuests);
    } catch (error) {
      console.error('Failed to fetch guests:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch guests',
        variant: "destructive"
      });
      setGuests([]);
    } finally {
      console.log('Finished fetching guests');
      setIsLoading(false);
    }
  };

  // Handle adding a new guest
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGuest.name || !newGuest.phone) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('[Guests.tsx] Attempting to add new guest:', newGuest);
      const payload = {
        name: newGuest.name,
        email: newGuest.email || null, // Ensure email is null if empty, not an empty string
        phone: newGuest.phone,
      };
      console.log('[Guests.tsx] Making POST request with payload:', payload);

      // Type assertion for the expected response structure from /api/customers POST
      const result = await ApiClient.post<{ data: Guest, error: any | null }>('/customers', payload);
      console.log('[Guests.tsx] Response data from ApiClient.post:', result);

      if (result.error) {
        // The ApiClient might throw an error for non-ok status, 
        // but if it doesn't and returns an error object (e.g. for 409 conflict)
        throw new Error(result.error.message || result.error || 'Failed to add guest');
      }
      
      console.log('[Guests.tsx] Successfully added guest:', result.data);
      
      // Refresh the guests list
      await fetchGuests();
      
      // Reset form and close dialog
      setNewGuest({ name: '', email: '', phone: '' });
      setIsAddGuestOpen(false);
      
      toast({
        title: "Success",
        description: "Guest added successfully",
      });
      
    } catch (error) {
      console.error('Failed to add guest:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add guest',
        variant: "destructive"
      });
    }
  };

  // Handle editing a guest
  const handleEditGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;
    
    console.log('[Guests.tsx] Attempting to edit guest:', selectedGuest);
    try {
      // Ensure we only send necessary data, backend might not expect 'initials'
      const { initials, ...guestDataToUpdate } = selectedGuest;
      const result = await ApiClient.put<{ data: Guest, error: any | null }>(
        `/customers/${guestDataToUpdate.id}`,
        guestDataToUpdate
      );
      console.log('[Guests.tsx] Response data from ApiClient.put:', result);

      if (result.error) {
        throw new Error(result.error.message || result.error || 'Failed to update guest');
      }
      
      console.log('[Guests.tsx] Successfully updated guest:', result.data);
      await fetchGuests(); // Refresh list
      setIsEditGuestOpen(false);
      
      toast({
        title: "Success",
        description: "Guest updated successfully",
      });
      
    } catch (error) {
      console.error('Failed to update guest:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update guest',
        variant: "destructive"
      });
    }
  };

  // Handle importing guests from CSV
  const handleImport = async () => {
    if (!csvFile) return;
    
    console.log('[Guests.tsx] Attempting to import guests from CSV:', csvFile.name);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      
      // Assuming the import endpoint might return a summary or status
      const result = await ApiClient.post<{ message?: string; success?: boolean; data?: any; error?: any | null }>(
        '/customers/import',
        formData
      );
      console.log('[Guests.tsx] Response data from ApiClient.post (import):', result);

      if (result.error || (result.success === false)) {
         throw new Error(result.error?.message || result.error || result.message || 'Failed to import guests');
      }
      
      console.log('[Guests.tsx] Successfully imported guests.');
      await fetchGuests(); // Refresh list
      setIsImportOpen(false);
      setCsvFile(null);
      
      toast({
        title: "Success",
        description: result.message || "Guests imported successfully",
      });
      
    } catch (error) {
      console.error('Failed to import guests:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to import guests',
        variant: "destructive"
      });
    }
  };

  // Filter guests based on search term
  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    guest.phone.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Guests</h1>
            <p className="text-muted-foreground">Manage your restaurant guests</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setIsImportOpen(true)} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={() => setIsAddGuestOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Guest
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search guests..."
            className="w-full bg-background pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredGuests.map((guest) => (
              <div 
                key={guest.id} 
                className="flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => {
                  setSelectedGuest(guest);
                  setActiveTab('info');
                }}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{guest.initials}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{guest.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {guest.email} • {guest.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Guest Dialog */}
      <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddGuest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newGuest.name}
                onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddGuestOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Guest</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Guests</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv">CSV File</Label>
              <Input
                id="csv"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                CSV should have columns: name, email, phone
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleImport}
                disabled={!csvFile}
              >
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
