
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

// Mock organization data
const organizationData = {
  name: 'XpressDine Restaurant',
  logo: '/placeholder.svg',
  address: '123 Main Street, New York, NY 10001',
  phone: '(555) 987-6543',
  email: 'contact@xpressdinerestaurant.com',
  website: 'https://xpressdinerestaurant.com',
  openingHours: {
    monday: { open: '11:00', close: '22:00' },
    tuesday: { open: '11:00', close: '22:00' },
    wednesday: { open: '11:00', close: '22:00' },
    thursday: { open: '11:00', close: '23:00' },
    friday: { open: '11:00', close: '00:00' },
    saturday: { open: '10:00', close: '00:00' },
    sunday: { open: '10:00', close: '21:00' }
  }
};

export default function OrganizationSettings() {
  const { toast } = useToast();
  const [orgName, setOrgName] = useState(organizationData.name);
  const [orgAddress, setOrgAddress] = useState(organizationData.address);
  const [orgPhone, setOrgPhone] = useState(organizationData.phone);
  const [orgEmail, setOrgEmail] = useState(organizationData.email);
  const [orgWebsite, setOrgWebsite] = useState(organizationData.website);
  
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
                  {Object.entries(organizationData.openingHours).map(([day, hours]) => (
                    <div key={day} className="grid grid-cols-[150px_1fr] gap-4 items-center">
                      <div className="font-medium capitalize">{day}</div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="time" 
                          defaultValue={hours.open}
                          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                        <span className="text-muted-foreground">to</span>
                        <input 
                          type="time" 
                          defaultValue={hours.close}
                          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                          <span className="sr-only">More options</span>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 5h11M2 10h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Button>
                      </div>
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
