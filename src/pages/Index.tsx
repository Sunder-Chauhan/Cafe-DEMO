import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Star, Clock, MapPin, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-restaurant.jpg";

const offers = [
  { code: "LOVE20", desc: "20% off your entire order" },
  { code: "COUPLE10", desc: "£10 off orders over £50" },
  { code: "ROSEFREE", desc: "Free dessert with any main" },
];

export default function Index() {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpecials = async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_special", true)
        .eq("is_available", true)
        .limit(4);

      setFeaturedItems(data || []);
      setLoading(false);
    };

    loadSpecials();

    // realtime update when admin edits ⭐
    const channel = supabase
      .channel("specials-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        loadSpecials
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-secondary font-serif tracking-[0.3em] uppercase mb-4">
              Valentine's Edition
            </p>

            <h1 className="font-display text-6xl font-bold text-primary-foreground mb-6">
              Crimson Rose
              <span className="block text-2xl italic text-primary-foreground/80">
                Café & Brasserie
              </span>
            </h1>

            <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8">
              An unforgettable dining experience where luxury meets love.
            </p>

            <div className="flex gap-4 justify-center">
              <Link to="/menu" className="px-8 py-3 bg-secondary text-secondary-foreground">
                View Menu
              </Link>
              <Link to="/login" className="px-8 py-3 border border-primary-foreground/30 text-primary-foreground">
                Order Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-primary py-6">
        <div className="container mx-auto flex justify-center gap-12">
          {[Star, Clock, MapPin, Heart].map((Icon, i) => (
            <Icon key={i} className="text-secondary" />
          ))}
        </div>
      </section>

      {/* CHEF SPECIALS */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase mb-3">Curated Selection</p>
          <h2 className="font-display text-5xl font-bold">Chef's Favourites</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 container mx-auto px-4">

          {loading && (
            <p className="col-span-full text-center text-muted-foreground">
              Loading specials...
            </p>
          )}

          {!loading && featuredItems.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">
              No specials selected by restaurant yet
            </p>
          )}

          {featuredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-card rounded-lg overflow-hidden shadow-card border border-border"
            >
              {item.image_url && (
                <img src={item.image_url} className="w-full h-40 object-cover" />
              )}

              <div className="p-6">
                <span className="text-xs uppercase text-secondary">Chef Special</span>

                <h3 className="font-display text-xl font-semibold mt-2 mb-2 group-hover:text-primary">
                  {item.name}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {item.description || "Today's featured selection"}
                </p>

                <p className="text-2xl font-bold text-primary">
                  £{Number(item.price ?? 0).toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/menu" className="inline-flex items-center gap-2 text-primary">
            View Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* OFFERS */}
      <section className="py-20 bg-primary text-center">
        <h2 className="font-display text-5xl text-primary-foreground mb-12">Valentine's Offers</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {offers.map(o => (
            <div key={o.code} className="border border-secondary/30 rounded-lg p-8">
              <p className="text-secondary text-2xl font-bold">{o.code}</p>
              <p className="text-primary-foreground/70">{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <Heart className="mx-auto text-primary mb-6" />
        <h2 className="font-display text-4xl mb-4">Reserve Your Table</h2>
        <Link to="/contact" className="px-10 py-3 bg-primary text-primary-foreground">
          Book Now
        </Link>
      </section>
    </div>
  );
}
