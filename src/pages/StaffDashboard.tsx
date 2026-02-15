import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut, ChefHat } from "lucide-react";

type OrderStatus = "pending" | "cooking" | "ready" | "served" | "cancelled";
const statusFlow: Record<string, OrderStatus> = { pending: "cooking", cooking: "ready", ready: "served" };
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  cooking: "bg-orange-100 text-orange-800",
  ready: "bg-blue-100 text-blue-800",
  served: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function StaffDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("staff-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (orderId: string, currentStatus: string) => {
    const next = statusFlow[currentStatus];
    if (!next) return;
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await fetchOrders();
    toast({ title: `Order marked as ${next}` });
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const activeOrders = orders.filter((o) => o.status !== "served" && o.status !== "cancelled");
  const completedOrders = orders.filter((o) => o.status === "served" || o.status === "cancelled");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary p-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-primary-foreground flex items-center gap-2"><ChefHat className="w-5 h-5" />Staff Orders</h1>
        <Button variant="ghost" onClick={handleSignOut} className="text-primary-foreground/70 hover:text-primary-foreground gap-2"><LogOut className="w-4 h-4" />Sign Out</Button>
      </header>

      <div className="p-6 space-y-8">
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Active Orders ({activeOrders.length})</h2>
          {activeOrders.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">No active orders</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold tracking-wider uppercase px-2 py-1 rounded ${statusColors[order.status]}`}>{order.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Type: {order.order_type} {order.table_id && `• Table`}</p>
                  <div className="space-y-1 mb-4">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.item_name} × {item.quantity}</span>
                        <span>£{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="font-bold">£{Number(order.total).toFixed(2)}</span>
                    {statusFlow[order.status] && (
                      <Button size="sm" onClick={() => updateStatus(order.id, order.status)}>
                        Mark {statusFlow[order.status]}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {completedOrders.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Completed ({completedOrders.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-lg p-4 opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${statusColors[order.status]}`}>{order.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm font-medium">£{Number(order.total).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
