
import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LogOut, Settings, Plus } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const userInfo = {
    name: "David Rodriguez",
    role: "Restaurant Manager",
    lastLogin: "2025-05-22T09:30:00",
    initials: "DR"
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar className="flex-shrink-0 h-screen sticky top-0" />
      <div className="flex-1">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Quick Add</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-6 flex-col space-y-2 hover:bg-slate-100"
                      onClick={() => {
                        setIsQuickAddOpen(false);
                        navigate('/reservations');
                      }}
                    >
                      <span className="text-3xl">📅</span>
                      <span>New Reservation</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-6 flex-col space-y-2 hover:bg-slate-100"
                      onClick={() => {
                        setIsQuickAddOpen(false);
                        navigate('/guests');
                      }}
                    >
                      <span className="text-3xl">👥</span>
                      <span>New Guest</span>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <PopoverTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-medium cursor-pointer transition-shadow hover:shadow-md">
                    {userInfo.initials}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center font-medium text-lg">
                        {userInfo.initials}
                      </div>
                      <div>
                        <p className="font-medium">{userInfo.name}</p>
                        <p className="text-sm text-muted-foreground">{userInfo.role}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last login: {new Date(userInfo.lastLogin).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-3 grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => {
                          setUserMenuOpen(false);
                          window.location.href = "/user-settings";
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        User Settings
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => {
                          setUserMenuOpen(false);
                          window.location.href = "/organization-settings";
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Organization
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start col-span-2" 
                        onClick={() => {
                          handleLogout();
                          setUserMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
