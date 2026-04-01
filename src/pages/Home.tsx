import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ChefHat, Plus, ShoppingBag, Minus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user } = useAuth();
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      return data || [];
    },
  });

  const { data: menuItems } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data } = await supabase.from('menu_items').select('*').eq('available', true).order('name');
      return data || [];
    },
  });

  const filteredItems = selectedCategory
    ? menuItems?.filter(i => i.category === selectedCategory)
    : menuItems;

  const handleOrder = async () => {
    if (!user) { toast.error('Please sign in to place an order'); return; }
    if (items.length === 0) return;
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user.id,
      total,
      status: 'pending',
      note: note || null,
      customer_name: user.user_metadata?.display_name || user.email,
    }).select().single();
    if (error || !order) { toast.error('Failed to place order'); return; }
    const orderItems = items.map(i => ({
      order_id: order.id,
      menu_item_id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));
    await supabase.from('order_items').insert(orderItems);
    clearCart();
    setCartOpen(false);
    setNote('');
    toast.success('Order placed!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">Our selection</span>
          <h1 className="text-4xl lg:text-5xl font-display font-semibold">The Menu</h1>
        </div>

        {/* Category filters */}
        {categories && categories.length > 0 && (
          <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                !selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
              )}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  selectedCategory === cat.name ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems?.map((item, i) => {
            const inCart = items.find(c => c.id === item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/food/${item.id}`}>
                  <div className="aspect-[4/3] bg-cream overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-10 h-10 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <Link to={`/food/${item.id}`}>
                      <h3 className="font-medium text-foreground hover:text-primary transition-colors">{item.name}</h3>
                    </Link>
                    <span className="text-sm font-semibold text-primary ml-3">${item.price.toFixed(2)}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                  )}
                  {inCart ? (
                    <div className="flex items-center gap-3">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, inCart.quantity - 1)}>
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{inCart.quantity}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, inCart.quantity + 1)}>
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => {
                      addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
                      toast.success(`${item.name} added`);
                    }}>
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {(!filteredItems || filteredItems.length === 0) && (
          <div className="text-center py-20 text-muted-foreground">
            <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No items available yet.</p>
          </div>
        )}
      </div>

      {/* Cart FAB */}
      {itemCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full px-6 py-3.5 shadow-lg shadow-primary/20 flex items-center gap-2.5 font-medium text-sm hover:bg-primary/90 transition-all active:scale-95 z-40"
        >
          <ShoppingBag className="w-4.5 h-4.5" />
          {itemCount} items · ${total.toFixed(2)}
        </button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold">Your order</h2>
                <button onClick={() => setCartOpen(false)} className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 py-3">
                    <div className="w-14 h-14 rounded-xl bg-cream flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ChefHat className="w-5 h-5 text-muted-foreground/20" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <textarea
                    placeholder="Add a note (allergies, preferences...)"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full h-20 rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-lg">${total.toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleOrder}>
                  Place order
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
