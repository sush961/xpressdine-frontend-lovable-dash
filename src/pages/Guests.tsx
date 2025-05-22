
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  visitCount: number;
  lastVisit: string;
  dietaryRestrictions?: string;
  preferences?: string;
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

// Sample data - would be fetched from API in real implementation
const guestsData: Guest[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    visitCount: 8,
    lastVisit: '2025-05-15',
    dietaryRestrictions: 'Gluten-free',
    preferences: 'Window seating',
    initials: 'JS'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 987-6543',
    visitCount: 12,
    lastVisit: '2025-05-18',
    dietaryRestrictions: 'Vegetarian',
    preferences: 'Quiet corner',
    initials: 'SJ'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '(555) 456-7890',
    visitCount: 3,
    lastVisit: '2025-05-10',
    dietaryRestrictions: '',
    preferences: 'Bar seating',
    initials: 'MC'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    phone: '(555) 789-0123',
    visitCount: 5,
    lastVisit: '2025-05-05',
    dietaryRestrictions: 'Dairy-free',
    preferences: 'Patio',
    initials: 'EW'
  }
];

const reservationsData: Record<string, Reservation[]> = {
  '1': [
    { id: 'r1', date: '2025-05-15', time: '19:00', partySize: 2, tableNumber: 'T12', status: 'completed', billAmount: 145.80 },
    { id: 'r2', date: '2025-04-22', time: '20:00', partySize: 4, tableNumber: 'T08', status: 'completed', billAmount: 237.50 },
    { id: 'r3', date: '2025-05-30', time: '18:30', partySize: 2, tableNumber: 'T15', status: 'confirmed' }
  ],
  '2': [
    { id: 'r4', date: '2025-05-18', time: '18:00', partySize: 6, tableNumber: 'T01', status: 'completed', billAmount: 342.75 },
    { id: 'r5', date: '2025-05-25', time: '19:30', partySize: 2, tableNumber: 'T07', status: 'confirmed' }
  ],
  '3': [
    { id: 'r6', date: '2025-05-10', time: '20:30', partySize: 3, tableNumber: 'T04', status: 'completed', billAmount: 189.20 }
  ],
  '4': [
    { id: 'r7', date: '2025-05-05', time: '19:00', partySize: 4, tableNumber: 'T09', status: 'completed', billAmount: 254.30 },
    { id: 'r8', date: '2025-05-22', time: '18:30', partySize: 2, tableNumber: 'T03', status: 'confirmed' }
  ]
};

export default function Guests() {
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>(guestsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isEditGuestOpen, setIsEditGuestOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    preferences: ''
  });
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  // Filter guests based on search term
  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone.includes(searchTerm)
  );

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest);
    setActiveTab('info');
  };

  const handleBackClick = () => {
    setSelectedGuest(null);
  };

  const handleAddGuest = () => {
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
      .substr(0, 2);

    const newId = (guests.length + 1).toString();
    
    const guestToAdd: Guest = {
      id: newId,
      name: newGuest.name,
      email: newGuest.email,
      phone: newGuest.phone,
      visitCount: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      dietaryRestrictions: newGuest.dietaryRestrictions,
      preferences: newGuest.preferences,
      initials: initials
    };

    setGuests([...guests, guestToAdd]);
    setIsAddGuestOpen(false);
    setNewGuest({
      name: '',
      email: '',
      phone: '',
      dietaryRestrictions: '',
      preferences: ''
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
    // Mock CSV export functionality
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Visit Count', 'Last Visit', 'Dietary Restrictions', 'Preferences'];
    const csvContent = [
      headers.join(','),
      ...guests.map(guest => [
        guest.id,
        guest.name,
        guest.email,
        guest.phone,
        guest.visitCount,
        guest.lastVisit,
        guest.dietaryRestrictions || '',
        guest.preferences || ''
      ].join(','))
    ].join('\n');
    
    // Create download link
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

    // Mock CSV import functionality
    // In a real app, this would parse the CSV file
    
    toast({
      title: "Import successful",
      description: `${csvFile.name} has been imported successfully.`
    });
    
    setIsImportOpen(false);
    setCsvFile(null);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Guests</h1>
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
                      CSV should have headers: Name, Email, Phone, Dietary Restrictions, Preferences
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
                  <div className="space-y-2">
                    <Label htmlFor="guest-dietary">Dietary Restrictions</Label>
                    <Input 
                      id="guest-dietary" 
                      value={newGuest.dietaryRestrictions} 
                      onChange={(e) => setNewGuest({...newGuest, dietaryRestrictions: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-preferences">Seating Preferences</Label>
                    <Textarea 
                      id="guest-preferences" 
                      value={newGuest.preferences} 
                      onChange={(e) => setNewGuest({...newGuest, preferences: e.target.value})}
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
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 p-4 border-b font-medium">
                <span></span>
                <span>Name</span>
                <span className="hidden md:block">Email</span>
                <span className="hidden md:block">Phone</span>
                <span>Visits</span>
              </div>
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <div 
                    key={guest.id}
                    className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-muted cursor-pointer group"
                    onClick={() => handleGuestSelect(guest)}
                  >
                    <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                      <AvatarFallback>{guest.initials}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{guest.name}</div>
                    <div className="hidden md:block text-muted-foreground">{guest.email}</div>
                    <div className="hidden md:block text-muted-foreground">{guest.phone}</div>
                    <div className="text-center">{guest.visitCount}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">No guests found</div>
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
                  <p className="text-muted-foreground">
                    Last visit on {new Date(selectedGuest.lastVisit).toLocaleDateString()} • {selectedGuest.visitCount} visits
                  </p>
                </div>
              </div>
              
              <Dialog open={isEditGuestOpen} onOpenChange={setIsEditGuestOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit Information</Button>
                </DialogTrigger>
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
                        onChange={(e) => setSelectedGuest({...selectedGuest, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-guest-email">Email</Label>
                      <Input 
                        id="edit-guest-email" 
                        type="email"
                        value={selectedGuest.email} 
                        onChange={(e) => setSelectedGuest({...selectedGuest, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-guest-phone">Phone</Label>
                      <Input 
                        id="edit-guest-phone" 
                        value={selectedGuest.phone} 
                        onChange={(e) => setSelectedGuest({...selectedGuest, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-guest-dietary">Dietary Restrictions</Label>
                      <Input 
                        id="edit-guest-dietary" 
                        value={selectedGuest.dietaryRestrictions || ''} 
                        onChange={(e) => setSelectedGuest({...selectedGuest, dietaryRestrictions: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-guest-preferences">Seating Preferences</Label>
                      <Textarea 
                        id="edit-guest-preferences" 
                        value={selectedGuest.preferences || ''} 
                        onChange={(e) => setSelectedGuest({...selectedGuest, preferences: e.target.value})}
                      />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditGuestOpen(false)}>Cancel</Button>
                      <Button onClick={handleEditGuest}>Save Changes</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Guest Information</TabsTrigger>
                <TabsTrigger value="reservations">Reservations History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p>{selectedGuest.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                      <p>{selectedGuest.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Dietary Restrictions</h3>
                      <p>{selectedGuest.dietaryRestrictions || 'None'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Seating Preferences</h3>
                      <p>{selectedGuest.preferences || 'None'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="bg-white"
                    onClick={() => setActiveTab('reservations')}
                  >
                    View Reservations
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="reservations" className="mt-6">
                <div className="rounded-md border">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 border-b font-medium">
                    <span>Date & Time</span>
                    <span>Party Size</span>
                    <span>Table</span>
                    <span>Status</span>
                  </div>
                  
                  {reservationsData[selectedGuest.id]?.map((reservation) => (
                    <div 
                      key={reservation.id}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 items-center hover:bg-muted cursor-pointer"
                      onClick={() => window.location.href = `/reservations?id=${reservation.id}`}
                    >
                      <div>
                        {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
                      </div>
                      <div>{reservation.partySize} guests</div>
                      <div>{reservation.tableNumber}</div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium
                          ${reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                            reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}
                        >
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {!reservationsData[selectedGuest.id]?.length && (
                    <div className="p-4 text-center text-muted-foreground">
                      No reservation history found
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <Link to={`/reservations?guest=${selectedGuest.id}`}>
                    <Button>
                      Create New Reservation
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
