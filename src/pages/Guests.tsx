
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

interface Guest {
  id: string;
  name: string;
  email?: string; // Make email optional to match DB and API flexibility
  phone: string;
  created_at?: string;
  updated_at?: string;
  initials: string;
  // Removed visitCount, lastVisit, dietaryRestrictions, preferences as they are not in the API
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

// Mock data (guestsData) removed as live data is fetched from API.

// Mock data (reservationsData) removed.

const API_BASE_URL = 'https://demo.xpressdine.com/api'; // Production API endpoint

export default function Guests() {
  // Helper to generate reservation URL for a guest
  const getReservationUrl = (guest: Guest) => {
    return `/reservations/new?guestId=${guest.id}&guestName=${encodeURIComponent(guest.name)}&guestEmail=${encodeURIComponent(guest.email || '')}&guestPhone=${encodeURIComponent(guest.phone || '')}`;
  };

  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isEditGuestOpen, setIsEditGuestOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/customers`);
      if (!response.ok) {
        throw new Error('Failed to fetch guests');
      }
      const result = await response.json();
      // Transform data if necessary, e.g., generating initials
      const formattedGuests = result.data.map((guest: any) => ({
        ...guest,
        initials: guest.name
          .split(' ')
          .map((part: string) => part[0])
          .join('')
          .toUpperCase()
          .substring(0, 2),
      }));
      setGuests(formattedGuests);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast({
        title: "Error fetching guests",
        description: (error as Error).message || "Could not load guest data.",
        variant: "destructive"
      });
      setGuests([]); // Set to empty array on error
    }
    setIsLoading(false);
  };
  
  // Filter guests based on search term
  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    guest.phone.includes(searchTerm)
  );

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest);
    setActiveTab('info');
  };

  const handleBackClick = () => {
    setSelectedGuest(null);
  };

  const handleAddGuest = async () => {
    if (!newGuest.name.trim() || !newGuest.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    // Generate initials from name
    const initials = newGuest.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // POST to API
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGuest.name,
          email: newGuest.email,
          phone: newGuest.phone,
          // dietaryRestrictions and preferences are not part of the core customer model in API yet
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add guest');
      }
      // const addedGuestData = await response.json(); // API returns the created guest
      // Instead of manually adding, re-fetch to get the latest list with DB-generated ID
      fetchGuests(); 
    } catch (error) {
      console.error('Error adding guest:', error);
      toast({
        title: "Error adding guest",
        description: (error as Error).message || "Could not save new guest.",
        variant: "destructive"
      });
      return; // Stop execution if API call fails
    }
    setIsAddGuestOpen(false);
    setNewGuest({
      name: '',
      email: '',
      phone: ''
    });
    
    toast({
      title: "Guest added",
      description: `${newGuest.name} has been successfully added.`
    });
  };

  const handleEditGuest = () => {
    if (!selectedGuest) return;

    const updatedGuests = guests.map(guest => {
      if (guest.id === selectedGuest.id) {
        return selectedGuest;
      }
      return guest;
    });

    setGuests(updatedGuests);
    setIsEditGuestOpen(false);
    
    toast({
      title: "Guest information updated",
      description: `${selectedGuest.name}'s information has been successfully updated.`
    });
  };

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone'];
    const csvContent = [
      headers.join(','),
      ...guests.map(guest => [
        guest.id,
        guest.name,
        guest.email || '', 
        guest.phone,
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'guests_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export successful",
      description: "Guest data has been exported to CSV."
    });
  };

  const handleImport = () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file to import",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Import successful",
      description: `${csvFile.name} has been imported successfully.`
    });
    
    setIsImportOpen(false);
    setCsvFile(null);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Guests ({isLoading ? 'Loading...' : filteredGuests.length})</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="hidden sm:flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hidden sm:flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Guests from CSV</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="csv-file">Upload CSV File</Label>
                    <Input 
                      id="csv-file" 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setCsvFile(e.target.files[0]);
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      CSV should have headers: Name, Email, Phone
                    </p>
                  </div>
                  
                  {csvFile && (
                    <div className="border rounded-md p-4 space-y-4 mt-4">
                      <h3 className="text-sm font-medium">Field Mapping</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="map-name" className="text-xs">CSV Column for Name</Label>
                          <select 
                            id="map-name"
                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            <option value="name">Name</option>
                            <option value="full_name">Full Name</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="map-email" className="text-xs">CSV Column for Email</Label>
                          <select 
                            id="map-email"
                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            <option value="email">Email</option>
                            <option value="email_address">Email Address</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="map-phone" className="text-xs">CSV Column for Phone</Label>
                          <select 
                            id="map-phone"
                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            <option value="phone">Phone</option>
                            <option value="phone_number">Phone Number</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
                    <Button onClick={handleImport}>Import</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Guest</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Guest</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-name">Name</Label>
                    <Input 
                      id="guest-name" 
                      value={newGuest.name} 
                      onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-email">Email</Label>
                    <Input 
                      id="guest-email" 
                      type="email"
                      value={newGuest.email} 
                      onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-phone">Phone</Label>
                    <Input 
                      id="guest-phone" 
                      value={newGuest.phone} 
                      onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddGuestOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddGuest}>Add Guest</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!selectedGuest ? (
          <div>
            <div className="flex items-center max-w-sm mb-6">
              <Input
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mr-2"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-md border">
              <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 p-4 border-b font-medium">
                <span></span> 
                <span>Name</span>
                <span className="hidden md:block">Email</span>
                <span className="hidden md:block">Phone</span>
                <span></span> 
              </div>
              {isLoading && <div className="p-4 text-center">Loading guests...</div>}
              {!isLoading && filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <div 
                    key={guest.id}
                    className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-muted cursor-pointer group"
                    onClick={() => handleGuestSelect(guest)}
                  >
                    <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                      <AvatarFallback>{guest.initials}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{guest.name}</div>
                    <div className="hidden md:block text-muted-foreground">{guest.email || 'N/A'}</div>
                    <div className="hidden md:block text-muted-foreground">{guest.phone}</div>
                    <div></div>
                  </div>
                ))
              ) : (
                !isLoading && <div className="p-4 text-center text-muted-foreground">No guests found</div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="mb-2"
            >
              ← Back to list
            </Button>
            
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 bg-primary text-primary-foreground text-xl">
                  <AvatarFallback>{selectedGuest.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">{selectedGuest.name}</h2>
                  {/* Removed last visit and visit count display */}
                </div>
              </div>
              <div className="ml-auto flex items-center"> {/* Aligns edit button with the guest name/avatar block */}
                <Button variant="outline" size="sm" onClick={() => setIsEditGuestOpen(true)}>Edit Guest</Button>
              </div>
            </div> {/* Closes: flex items-start justify-between */}

            {/* Edit Guest Dialog (conditionally rendered) */}
            {selectedGuest && (
              <Dialog open={isEditGuestOpen} onOpenChange={setIsEditGuestOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Guest Information</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-guest-name">Name</Label>
                      <Input 
                        id="edit-guest-name" 
                        value={selectedGuest.name} 
                        onChange={(e) => setSelectedGuest(prev => prev ? {...prev, name: e.target.value} : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-guest-email">Email</Label>
                      <Input 
                        id="edit-guest-email" 
                        type="email"
                        value={selectedGuest.email || ''} 
                        onChange={(e) => setSelectedGuest(prev => prev ? {...prev, email: e.target.value} : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-guest-phone">Phone</Label>
                      <Input 
                        id="edit-guest-phone" 
                        value={selectedGuest.phone} 
                        onChange={(e) => setSelectedGuest(prev => prev ? {...prev, phone: e.target.value} : null)}
                      />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditGuestOpen(false)}>Cancel</Button>
                      <Button onClick={handleEditGuest}>Save Changes</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Tabs defaultValue="info" className="w-full mt-6">
              <TabsList>
                <TabsTrigger value="info">Guest Info</TabsTrigger>
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="mt-4">
                <div className="space-y-2 p-4 border rounded-md bg-card">
                  <p><span className="font-semibold text-sm text-muted-foreground">Email:</span> {selectedGuest.email || 'N/A'}</p>
                  <p><span className="font-semibold text-sm text-muted-foreground">Phone:</span> {selectedGuest.phone}</p>
                  <p><span className="font-semibold text-sm text-muted-foreground">Joined:</span> {selectedGuest.created_at ? new Date(selectedGuest.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </TabsContent>
              <TabsContent value="reservations" className="mt-4">
                <div className="p-4 border rounded-md bg-card">
                  <p className="text-muted-foreground">
                    Reservation history for this guest will be shown here. (Feature under development)
                  </p>
                  <div className="mt-4">
                    <Link to={getReservationUrl(selectedGuest)}>
                      <Button>
                        Create New Reservation
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          {/* Add this closing div tag */}
          </div>
          {/* End of selectedGuest main container */}
        )}
      </div>
    </DashboardLayout>
  );
}
