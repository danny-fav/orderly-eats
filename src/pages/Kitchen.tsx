import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/Button';
import { AdminSidebar } from '@/pages/Dashboard';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useEffect } from 'react';

const statuses = ['pending', 'preparing', 'ready', 'completed'] as const;
const statusColors: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50/50',
  preparing: 'border-blue-200 bg-blue-50/50',
  ready: 'border-green-200 bg-green-50/50',
  completed: 'border-border bg-muted/30',
};

export default function Kitchen() {
  const qc = useQueryClient();

  const { data: orders, refetch } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .in('status', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: true });
      return data || [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('kitchen')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['kitchen-orders'] });
  };

  const nextStatus = (current: string) => {
    const idx = statuses.indexOf(current as any);
    return idx < statuses.length - 1 ? statuses[idx + 1] : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-display font-semibold mb-8">Kitchen Board</h1>

          <div className="grid md:grid-cols-3 gap-6">
            {(['pending', 'preparing', 'ready'] as const).map(status => (
              <div key={status}>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 capitalize">{status}</h2>
                <div className="space-y-3">
                  {orders?.filter(o => o.status === status).map(order => {
                    const next = nextStatus(order.status);
                    return (
                      <div key={order.id} className={cn('rounded-xl border-2 p-4', statusColors[order.status])}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'h:mm a')}</p>
                            <p className="text-sm font-medium">{order.customer_name || 'Guest'}</p>
                          </div>
                          <span className="text-xs font-semibold text-primary">${order.total.toFixed(2)}</span>
                        </div>
                        <div className="space-y-1 mb-3">
                          {(order as any).order_items?.map((item: any) => (
                            <p key={item.id} className="text-xs text-muted-foreground">{item.quantity}× {item.name}</p>
                          ))}
                        </div>
                        {order.note && <p className="text-xs italic text-muted-foreground mb-3">"{order.note}"</p>}
                        {next && (
                          <Button size="sm" className="w-full" onClick={() => updateStatus(order.id, next)}>
                            Move to {next}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
