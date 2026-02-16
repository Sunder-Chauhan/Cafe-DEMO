import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type OrderStatus = "pending" | "cooking" | "ready" | "served" | "cancelled";

const statusFlow: Record<string, OrderStatus> = {
  pending: "cooking",
  cooking: "ready",
  ready: "served",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  cooking: "bg-orange-100 text-orange-800",
  ready: "bg-blue-100 text-blue-800",
  served: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Start Cooking",
  cooking: "Mark Ready",
  ready: "Mark Served",
};

export default function OrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "all">("active");

  // 🔴 IMPORTANT — now joins profiles + tables
  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        profiles(full_name, phone, email),
        cafe_tables(table_number),
        order_items(*)
      `)
      .order("created_at", { ascending: false });

    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const updateStatus = async (orderId: string, currentStatus: string) => {
    const next = statusFlow[currentStatus];
    if (!next) return;

    const { error } = await supabase.from("orders").update({ status: next }).eq("id", orderId);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });

    toast({ title: `Order marked as ${next}` });
  };

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });

    toast({ title: "Order cancelled" });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const activeOrders = orders.filter(o => o.status !== "served" && o.status !== "cancelled");
  const displayOrders = filter === "active" ? activeOrders : orders;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Live Orders</h2>

        <div className="flex gap-2">
          <Button size="sm" variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>
            Active ({activeOrders.length})
          </Button>
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All ({orders.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayOrders.map(order => {

          const profile = order.profiles;
          const table = order.cafe_tables;

          return (
            <div key={order.id} className="bg-card border border-border rounded-lg p-5">

              {/* STATUS */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleTimeString()}
                </span>
              </div>

              {/* ORDER SOURCE */}
              <div className="text-sm mb-3 space-y-1">

                {order.order_type === "dine_in" && (
                  <p><strong>Table:</strong> {table?.table_number ?? "Unknown"}</p>
                )}

                {order.order_type === "pickup" && (
                  <p><strong>Pickup Order</strong></p>
                )}

                {/* USER DETAILS */}
                {profile ? (
                  <>
                    <p><strong>Name:</strong> {profile.full_name ?? "—"}</p>
                    <p><strong>Phone:</strong> {profile.phone ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </>
                ) : (
                  order.is_guest && <p className="text-xs text-muted-foreground">Guest Order</p>
                )}

                {order.coupon_code && (
                  <p className="text-xs text-green-600">Coupon: {order.coupon_code}</p>
                )}
              </div>

              {/* ITEMS */}
              <div className="space-y-1 mb-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.item_name} × {item.quantity}</span>
                    <span>£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="text-xs text-muted-foreground italic mb-3">Note: {order.notes}</p>
              )}

              {/* FOOTER */}
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-bold">£{Number(order.grand_total).toFixed(2)}</span>

                <div className="flex gap-2">
                  {order.status !== "served" && order.status !== "cancelled" && (
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => cancelOrder(order.id)}>
                      Cancel
                    </Button>
                  )}

                  {statusFlow[order.status] && (
                    <Button size="sm" onClick={() => updateStatus(order.id, order.status)}>
                      {statusLabels[order.status]}
                    </Button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
