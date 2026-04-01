import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Clock, CheckCircle, ChefHat } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useEffect } from 'react';

const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
  pending: { icon: Clock, label: 'Pending', color: 'text-amber-600 bg-amber-50' },
  preparing: { icon: ChefHat, label: 'Preparing', color: 'text-blue-600 bg-blue-50' },
  ready: { icon: CheckCircle, label: 'Ready', color: 'text-green-600 bg-green-50' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-muted-foreground bg-muted' },
};

export default function MyOrders() {
  const { user } = useAuth();

  const { data: orders, refetch } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('my-orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refetch]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">Your activity</span>
        <h1 className="text-3xl lg:text-4xl font-display font-semibold mb-10">My Orders</h1>

        {!user ? (
          <p className="text-muted-foreground">Please sign in to view your orders.</p>
        ) : orders && orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No orders yet. Start exploring our menu!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map(order => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}</p>
                      <p className="font-semibold mt-0.5">${order.total.toFixed(2)}</p>
                    </div>
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full', status.color)}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {(order as any).order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                        <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {order.note && (
                    <p className="text-xs text-muted-foreground mt-3 italic">Note: {order.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
