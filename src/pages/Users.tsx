import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/pages/Dashboard';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { User, Shield } from 'lucide-react';

export default function Users() {
  const qc = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at');
      if (!profiles) return [];
      const { data: roles } = await supabase.from('user_roles').select('*');
      return profiles.map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.id)?.role || 'user',
      }));
    },
  });

  const toggleRole = async (userId: string, currentRole: string) => {
    if (currentRole === 'admin') {
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      toast.success('User role updated');
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      toast.success('User promoted to admin');
    }
    qc.invalidateQueries({ queryKey: ['all-users'] });
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-display font-semibold mb-8">Users</h1>
          <div className="space-y-2">
            {users?.map(user => (
              <div key={user.id} className="flex items-center gap-4 bg-card rounded-xl border border-border/50 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {user.role === 'admin' ? <Shield className="w-4.5 h-4.5 text-primary" /> : <User className="w-4.5 h-4.5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{user.display_name || 'Unnamed'}</p>
                  <p className="text-xs text-muted-foreground">{user.phone || user.id.slice(0, 8)}</p>
                </div>
                <Button
                  size="sm"
                  variant={user.role === 'admin' ? 'default' : 'outline'}
                  onClick={() => toggleRole(user.id, user.role)}
                >
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
