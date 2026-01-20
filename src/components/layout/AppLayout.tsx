import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

interface AppLayoutProps {
  children: ReactNode;
  settings?: StoreSettings;
  onOpenSettings?: () => void;
}

const navItems = [
  { path: '/', label: 'Kasir', icon: ShoppingCart },
  { path: '/products', label: 'Produk', icon: Package },
  { path: '/transactions', label: 'Riwayat', icon: Receipt },
];

export function AppLayout({ children, settings, onOpenSettings }: AppLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">{settings?.storeName || 'TokoKu'}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
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
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
            >
              <Settings className="h-5 w-5" />
            </Button>
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
