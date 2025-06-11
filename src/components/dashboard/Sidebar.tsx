
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Table,
  UserCog, 
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
        'flex items-center gap-3 rounded-lg transition-all duration-200',
        collapsed ? 'p-2 justify-center' : 'px-4 py-3', // When collapsed (icon-only, true for mobile), use p-2. Else px-4 py-3.
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
  // Determine if the sidebar is in a mobile-like (bottom bar) context based on its classes
  // This is a proxy; a more robust way might involve a prop or context if complexity grows.
  const isMobileView = className?.includes('md:hidden') || false;
  
  const [collapsed, setCollapsed] = useState(isMobileView); // Default to collapsed if mobile view
  const [activePath, setActivePath] = useState('/');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    setActivePath(path);
    // If mobile view, ensure it's always in the 'collapsed' (icon-only) state for links
    if (isMobileView) {
      setCollapsed(true);
    }
  }, [location, isMobileView]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string) => {
    setActivePath(path);
  };

  return (
    <div className={cn(
      'bg-card transition-all duration-300',
      // Desktop/tablet sidebar: flex-col, specific widths, border-r
      'md:flex md:flex-col md:border-r',
      isMobileView ? 'flex flex-row justify-around items-center h-16' : (collapsed ? 'w-[70px]' : 'w-[250px]'),
      className
    )}>
      {/* Logo and Collapse Toggle - Hidden on mobile view */}
      <div className={cn("p-4 items-center justify-between border-b", isMobileView ? "hidden" : "flex")}>
        {!collapsed ? (
          <div className="flex items-center">
            <img 
              src="/xpressdine-logo.svg"
              alt="XpressDine Logo" 
              className="h-8 mr-2 w-auto" 
            />
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <img 
              src="/xpressdine-logo.svg"
              alt="XpressDine Logo" 
              className="h-8 w-auto" 
            />
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className={cn("p-1.5 rounded-md hover:bg-accent transition-colors ml-auto", collapsed && !isMobileView ? "mr-1" : "")}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className={cn(
        "flex-1", 
        isMobileView ? "flex flex-row items-center justify-around w-full px-1" : "py-4 space-y-1 px-2 flex flex-col"
      )}>
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
          icon={<Users size={20} />}
          label="Team Management"
          active={activePath === '/team'}
          collapsed={collapsed}
          onClick={() => handleNavigation('/team')}
        />

        {/* Settings Links - Hidden on mobile view for simplicity */}
        <div className={cn("mt-8 pt-4 border-t", isMobileView ? "hidden" : "block")}>
          <SidebarLink
            to="/user-settings"
            icon={<UserCog size={20} />}
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
      </nav>
    </div>
  );
}
