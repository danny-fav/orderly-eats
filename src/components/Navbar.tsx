import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight">
          Savora
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/home">
            <Button variant="ghost" size="sm" className={cn(location.pathname === '/home' && 'bg-accent')}>Menu</Button>
          </Link>
          <Link to="/my-orders">
            <Button variant="ghost" size="sm" className={cn(location.pathname === '/my-orders' && 'bg-accent')}>Orders</Button>
          </Link>
          {isAdmin && (
            <Link to="/dashboard">
              <Button variant="ghost" size="sm"><LayoutDashboard className="w-4 h-4 mr-1" />Admin</Button>
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/home" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="w-4.5 h-4.5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <Link to="/profile">
              <Button variant="ghost" size="icon"><User className="w-4.5 h-4.5" /></Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-2">
          <Link to="/home" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>Menu</Link>
          <Link to="/my-orders" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>Orders</Link>
          {isAdmin && <Link to="/dashboard" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>Admin</Link>}
          {user ? (
            <Link to="/profile" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>Profile</Link>
          ) : (
            <Link to="/login" className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>Sign in</Link>
          )}
        </div>
      )}
    </nav>
  );
}
