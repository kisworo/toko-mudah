import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Receipt,
  Menu,
  X,
  Store,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StoreSettings } from '@/types';
import { api } from '@/lib/api';

interface AppLayoutProps {
  children: ReactNode;
  settings?: StoreSettings;
  onOpenSettings?: () => void;
  isAuthenticated?: boolean;
}

const navItems = [
  { path: '/cashier', label: 'Kasir', icon: ShoppingCart },
  { path: '/products', label: 'Produk', icon: Package },
  { path: '/transactions', label: 'Riwayat', icon: Receipt },
];

export function AppLayout({ children, settings, onOpenSettings, isAuthenticated = false }: AppLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Get store name: from settings, or from user's business name (full_name)
  const getStoreName = () => {
    if (settings?.storeName) return settings.storeName;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.full_name || 'TokoKu';
    }
    return 'TokoKu';
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    api.clearToken();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      {settings?.backgroundImage && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 pointer-events-none z-0"
          style={{ backgroundImage: `url(${settings.backgroundImage})` }}
        />
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to={isAuthenticated ? "/cashier" : "/"} className="flex items-center gap-2">
            {settings?.storeLogo ? (
              <div className="h-8 w-8 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src={settings.storeLogo}
                  alt="Logo toko"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <span className="text-lg font-semibold">{getStoreName()}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {navItems.map(item => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={onOpenSettings}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  Keluar
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Masuk</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Daftar</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 md:hidden">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-card p-2 animate-fade-in">
            {isAuthenticated ? (
              <>
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={location.pathname === item.path ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2 mb-1"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  Keluar
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 p-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Masuk</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start">Daftar</Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-4 md:py-6 relative z-10">
        {children}
      </main>
    </div>
  );
}
