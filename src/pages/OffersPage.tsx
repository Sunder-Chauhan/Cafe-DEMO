import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_order: number | null;
  expires_at: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (!error) setOffers(data || []);
      setLoading(false);
    };

    fetchOffers();
  }, []);

  const formatDiscount = (o: Coupon) => {
    if (o.discount_type === "percentage") return `${o.discount_value}% OFF`;
    return `£${o.discount_value} OFF`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading offers...
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase mb-3">Special</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground">
            Today's Offers
          </h1>
          <p className="mt-4 text-primary-foreground/60 max-w-lg mx-auto">
            Automatically updated promotions managed by the restaurant.
          </p>
        </motion.div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">

            {offers.length === 0 && (
              <p className="text-center text-muted-foreground">No active offers today</p>
            )}

            {offers.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-lg border border-border p-8 shadow-card hover:shadow-luxury transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold tracking-wider uppercase rounded-sm mb-2">
                      {offer.code}
                    </span>

                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {formatDiscount(offer)}
                    </h3>

                    <p className="text-muted-foreground mb-2">
                      {offer.description}
                    </p>

                    {offer.min_order && (
                      <p className="text-xs text-muted-foreground/70 italic">
                        Minimum order £{offer.min_order}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Expires: {new Date(offer.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

          </div>
        </div>
      </section>
    </div>
  );
}
