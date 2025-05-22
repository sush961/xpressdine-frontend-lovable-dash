
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

export default function AppSettings() {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  
  const handleSaveGeneral = () => {
    toast({
      title: "Settings saved",
      description: "Your general settings have been updated successfully."
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated successfully."
    });
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">App Settings</h1>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Appearance</h2>
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                  </div>
                  <Switch 
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-view" className="font-medium">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout for tables and lists</p>
                  </div>
                  <Switch 
                    id="compact-view"
                    checked={compactView}
                    onCheckedChange={setCompactView}
                  />
                </div>
              </div>
              
              <h2 className="text-lg font-medium">Data & Storage</h2>
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save" className="font-medium">Auto-save Changes</Label>
                    <p className="text-sm text-muted-foreground">Automatically save changes as you make them</p>
                  </div>
                  <Switch 
                    id="auto-save"
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>
                
                <div>
                  <Button variant="outline">Clear Local Cache</Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral}>Save Settings</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Notification Preferences</h2>
              <div className="border rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications-enabled" className="font-medium">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about reservations, guests and team activities</p>
                  </div>
                  <Switch 
                    id="notifications-enabled"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound-enabled" className="font-medium">Notification Sounds</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for important notifications</p>
                  </div>
                  <Switch 
                    id="sound-enabled"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                    disabled={!notificationsEnabled}
                  />
                </div>
              </div>
              
              <h2 className="text-lg font-medium">Email Notifications</h2>
              <div className="border rounded-md p-4 space-y-4">
                <div>
                  <Label htmlFor="email-address" className="font-medium">Email Address</Label>
                  <p className="text-sm text-muted-foreground">Where to send email notifications</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="email"
                      id="email-address"
                      placeholder="Enter email address"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      defaultValue="manager@xpressdine.com"
                    />
                    <Button variant="outline">Verify</Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Available Integrations</h2>
              <div className="border rounded-md divide-y">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Calendar Integration</h3>
                    <p className="text-sm text-muted-foreground">Sync reservations with Google Calendar, Outlook or iCal</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Point of Sale (POS) System</h3>
                    <p className="text-sm text-muted-foreground">Connect with your POS system to track orders</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Marketing</h3>
                    <p className="text-sm text-muted-foreground">Connect with email marketing platforms</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
              
              <div className="mt-4">
                <Button variant="outline">Refresh Available Integrations</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
