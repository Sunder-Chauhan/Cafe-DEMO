import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Star, Clock, MapPin, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-restaurant.jpg";

const featuredItems = [
  { name: "Rosewood Couple Platter", price: "£29.90", category: "Valentine Special", desc: "A romantic platter for two with our finest selections" },
  { name: "Gold Cappuccino", price: "£3.80", category: "Signature Brew", desc: "24k gold dust atop our award-winning cappuccino" },
  { name: "Lava Cake", price: "£6.90", category: "Dessert", desc: "Warm chocolate fondant with a molten centre" },
  { name: "Champagne Strawberries", price: "£9.90", category: "Valentine Special", desc: "Fresh strawberries dipped in champagne ganache" },
];

const offers = [
  { code: "LOVE20", desc: "20% off your entire order", color: "bg-primary" },
  { code: "COUPLE10", desc: "£10 off orders over £50", color: "bg-burgundy-dark" },
  { code: "ROSEFREE", desc: "Free dessert with any main", color: "bg-primary" },
];

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury Valentine dining at Crimson Rose"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <p className="text-secondary font-serif text-lg md:text-xl tracking-[0.3em] uppercase mb-4">
              Valentine's Edition
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-tight mb-6">
              Crimson Rose
              <span className="block font-serif text-2xl md:text-3xl font-light italic mt-2 text-primary-foreground/80">
                Café & Brasserie
              </span>
            </h1>
            <p className="text-primary-foreground/70 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light">
              An unforgettable dining experience where luxury meets love. Manchester's most romantic destination.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/menu"
                className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold tracking-wider uppercase text-sm hover:bg-gold-light transition-all duration-300 shadow-gold"
              >
                View Menu
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border border-primary-foreground/30 text-primary-foreground font-medium tracking-wider uppercase text-sm hover:bg-primary-foreground/10 transition-all duration-300"
              >
                Order Now
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-secondary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Strip */}
      <section className="bg-primary py-6">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { icon: Star, text: "Michelin Recommended" },
            { icon: Clock, text: "Open 7 Days a Week" },
            { icon: MapPin, text: "Heart of Manchester" },
            { icon: Heart, text: "Valentine Specials" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-primary-foreground/80">
              <Icon className="w-4 h-4 text-secondary" />
              <span className="text-xs tracking-widest uppercase font-medium">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase mb-3">Curated Selection</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Chef's Favourites</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-card rounded-lg p-6 shadow-card hover:shadow-luxury transition-all duration-500 border border-border"
              >
                <span className="text-xs font-medium tracking-widest uppercase text-secondary">{item.category}</span>
                <h3 className="font-display text-xl font-semibold mt-2 mb-2 text-card-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                <p className="font-display text-2xl font-bold text-primary">{item.price}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-primary font-medium tracking-wider uppercase text-sm hover:gap-4 transition-all duration-300"
            >
              View Full Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Offers */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase mb-3">Limited Time</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">Valentine's Offers</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {offers.map((offer, i) => (
              <motion.div
                key={offer.code}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 border border-secondary/30 rounded-lg hover:border-secondary/60 transition-colors"
              >
                <p className="text-secondary font-display text-2xl font-bold mb-2">{offer.code}</p>
                <p className="text-primary-foreground/70 text-sm">{offer.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="w-8 h-8 text-primary mx-auto mb-6 fill-primary/20" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Reserve Your Table
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Make this Valentine's unforgettable. Book your table at Crimson Rose for an evening of exquisite cuisine and romantic ambiance.
            </p>
            <Link
              to="/contact"
              className="inline-block px-10 py-3 bg-primary text-primary-foreground font-semibold tracking-wider uppercase text-sm hover:bg-burgundy-light transition-colors shadow-luxury"
            >
              Book Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
