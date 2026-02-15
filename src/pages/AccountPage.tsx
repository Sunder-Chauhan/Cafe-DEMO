import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Package, LogOut } from "lucide-react";

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("orders").select("*, order_items(*)").eq("customer_id", user.id).order("created_at", { ascending: false }),
    ]).then(([profileRes, ordersRes]) => {
      setProfile(profileRes.data);
      setOrders(ordersRes.data ?? []);
      setLoading(false);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-16 text-center">
        <h1 className="font-display text-4xl font-bold text-primary-foreground">My Account</h1>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
              <div>
                <h2 className="font-display text-lg font-semibold">{profile?.full_name || "Guest"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2"><LogOut className="w-4 h-4" />Sign Out</Button>
          </motion.div>

          {/* Order History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2"><Package className="w-5 h-5" />Order History</h2>
            {orders.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground">No orders yet.</p>
                <Button variant="link" onClick={() => navigate("/menu")}>Browse Menu</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-card rounded-lg border border-border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold tracking-wider uppercase px-2 py-1 rounded-sm ${
                        order.status === "served" ? "bg-green-100 text-green-700" :
                        order.status === "cooking" ? "bg-orange-100 text-orange-700" :
                        order.status === "ready" ? "bg-blue-100 text-blue-700" :
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-muted text-muted-foreground"
                      }`}>{order.status}</span>
                      <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-1">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.item_name} × {item.quantity}</span>
                          <span>£{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border mt-3 pt-3 flex justify-between font-semibold text-sm">
                      <span>Total</span><span>£{Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
