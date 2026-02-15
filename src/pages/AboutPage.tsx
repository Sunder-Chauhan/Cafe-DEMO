import { motion } from "framer-motion";
import { Heart, Award, Users, Coffee } from "lucide-react";

const stats = [
  { icon: Coffee, value: "15,000+", label: "Coffees Served" },
  { icon: Users, value: "8,000+", label: "Happy Guests" },
  { icon: Award, value: "12", label: "Awards Won" },
  { icon: Heart, value: "100%", label: "Made with Love" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-primary py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase mb-3">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground">About Us</h1>
        </motion.div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Heart className="w-6 h-6 text-primary mx-auto mb-6 fill-primary/20" />
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">
              Where Passion Meets Plate
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Nestled in the vibrant heart of Manchester, Crimson Rose Café & Brasserie is more than a restaurant — it's a love letter to fine dining. Founded with a vision to create an intimate, luxurious space where every meal becomes a cherished memory.
              </p>
              <p>
                Our chefs draw inspiration from the finest European traditions, blending classic techniques with bold, modern flavours. Every ingredient is sourced with care, every plate composed with artistry, and every moment designed to enchant.
              </p>
              <p>
                This Valentine's season, we invite you to experience our specially curated menu — a celebration of romance, indulgence, and the timeless art of dining well.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <Icon className="w-6 h-6 text-secondary mx-auto mb-3" />
                <p className="font-display text-3xl font-bold text-primary-foreground">{value}</p>
                <p className="text-primary-foreground/60 text-sm mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase mb-3">The Team</p>
          <h2 className="font-display text-3xl font-bold text-foreground mb-12">Meet Our People</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { name: "Oliver Bennett", role: "Owner & Admin" },
              { name: "Amelia Clarke", role: "Manager" },
              { name: "James Wilson", role: "Head Waiter" },
              { name: "Sophie Turner", role: "Senior Staff" },
              { name: "Marco Rossi", role: "Head Chef" },
              { name: "Liam Carter", role: "Sous Chef" },
            ].map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 bg-card rounded-lg border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-primary font-display font-bold">{person.name.charAt(0)}</span>
                </div>
                <h3 className="font-display font-semibold text-foreground">{person.name}</h3>
                <p className="text-sm text-muted-foreground">{person.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
