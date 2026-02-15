import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, Flame } from "lucide-react";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("status", ["pending", "cooking"])
      .order("created_at");
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("kitchen-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const markReady = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "ready" }).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await fetchOrders();
    toast({ title: "Order marked as ready!" });
  };

  const startCooking = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "cooking" }).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await fetchOrders();
    toast({ title: "Started cooking!" });
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const cookingOrders = orders.filter((o) => o.status === "cooking");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary p-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-primary-foreground flex items-center gap-2"><Flame className="w-5 h-5 text-secondary" />Kitchen Board</h1>
        <Button variant="ghost" onClick={handleSignOut} className="text-primary-foreground/70 hover:text-primary-foreground gap-2"><LogOut className="w-4 h-4" />Sign Out</Button>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pending */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400" />Pending ({pendingOrders.length})
            </h2>
            {pendingOrders.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">No pending orders</p></div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="bg-card border-2 border-yellow-300 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">NEW</span>
                      <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="text-sm font-medium">
                          {item.quantity}× {item.item_name}
                          {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                        </div>
                      ))}
                    </div>
                    {order.notes && <p className="text-xs text-muted-foreground italic mb-3">Note: {order.notes}</p>}
                    <Button onClick={() => startCooking(order.id)} className="w-full">Start Cooking</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cooking */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400" />Cooking ({cookingOrders.length})
            </h2>
            {cookingOrders.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">Nothing cooking</p></div>
            ) : (
              <div className="space-y-4">
                {cookingOrders.map((order) => (
                  <div key={order.id} className="bg-card border-2 border-orange-300 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded">COOKING</span>
                      <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="text-sm font-medium">{item.quantity}× {item.item_name}</div>
                      ))}
                    </div>
                    <Button onClick={() => markReady(order.id)} className="w-full bg-green-600 hover:bg-green-700">Mark Ready</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
