
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Table,
  MessageSquare, 
  Settings,
  LogOut,
  ChevronLeft, 
  ChevronRight,
  Building
} from 'lucide-react';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  label,
  to,
  active = false,
  collapsed = false,
  onClick
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        collapsed ? 'justify-center' : '',
        active 
          ? 'bg-brand-orange text-white font-medium' 
          : 'hover:bg-accent'
      )}
    >
      <div className="flex-shrink-0 w-5 h-5">{icon}</div>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activePath, setActivePath] = useState('/');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    setActivePath(path);
  }, [location]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string) => {
    setActivePath(path);
  };

  return (
    <div className={cn(
      'flex flex-col border-r bg-card transition-all duration-300',
      collapsed ? 'w-[70px]' : 'w-[250px]',
      className
    )}>
      <div className="p-4 flex items-center justify-between border-b">
        {!collapsed ? (
          <div className="flex items-center">
            <img 
              src="https://xpressdine.com/wp-content/uploads/2023/06/Android-app-111-01-1.png" 
              alt="XpressDine Logo" 
              className="h-8 mr-2" 
            />
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <img 
              src="https://xpressdine.com/wp-content/uploads/2023/06/Android-app-111-01-1.png" 
              alt="XpressDine Logo Icon" 
              className="h-8" 
            />
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-accent transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 py-4 space-y-1 px-2">
        <SidebarLink
          to="/"
          icon={<Home size={20} />}
          label="Home"
          active={activePath === '/' || activePath === '/dashboard'}
          collapsed={collapsed}
          onClick={() => handleNavigation('/')}
        />
        <SidebarLink
          to="/guests"
          icon={<Users size={20} />}
          label="Guests"
          active={activePath === '/guests'}
          collapsed={collapsed}
          onClick={() => handleNavigation('/guests')}
        />
        <SidebarLink
          to="/reservations"
          icon={<Calendar size={20} />}
          label="Reservations"
          active={activePath === '/reservations'}
          collapsed={collapsed}
          onClick={() => handleNavigation('/reservations')}
        />
        <SidebarLink
          to="/tables"
          icon={<Table size={20} />}
          label="Tables"
          active={activePath === '/tables'}
          collapsed={collapsed}
          onClick={() => handleNavigation('/tables')}
        />
        <SidebarLink
          to="/team"
          icon={<MessageSquare size={20} />}
          label="Team Management"
          active={activePath === '/team'}
          collapsed={collapsed}
          onClick={() => handleNavigation('/team')}
        />

        <div className="mt-8 pt-4 border-t">
          <SidebarLink
            to="/app-settings"
            icon={<Settings size={20} />}
            label="App Settings"
            active={activePath === '/app-settings'}
            collapsed={collapsed}
            onClick={() => handleNavigation('/app-settings')}
          />
          <SidebarLink
            to="/user-settings"
            icon={<Users size={20} />}
            label="User Settings"
            active={activePath === '/user-settings'}
            collapsed={collapsed}
            onClick={() => handleNavigation('/user-settings')}
          />
          <SidebarLink
            to="/organization-settings"
            icon={<Building size={20} />}
            label="Organization Settings"
            active={activePath === '/organization-settings'}
            collapsed={collapsed}
            onClick={() => handleNavigation('/organization-settings')}
          />
        </div>
      </div>
    </div>
  );
}
