
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

// Mock organization data
const organizationData = {
  name: 'XpressDine Restaurant',
  logo: '/placeholder.svg',
  address: '123 Main Street, New York, NY 10001',
  phone: '(555) 987-6543',
  email: 'contact@xpressdinerestaurant.com',
  website: 'https://xpressdinerestaurant.com',
  language: 'en',
  openingHours: {
    monday: [{ open: '11:00', close: '22:00' }],
    tuesday: [{ open: '11:00', close: '22:00' }],
    wednesday: [{ open: '11:00', close: '22:00' }],
    thursday: [{ open: '11:00', close: '23:00' }],
    friday: [{ open: '11:00', close: '00:00' }],
    saturday: [
      { open: '10:00', close: '15:00' },
      { open: '17:00', close: '00:00' },
    ],
    sunday: [{ open: '10:00', close: '21:00' }]
  }
};

export default function OrganizationSettings() {
  const { toast } = useToast();
  const [orgName, setOrgName] = useState(organizationData.name);
  const [orgAddress, setOrgAddress] = useState(organizationData.address);
  const [orgPhone, setOrgPhone] = useState(organizationData.phone);
  const [orgEmail, setOrgEmail] = useState(organizationData.email);
  const [orgWebsite, setOrgWebsite] = useState(organizationData.website);
  const [language, setLanguage] = useState(organizationData.language);
  const [openingHours, setOpeningHours] = useState(organizationData.openingHours);
  
  const handleSaveBasicInfo = () => {
    toast({
      title: "Organization information updated",
      description: "The restaurant details have been saved successfully."
    });
  };
  
  const handleSaveHours = () => {
    toast({
      title: "Business hours updated",
      description: "Your restaurant's operating hours have been updated."
    });
  };
  
  const handleAddTimeSlot = (day: keyof typeof openingHours) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: [...prev[day], { open: '09:00', close: '17:00' }]
    }));
  };
  
  const handleRemoveTimeSlot = (day: keyof typeof openingHours, index: number) => {
    if (openingHours[day].length === 1) {
      toast({
        title: "Cannot remove",
        description: "You must keep at least one time slot per day.",
        variant: "destructive"
      });
      return;
    }
    
    setOpeningHours(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };
  
  const handleUpdateTimeSlot = (day: keyof typeof openingHours, index: number, field: 'open' | 'close', value: string) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
        </div>
        
        <Tabs defaultValue="basic-info" className="w-full">
          <TabsList>
            <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
            <TabsTrigger value="business-hours">Business Hours</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="app-settings">App Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic-info" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Restaurant Information</h2>
              <div className="border rounded-md p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Restaurant Name</Label>
                  <Input 
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="org-address">Address</Label>
                  <Textarea 
                    id="org-address"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-phone">Phone Number</Label>
                    <Input 
                      id="org-phone"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-email">Email Address</Label>
                    <Input 
                      id="org-email"
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input 
                    id="org-website"
                    value={orgWebsite}
                    onChange={(e) => setOrgWebsite(e.target.value)}
                  />
                </div>
              </div>
              
              <h2 className="text-lg font-medium">Restaurant Logo</h2>
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border rounded flex items-center justify-center bg-white">
                    <img src={organizationData.logo} alt="Restaurant logo" className="max-w-full max-h-full" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline">Upload New Logo</Button>
                    <p className="text-xs text-muted-foreground">Recommended: Square image, at least 400x400px</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveBasicInfo}>Save Information</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="business-hours" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Operating Hours</h2>
              <div className="border rounded-md p-4">
                <div className="space-y-4">
                  {days.map((day) => (
                    <div key={day} className="space-y-3">
                      <div className="font-medium capitalize flex justify-between items-center">
                        <span>{day}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAddTimeSlot(day as keyof typeof openingHours)}
                          className="h-8 px-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Time Slot
                        </Button>
                      </div>
                      
                      {openingHours[day as keyof typeof openingHours].map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={slot.open}
                            onChange={(e) => handleUpdateTimeSlot(day as keyof typeof openingHours, index, 'open', e.target.value)}
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                          <span className="text-muted-foreground">to</span>
                          <input 
                            type="time" 
                            value={slot.close}
                            onChange={(e) => handleUpdateTimeSlot(day as keyof typeof openingHours, index, 'close', e.target.value)}
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground h-8 w-8"
                            onClick={() => handleRemoveTimeSlot(day as keyof typeof openingHours, index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {openingHours[day as keyof typeof openingHours].length > 1 && (
                        <div className="text-xs text-muted-foreground pl-1">
                          {openingHours[day as keyof typeof openingHours].length} time slots
                        </div>
                      )}
                      
                      <hr className="my-2" />
                    </div>
                  ))}
                </div>
              </div>
              
              <h2 className="text-lg font-medium">Special Closing Dates</h2>
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex gap-4">
                  <div className="space-y-2 w-full">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Reason</Label>
                    <Input placeholder="e.g. Holiday, Private Event" />
                  </div>
                  <div className="space-y-2 self-end">
                    <Button>Add</Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground italic">
                  No special closing dates added yet.
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveHours}>Save Business Hours</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="app-settings" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Application Settings</h2>
              
              <div className="border rounded-md p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-language">Default Language</Label>
                  <select 
                    id="app-language" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be the default language for all users in your organization.
                  </p>
                </div>
              </div>
              
              <h2 className="text-lg font-medium">Email Notifications</h2>
              <div className="border rounded-md p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input 
                    id="notification-email"
                    type="email"
                    placeholder="notifications@yourrestaurant.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    System notifications will be sent to this email.
                  </p>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Notification types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notify-reservations" defaultChecked />
                      <Label htmlFor="notify-reservations">New Reservations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notify-cancellations" defaultChecked />
                      <Label htmlFor="notify-cancellations">Reservation Cancellations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notify-user-reg" />
                      <Label htmlFor="notify-user-reg">New User Registrations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notify-summary" defaultChecked />
                      <Label htmlFor="notify-summary">Daily Summary</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => toast({
                  title: "Settings saved",
                  description: "Your application settings have been updated."
                })}>
                  Save App Settings
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Subscription Plan</h2>
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Professional Plan</p>
                    <p className="text-sm text-muted-foreground">$49.99 per month, billed monthly</p>
                  </div>
                  <Button variant="outline">Upgrade Plan</Button>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="font-medium">Features included in your plan:</p>
                  <ul className="mt-2 space-y-2">
                    <li className="text-sm flex items-center">
                      <svg 
                        width="15" 
                        height="15" 
                        viewBox="0 0 15 15" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 text-primary"
                      >
                        <path d="M7.5 0.875C3.82372 0.875 0.875 3.82372 0.875 7.5C0.875 11.1763 3.82372 14.125 7.5 14.125C11.1763 14.125 14.125 11.1763 14.125 7.5C14.125 3.82372 11.1763 0.875 7.5 0.875ZM7.5 1.825C10.6566 1.825 13.175 4.3434 13.175 7.5C13.175 10.6566 10.6566 13.175 7.5 13.175C4.3434 13.175 1.825 10.6566 1.825 7.5C1.825 4.3434 4.3434 1.825 7.5 1.825ZM11.0701 5.46967C11.2654 5.66502 11.2652 5.98164 11.0698 6.17682L7.56975 9.67682C7.56974 9.67683 7.56973 9.67685 7.56972 9.67686C7.37476 9.87125 7.06262 9.87125 6.86766 9.67686L4.9301 7.73908C4.73475 7.54373 4.73475 7.22715 4.9301 7.0318C5.12545 6.83645 5.44203 6.83645 5.63738 7.0318L7.21869 8.61334L10.3628 5.46967C10.5581 5.27431 10.8747 5.27431 11.0701 5.46967Z" fill="currentColor" />
                      </svg>
                      Unlimited reservations
                    </li>
                    <li className="text-sm flex items-center">
                      <svg 
                        width="15" 
                        height="15" 
                        viewBox="0 0 15 15" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 text-primary"
                      >
                        <path d="M7.5 0.875C3.82372 0.875 0.875 3.82372 0.875 7.5C0.875 11.1763 3.82372 14.125 7.5 14.125C11.1763 14.125 14.125 11.1763 14.125 7.5C14.125 3.82372 11.1763 0.875 7.5 0.875ZM7.5 1.825C10.6566 1.825 13.175 4.3434 13.175 7.5C13.175 10.6566 10.6566 13.175 7.5 13.175C4.3434 13.175 1.825 10.6566 1.825 7.5C1.825 4.3434 4.3434 1.825 7.5 1.825ZM11.0701 5.46967C11.2654 5.66502 11.2652 5.98164 11.0698 6.17682L7.56975 9.67682C7.56974 9.67683 7.56973 9.67685 7.56972 9.67686C7.37476 9.87125 7.06262 9.87125 6.86766 9.67686L4.9301 7.73908C4.73475 7.54373 4.73475 7.22715 4.9301 7.0318C5.12545 6.83645 5.44203 6.83645 5.63738 7.0318L7.21869 8.61334L10.3628 5.46967C10.5581 5.27431 10.8747 5.27431 11.0701 5.46967Z" fill="currentColor" />
                      </svg>
                      Up to 10 staff accounts
                    </li>
                    <li className="text-sm flex items-center">
                      <svg 
                        width="15" 
                        height="15" 
                        viewBox="0 0 15 15" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 text-primary"
                      >
                        <path d="M7.5 0.875C3.82372 0.875 0.875 3.82372 0.875 7.5C0.875 11.1763 3.82372 14.125 7.5 14.125C11.1763 14.125 14.125 11.1763 14.125 7.5C14.125 3.82372 11.1763 0.875 7.5 0.875ZM7.5 1.825C10.6566 1.825 13.175 4.3434 13.175 7.5C13.175 10.6566 10.6566 13.175 7.5 13.175C4.3434 13.175 1.825 10.6566 1.825 7.5C1.825 4.3434 4.3434 1.825 7.5 1.825ZM11.0701 5.46967C11.2654 5.66502 11.2652 5.98164 11.0698 6.17682L7.56975 9.67682C7.56974 9.67683 7.56973 9.67685 7.56972 9.67686C7.37476 9.87125 7.06262 9.87125 6.86766 9.67686L4.9301 7.73908C4.73475 7.54373 4.73475 7.22715 4.9301 7.0318C5.12545 6.83645 5.44203 6.83645 5.63738 7.0318L7.21869 8.61334L10.3628 5.46967C10.5581 5.27431 10.8747 5.27431 11.0701 5.46967Z" fill="currentColor" />
                      </svg>
                      Table management
                    </li>
                    <li className="text-sm flex items-center">
                      <svg 
                        width="15" 
                        height="15" 
                        viewBox="0 0 15 15" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 text-primary"
                      >
                        <path d="M7.5 0.875C3.82372 0.875 0.875 3.82372 0.875 7.5C0.875 11.1763 3.82372 14.125 7.5 14.125C11.1763 14.125 14.125 11.1763 14.125 7.5C14.125 3.82372 11.1763 0.875 7.5 0.875ZM7.5 1.825C10.6566 1.825 13.175 4.3434 13.175 7.5C13.175 10.6566 10.6566 13.175 7.5 13.175C4.3434 13.175 1.825 10.6566 1.825 7.5C1.825 4.3434 4.3434 1.825 7.5 1.825ZM11.0701 5.46967C11.2654 5.66502 11.2652 5.98164 11.0698 6.17682L7.56975 9.67682C7.56974 9.67683 7.56973 9.67685 7.56972 9.67686C7.37476 9.87125 7.06262 9.87125 6.86766 9.67686L4.9301 7.73908C4.73475 7.54373 4.73475 7.22715 4.9301 7.0318C5.12545 6.83645 5.44203 6.83645 5.63738 7.0318L7.21869 8.61334L10.3628 5.46967C10.5581 5.27431 10.8747 5.27431 11.0701 5.46967Z" fill="currentColor" />
                      </svg>
                      Guest profiles
                    </li>
                    <li className="text-sm flex items-center">
                      <svg 
                        width="15" 
                        height="15" 
                        viewBox="0 0 15 15" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 text-primary"
                      >
                        <path d="M7.5 0.875C3.82372 0.875 0.875 3.82372 0.875 7.5C0.875 11.1763 3.82372 14.125 7.5 14.125C11.1763 14.125 14.125 11.1763 14.125 7.5C14.125 3.82372 11.1763 0.875 7.5 0.875ZM7.5 1.825C10.6566 1.825 13.175 4.3434 13.175 7.5C13.175 10.6566 10.6566 13.175 7.5 13.175C4.3434 13.175 1.825 10.6566 1.825 7.5C1.825 4.3434 4.3434 1.825 7.5 1.825ZM11.0701 5.46967C11.2654 5.66502 11.2652 5.98164 11.0698 6.17682L7.56975 9.67682C7.56974 9.67683 7.56973 9.67685 7.56972 9.67686C7.37476 9.87125 7.06262 9.87125 6.86766 9.67686L4.9301 7.73908C4.73475 7.54373 4.73475 7.22715 4.9301 7.0318C5.12545 6.83645 5.44203 6.83645 5.63738 7.0318L7.21869 8.61334L10.3628 5.46967C10.5581 5.27431 10.8747 5.27431 11.0701 5.46967Z" fill="currentColor" />
                      </svg>
                      Email marketing integration
                    </li>
                  </ul>
                </div>
              </div>
              
              <h2 className="text-lg font-medium">Payment Method</h2>
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-blue-500 rounded text-white flex items-center justify-center text-xs font-semibold">VISA</div>
                    <span>•••• •••• •••• 4242 (expires 12/28)</span>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
              
              <h2 className="text-lg font-medium">Billing History</h2>
              <div className="border rounded-md">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 border-b font-medium">
                  <span>Date</span>
                  <span>Amount</span>
                  <span>Invoice</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 items-center">
                  <div>May 1, 2025</div>
                  <div>$49.99</div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 items-center">
                  <div>Apr 1, 2025</div>
                  <div>$49.99</div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 items-center">
                  <div>Mar 1, 2025</div>
                  <div>$49.99</div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
