import { Home, Search, Heart, User, Download } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const navigationItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Search', url: '/', icon: Search },
  { title: 'Saved', url: '/saved', icon: Heart },
  { title: 'Downloads', url: '/downloads', icon: Download },
  { title: 'Profile', url: '/profile', icon: User },
];

export default function BottomNavigation() {
  const location = useLocation();
  const { user } = useAuth() || {};
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          // Hide profile tab if user is not logged in
          if (item.title === 'Profile' && !user) return null;
          
          const isActive = currentPath === item.url;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}