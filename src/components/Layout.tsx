import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, User } from "lucide-react";
import { useAuth, getRoleDashboard } from "@/contexts/AuthContext";
import CartSheet from "@/components/CartSheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/offers", label: "Offers" },
  { href: "/contact", label: "Contact" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-burgundy-light/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-secondary fill-secondary" />
            <span className="font-display text-xl font-bold text-primary-foreground tracking-wide">Crimson Rose</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${
                  location.pathname === link.href ? "text-secondary" : "text-primary-foreground/80 hover:text-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <CartSheet />
            {user ? (
              <Link
                to={getRoleDashboard(role)}
                className="ml-2 px-5 py-2 bg-secondary text-secondary-foreground text-sm font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors flex items-center gap-1"
              >
                <User className="w-4 h-4" />Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="ml-4 px-5 py-2 bg-secondary text-secondary-foreground text-sm font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors"
              >
                Login
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <CartSheet />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-primary-foreground">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-primary border-t border-burgundy-light/20 overflow-hidden"
            >
              <nav className="flex flex-col items-center py-6 gap-4">
                {navLinks.map((link) => (
                  <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} className={`text-sm font-medium tracking-widest uppercase ${location.pathname === link.href ? "text-secondary" : "text-primary-foreground/80"}`}>
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Link to={getRoleDashboard(role)} onClick={() => setMobileOpen(false)} className="mt-2 px-6 py-2 bg-secondary text-secondary-foreground text-sm font-semibold tracking-wider uppercase rounded-sm">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="mt-2 px-6 py-2 bg-secondary text-secondary-foreground text-sm font-semibold tracking-wider uppercase rounded-sm">
                    Login
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-xl font-bold text-secondary mb-4">Crimson Rose Café & Brasserie</h3>
              <p className="text-sm text-primary-foreground/70 leading-relaxed">A luxury dining experience in the heart of Manchester. Fine cuisine, handcrafted drinks, and unforgettable moments.</p>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Opening Hours</h4>
              <div className="space-y-1 text-sm text-primary-foreground/70">
                <p>Mon – Fri: 8am – 11pm</p>
                <p>Saturday: 8am – 12am</p>
                <p>Sunday: 9am – 10pm</p>
              </div>
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-1 text-sm text-primary-foreground/70">
                <p>Manchester, UK</p>
                <p>+44 7700 900321</p>
                <p>hello@crimsonrosecafe.co.uk</p>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-burgundy-light/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-primary-foreground/50">© 2026 Crimson Rose Café & Brasserie. All rights reserved.</p>
            <p className="text-xs text-primary-foreground/50 flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-rose fill-rose" /> by{" "}
              <a href="https://wa.me/918542999607" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">WebOrigin</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
