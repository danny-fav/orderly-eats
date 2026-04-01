import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { LogOut, User } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">Account</span>
        <h1 className="text-3xl font-display font-semibold mb-10">Profile</h1>

        <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user.user_metadata?.display_name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Email verified</span>
              <span className="font-medium">{user.email_confirmed_at ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-8" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
