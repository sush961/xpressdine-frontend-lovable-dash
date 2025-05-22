
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
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
    { id: 'r1', date: '2025-05-15', time: '19:00', partySize: 2, tableNumber: 'T12', status: 'completed' },
    { id: 'r2', date: '2025-04-22', time: '20:00', partySize: 4, tableNumber: 'T08', status: 'completed' },
    { id: 'r3', date: '2025-05-30', time: '18:30', partySize: 2, tableNumber: 'T15', status: 'confirmed' }
  ],
  '2': [
    { id: 'r4', date: '2025-05-18', time: '18:00', partySize: 6, tableNumber: 'T01', status: 'completed' },
    { id: 'r5', date: '2025-05-25', time: '19:30', partySize: 2, tableNumber: 'T07', status: 'confirmed' }
  ],
  '3': [
    { id: 'r6', date: '2025-05-10', time: '20:30', partySize: 3, tableNumber: 'T04', status: 'completed' }
  ],
  '4': [
    { id: 'r7', date: '2025-05-05', time: '19:00', partySize: 4, tableNumber: 'T09', status: 'completed' },
    { id: 'r8', date: '2025-05-22', time: '18:30', partySize: 2, tableNumber: 'T03', status: 'confirmed' }
  ]
};

export default function Guests() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  
  // Filter guests based on search term
  const filteredGuests = guestsData.filter(guest => 
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

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Guests</h1>
          <Button variant="default">Add Guest</Button>
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
                    className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-muted cursor-pointer"
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
                  <Button variant="outline" className="mr-2"
                    onClick={() => toast({
                      title: "Feature not implemented",
                      description: "Edit guest functionality will be available in a future update."
                    })}
                  >
                    Edit Information
                  </Button>
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
