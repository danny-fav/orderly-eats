import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, ChefHat, Image, X, LayoutDashboard, UtensilsCrossed, Settings, Users, CookingPot } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Menu Manager' },
    { to: '/kitchen', icon: CookingPot, label: 'Kitchen' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-6 flex flex-col z-40">
      <Link to="/" className="font-display text-xl font-semibold mb-10 block">Savora</Link>
      <nav className="flex-1 space-y-1">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            location.pathname === l.to ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}>
            <l.icon className="w-4 h-4" /> {l.label}
          </Link>
        ))}
      </nav>
      <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign out</button>
    </aside>
  );
}

export { AdminSidebar };

export default function Dashboard() {
  const qc = useQueryClient();
  const [newCategory, setNewCategory] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: '', image_url: '' });
  const [showAddItem, setShowAddItem] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedItemForImages, setSelectedItemForImages] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      return data || [];
    },
  });

  const { data: menuItems } = useQuery({
    queryKey: ['menu-items-all'],
    queryFn: async () => {
      const { data } = await supabase.from('menu_items').select('*').order('name');
      return data || [];
    },
  });

  const { data: foodImages } = useQuery({
    queryKey: ['food-images', selectedItemForImages],
    queryFn: async () => {
      if (!selectedItemForImages) return [];
      const { data } = await supabase.from('food_images').select('*').eq('menu_item_id', selectedItemForImages).order('sort_order');
      return data || [];
    },
    enabled: !!selectedItemForImages,
  });

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const maxOrder = categories?.reduce((max, c) => Math.max(max, c.sort_order), 0) || 0;
    await supabase.from('categories').insert({ name: newCategory.trim(), sort_order: maxOrder + 1 });
    setNewCategory('');
    qc.invalidateQueries({ queryKey: ['categories'] });
    toast.success('Category added');
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['categories'] });
    toast.success('Category deleted');
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) return;
    await supabase.from('menu_items').insert({
      name: newItem.name,
      price: parseFloat(newItem.price),
      description: newItem.description || null,
      category: newItem.category,
      image_url: newItem.image_url || null,
    });
    setNewItem({ name: '', price: '', description: '', category: '', image_url: '' });
    setShowAddItem(false);
    qc.invalidateQueries({ queryKey: ['menu-items-all'] });
    toast.success('Item added');
  };

  const deleteMenuItem = async (id: string) => {
    await supabase.from('menu_items').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['menu-items-all'] });
    toast.success('Item deleted');
  };

  const toggleAvailability = async (id: string, available: boolean) => {
    await supabase.from('menu_items').update({ available: !available }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['menu-items-all'] });
  };

  const addFoodImage = async () => {
    if (!imageUrl.trim() || !selectedItemForImages) return;
    const maxOrder = foodImages?.reduce((max, i) => Math.max(max, i.sort_order), 0) || 0;
    await supabase.from('food_images').insert({
      menu_item_id: selectedItemForImages,
      image_url: imageUrl.trim(),
      sort_order: maxOrder + 1,
    });
    setImageUrl('');
    qc.invalidateQueries({ queryKey: ['food-images', selectedItemForImages] });
    toast.success('Image added');
  };

  const deleteFoodImage = async (id: string) => {
    await supabase.from('food_images').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['food-images', selectedItemForImages] });
    toast.success('Image removed');
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-5xl">
          <h1 className="text-3xl font-display font-semibold mb-8">Menu Manager</h1>

          {/* Categories */}
          <section className="mb-12">
            <h2 className="text-lg font-display font-semibold mb-4">Categories</h2>
            <div className="flex gap-2 mb-4">
              <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" className="max-w-xs" onKeyDown={e => e.key === 'Enter' && addCategory()} />
              <Button onClick={addCategory} size="sm"><Plus className="w-4 h-4" /> Add</Button>
            </div>
            <div className="space-y-2">
              {categories?.map(cat => (
                <div key={cat.id} className="flex items-center justify-between bg-card rounded-xl border border-border/50 px-4 py-3">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <button onClick={() => deleteCategory(cat.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Menu Items */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold">Menu Items</h2>
              <Button size="sm" onClick={() => setShowAddItem(!showAddItem)}>
                <Plus className="w-4 h-4" /> Add item
              </Button>
            </div>

            {showAddItem && (
              <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6 space-y-3">
                <Input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name" />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="Price" type="number" step="0.01" />
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-4 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <Input value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Description (optional)" />
                <Input value={newItem.image_url} onChange={e => setNewItem({ ...newItem, image_url: e.target.value })} placeholder="Image URL (optional)" />
                <div className="flex gap-2">
                  <Button onClick={addMenuItem}>Save</Button>
                  <Button variant="ghost" onClick={() => setShowAddItem(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {menuItems?.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-card rounded-xl border border-border/50 px-4 py-3">
                  <div className="w-12 h-12 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                    {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ChefHat className="w-5 h-5 text-muted-foreground/20" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category} · ${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedItemForImages(item.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Manage images"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleAvailability(item.id, item.available)}
                    className={cn('text-xs font-medium px-2.5 py-1 rounded-full', item.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </button>
                  <button onClick={() => deleteMenuItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Image Manager Modal */}
          {selectedItemForImages && (
            <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSelectedItemForImages(null)}>
              <div className="bg-background rounded-2xl border border-border p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-semibold">Manage Images</h3>
                  <button onClick={() => setSelectedItemForImages(null)} className="p-1 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex gap-2 mb-4">
                  <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL" onKeyDown={e => e.key === 'Enter' && addFoodImage()} />
                  <Button onClick={addFoodImage} size="sm"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {foodImages?.map(img => (
                    <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-cream">
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => deleteFoodImage(img.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
