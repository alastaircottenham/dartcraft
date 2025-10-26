import { Outlet, useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: '✨' },
  { id: 'library', label: 'Library', path: '/library', icon: '🎼' },
  { id: 'playlists', label: 'Playlists', path: '/playlists', icon: '🎤' },
  { id: 'stats', label: 'Stats', path: '/stats', icon: '📈' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: '⚙️' },
];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items are matched against current path to determine active state
  // This is handled in the map function below

  return (
    <div className="h-screen bg-ios-light-gray dark:bg-ios-dark-gray flex flex-col">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 min-h-0">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 safe-area-pb z-50">
        <div className="relative">
          {/* Blur backdrop with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/90 backdrop-blur-2xl" />
          
          {/* Top border with gradient */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          
          {/* Nav items */}
          <div className="relative flex items-center justify-around py-3 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/' && location.pathname === '/');
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`
                    relative flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 
                    transition-all duration-300 ease-out rounded-2xl
                    ${isActive 
                      ? 'transform scale-105' 
                      : 'transform scale-100'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/10 to-purple-500/10 dark:from-ios-blue/20 dark:to-purple-500/20 rounded-2xl blur-md" />
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-ios-blue to-purple-500 rounded-full" />
                    </>
                  )}
                  
                  <span className={`
                    relative text-2xl mb-1 transition-all duration-300
                    ${isActive 
                      ? 'transform scale-110' 
                      : 'transform scale-100 opacity-70'
                    }
                  `}>
                    {item.icon}
                  </span>
                  <span className={`
                    relative text-xs font-semibold truncate max-w-full transition-all duration-300
                    ${isActive 
                      ? 'text-ios-blue dark:text-ios-blue' 
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
