import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const contactInfo = [
  { icon: MapPin, label: "Location", value: "Manchester, UK" },
  { icon: Phone, label: "Phone", value: "+44 7700 900321" },
  { icon: Mail, label: "Email", value: "hello@crimsonrosecafe.co.uk" },
  { icon: Clock, label: "Hours", value: "Mon–Fri 8am–11pm" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({ name: name.trim(), email: email.trim(), message: message.trim() });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setName(""); setEmail(""); setMessage("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase mb-3">Get in Touch</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground">Contact Us</h1>
        </motion.div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Heart className="w-5 h-5 text-primary mb-4 fill-primary/20" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Visit Us</h2>
              <div className="space-y-6">
                {contactInfo.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">{label}</p>
                      <p className="text-foreground font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-card rounded-lg border border-border">
                <h3 className="font-display font-semibold text-foreground mb-3">Opening Hours</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>Monday – Friday</span><span>8am – 11pm</span></div>
                  <div className="flex justify-between"><span>Saturday</span><span>8am – 12am</span></div>
                  <div className="flex justify-between"><span>Sunday</span><span>9am – 10pm</span></div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-1 block">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-1 block">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary transition-colors" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-1 block">Message</label>
                  <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none" placeholder="Your message..." />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-semibold tracking-wider uppercase text-sm hover:bg-burgundy-light transition-colors disabled:opacity-50">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <a href="https://wa.me/918542999607" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">Or reach us on WhatsApp →</a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
