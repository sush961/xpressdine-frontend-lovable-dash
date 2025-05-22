
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Grid3X3, 
  MessageSquare, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight 
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
        {!collapsed && (
          <div className="font-semibold text-xl text-brand-orange">
            XpressDine
          </div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 py-4 space-y-1 px-2">
        <SidebarLink
          to="/"
          icon={<Home size={20} />}
          label="Home"
          active={activePath === '/'}
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
          icon={<Grid3X3 size={20} />}
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
        <SidebarLink
          to="/payments"
          icon={<CreditCard size={20} />}
          label="Payments"
          active={activePath === '/payments'}
          collapsed={collapsed}
          onClick={() => handleNavigation('/payments')}
        />
      </div>
    </div>
  );
}
