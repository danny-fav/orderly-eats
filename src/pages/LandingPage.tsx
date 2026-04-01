import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, User, ChefHat, ArrowRight, MapPin, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const { user, isAdmin } = useAuth();

  const { data: popularItems } = useQuery({
    queryKey: ['popular-items'],
    queryFn: async () => {
      const { data } = await supabase.from('menu_items').select('*').eq('available', true).limit(3);
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative px-6 pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-primary mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Crafted with intention
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-semibold leading-[1.05] tracking-tight text-foreground mb-6">
                Food that tells<br />
                <span className="italic text-primary">a story</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed mb-10">
                Every dish is a narrative of fresh ingredients, masterful technique, and genuine care — delivered straight to your table.
              </p>
              <div className="flex items-center gap-4">
                <Link to="/home">
                  <Button size="lg" className="group">
                    Explore menu
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/my-orders">
                  <Button variant="outline" size="lg">Track order</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-warm to-cream overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChefHat className="w-32 h-32 text-primary/20" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-5 shadow-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. delivery</p>
                    <p className="text-sm font-semibold">25–35 min</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-24 bg-warm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-12"
          >
            {[
              { icon: Sparkles, title: 'Sourced locally', desc: 'Partnerships with local farms ensure the freshest seasonal ingredients.' },
              { icon: ChefHat, title: 'Chef-crafted', desc: 'Each recipe is developed and refined by our culinary team.' },
              { icon: MapPin, title: 'To your door', desc: 'Precision delivery that respects the integrity of every dish.' },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transition-colors group-hover:bg-primary/20">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Dishes */}
      {popularItems && popularItems.length > 0 && (
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-14">
              <div>
                <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">From our kitchen</span>
                <h2 className="text-3xl lg:text-4xl font-display font-semibold">Guest favorites</h2>
              </div>
              <Link to="/home" className="text-sm font-medium text-primary hover:underline underline-offset-4 hidden md:block">
                View full menu →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {popularItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/food/${item.id}`} className="group block">
                    <div className="aspect-[4/3] rounded-2xl bg-cream overflow-hidden mb-4 shadow-sm">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary whitespace-nowrap ml-4">${item.price.toFixed(2)}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-display font-semibold mb-6">Ready to experience<br /><span className="italic">something different?</span></h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto">Order now and discover why our guests keep coming back.</p>
          <Link to="/home">
            <Button size="lg" className="group">
              Start your order
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <h3 className="font-display text-xl font-semibold mb-2">Savora</h3>
            <p className="text-sm text-muted-foreground">Fine dining, delivered.</p>
          </div>
          <div className="flex gap-12 text-sm text-muted-foreground">
            <div className="space-y-2">
              <Link to="/home" className="block hover:text-foreground transition-colors">Menu</Link>
              <Link to="/my-orders" className="block hover:text-foreground transition-colors">Orders</Link>
            </div>
            <div className="space-y-2">
              <Link to="/login" className="block hover:text-foreground transition-colors">Sign in</Link>
              <Link to="/profile" className="block hover:text-foreground transition-colors">Profile</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Savora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
