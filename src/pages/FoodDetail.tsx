import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus, ChefHat, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

export default function FoodDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [currentImage, setCurrentImage] = useState(0);

  const { data: item } = useQuery({
    queryKey: ['menu-item', id],
    queryFn: async () => {
      const { data } = await supabase.from('menu_items').select('*').eq('id', id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: images } = useQuery({
    queryKey: ['food-images', id],
    queryFn: async () => {
      const { data } = await supabase.from('food_images').select('*').eq('menu_item_id', id!).order('sort_order');
      return data || [];
    },
    enabled: !!id,
  });

  if (!item) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const allImages = [
    ...(item.image_url ? [{ id: 'main', image_url: item.image_url }] : []),
    ...(images || []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-24">
        <Link to="/home" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to menu
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl bg-cream overflow-hidden relative shadow-sm">
              {allImages.length > 0 ? (
                <motion.img
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={allImages[currentImage].image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ChefHat className="w-16 h-16 text-muted-foreground/20" />
                </div>
              )}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage(i => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImage(i => (i + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-4">
                {allImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === currentImage ? 'border-primary shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:pt-4">
            <span className="text-xs font-medium tracking-widest uppercase text-primary mb-3 block">{item.category}</span>
            <h1 className="text-3xl lg:text-4xl font-display font-semibold mb-4">{item.name}</h1>
            <p className="text-2xl font-semibold text-primary mb-6">${item.price.toFixed(2)}</p>
            {item.description && (
              <p className="text-muted-foreground leading-relaxed mb-8">{item.description}</p>
            )}
            <Button size="lg" onClick={() => {
              addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
              toast.success(`${item.name} added to cart`);
            }}>
              <Plus className="w-4 h-4" /> Add to order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
