import * as React from "react";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, FileText, Pencil, Trash2 } from 'lucide-react';
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
  const fetchGuests = React.useCallback(async () => {
    console.log('[Guests.tsx] Starting to fetch guests...');
    setIsLoading(true);
    try {
      // Type assertion for the expected response structure from /api/customers GET
      const result = await ApiClient.get<{ data: Guest[], error: unknown | null }>('/customers');
      console.log('[Guests.tsx] Response data from ApiClient.get:', result);

      if (result.error) {
        let errorMessage = 'Failed to fetch guests';
        if (typeof result.error === 'object' && result.error !== null && 'message' in result.error) {
          errorMessage = (result.error as { message?: string }).message || errorMessage;
        } else if (typeof result.error === 'string') {
          errorMessage = result.error;
        }
        throw new Error(errorMessage);
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
  }, [toast]); // Added toast to dependency array

  // Fetch guests when component mounts
  useEffect(() => {
    console.log('Component mounted, fetching guests...');
    fetchGuests();
  }, [fetchGuests]);

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
        name: newGuest.name.trim(),
        email: newGuest.email?.trim() || null,
        phone: newGuest.phone.trim(),
        notes: '' // Add empty notes field to match backend expectations
      };
      
      console.log('[Guests.tsx] Making POST request with payload:', payload);

      // Make the API request
      const result = await ApiClient.post<{ data: Guest, error: string | null }>('/customers', payload);
      console.log('[Guests.tsx] Response from API:', result);

      if (result.error) {
        // Handle specific error cases
        const errorMessage = typeof result.error === 'string' ? result.error : 'An error occurred';
        if (errorMessage.includes('phone number already exists')) {
          toast({
            title: "Guest Updated",
            description: "A guest with this phone number already exists. The existing guest has been updated.",
          });
        } else {
          throw new Error(errorMessage);
        }
      } else {
        toast({
          title: "Success",
          description: "Guest added successfully",
        });
      }
      
      // Refresh the guests list
      await fetchGuests();
      
      // Reset form and close dialog
      setNewGuest({ name: '', email: '', phone: '' });
      setIsAddGuestOpen(false);
      
    } catch (error) {
      console.error('Failed to add guest:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process guest',
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
      // Prepare the data to update
      const { initials, ...guestDataToUpdate } = selectedGuest;
      const payload = {
        name: guestDataToUpdate.name.trim(),
        email: guestDataToUpdate.email?.trim() || null,
        phone: guestDataToUpdate.phone.trim(),
        notes: '' // Add empty notes field to match backend expectations
      };
      
      // Make the API request
      const result = await ApiClient.put<{ data: Guest, error: string | null }>(
        `/customers/${guestDataToUpdate.id}`,
        payload
      );
      
      console.log('[Guests.tsx] Response from API:', result);

      if (result.error) {
        // Handle specific error cases
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to update guest';
        if (errorMessage.includes('phone number already exists')) {
          throw new Error('A guest with this phone number already exists');
        } else {
          throw new Error(errorMessage);
        }
      }
      
      // If we get here, the update was successful
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
      const result = await ApiClient.post<{ message?: string; success?: boolean; data?: unknown; error?: unknown | null }>(
        '/customers/import',
        formData
      );
      console.log('[Guests.tsx] Response data from ApiClient.post (import):', result);

      if (result.error || (result.success === false)) {
        const errorMessage = 
          (typeof result.error === 'object' && result.error !== null && 'message' in result.error) 
            ? String((result.error as { message?: unknown }).message) 
            : typeof result.error === 'string' 
              ? result.error 
              : typeof result.message === 'string' 
                ? result.message 
                : 'Failed to import guests';
        throw new Error(errorMessage);
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

  // Handle deleting a guest
  const handleDeleteGuest = async (guestId: string) => {
    if (!window.confirm('Are you sure you want to delete this guest? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log('[Guests.tsx] Attempting to delete guest:', guestId);
      
      const result = await ApiClient.delete<{ error: string | null }>(`/customers/${guestId}`);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh the guests list
      await fetchGuests();
      
      toast({
        title: "Success",
        description: "Guest deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete guest:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete guest',
        variant: "destructive"
      });
    }
  };

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
                className="group flex items-center p-4 border rounded-lg hover:bg-accent cursor-pointer relative"
                onClick={(e) => {
                  // Only set selected guest if not clicking the edit button
                  if (!(e.target as HTMLElement).closest('.edit-button')) {
                    setSelectedGuest(guest);
                    setActiveTab('info');
                  }
                }}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{guest.initials}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">{guest.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {guest.email} • {guest.phone}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="edit-button opacity-0 group-hover:opacity-100 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGuest(guest);
                      setIsEditGuestOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="delete-button opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:text-destructive/80"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleDeleteGuest(guest.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
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

      {/* Edit Guest Dialog */}
      <Dialog open={isEditGuestOpen} onOpenChange={setIsEditGuestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <form onSubmit={handleEditGuest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={selectedGuest.name}
                  onChange={(e) => setSelectedGuest({...selectedGuest, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedGuest.email || ''}
                  onChange={(e) => setSelectedGuest({...selectedGuest, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={selectedGuest.phone}
                  onChange={(e) => setSelectedGuest({...selectedGuest, phone: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditGuestOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}