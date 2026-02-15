import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

interface Category { id: string; name: string; sort_order: number; }
interface MenuItem { id: string; name: string; description: string | null; price: number; category_id: string; is_available: boolean; image_url: string | null; }

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetch = async () => {
      const [catsRes, itemsRes] = await Promise.all([
        supabase.from("menu_categories").select("*").order("sort_order"),
        supabase.from("menu_items").select("*").order("sort_order"),
      ]);
      const cats = catsRes.data ?? [];
      setCategories(cats);
      setItems(itemsRes.data ?? []);
      if (cats.length > 0) setActive(cats[0].id);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    if (!item.is_available) return;
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
    toast({ title: "Added to cart", description: `${item.name} added.` });
  };

  const activeItems = items.filter((i) => i.category_id === active && i.is_available);
  const activeCatName = categories.find((c) => c.id === active)?.name ?? "";

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase mb-3">Discover</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground">Our Menu</h1>
          <p className="mt-4 text-primary-foreground/60 max-w-lg mx-auto">Every dish crafted with passion, every sip curated with love.</p>
        </motion.div>
      </section>

      <div className="sticky top-16 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex items-center gap-1 py-3 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`px-4 py-2 text-xs font-medium tracking-widest uppercase rounded-sm transition-all whitespace-nowrap ${
                  active === cat.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-12">
              <Heart className="w-5 h-5 text-secondary mx-auto mb-3 fill-secondary/30" />
              <h2 className="font-display text-3xl font-bold text-foreground">{activeCatName}</h2>
            </div>

            {activeItems.length === 0 ? (
              <div className="text-center py-12"><p className="text-muted-foreground">No items available in this category.</p></div>
            ) : (
              <div className="space-y-0">
                {activeItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start justify-between py-6 border-b border-border last:border-0 group"
                  >
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                      {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                      <p className="font-display text-lg font-bold text-primary whitespace-nowrap">£{Number(item.price).toFixed(2)}</p>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-burgundy-light transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
