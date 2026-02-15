import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";

export default function SalesReports() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgOrder: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders } = await supabase.from("orders").select("*");
      const { data: profiles } = await supabase.from("profiles").select("id");
      if (orders) {
        const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
        setStats({
          totalRevenue,
          totalOrders: orders.length,
          avgOrder: orders.length ? totalRevenue / orders.length : 0,
          customers: profiles?.length ?? 0,
        });
        setRecentOrders(orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10));
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { label: "Total Revenue", value: `£${stats.totalRevenue.toFixed(2)}`, icon: DollarSign },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag },
    { label: "Avg Order", value: `£${stats.avgOrder.toFixed(2)}`, icon: TrendingUp },
    { label: "Customers", value: stats.customers, icon: Users },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Sales Reports</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-5">
            <Icon className="w-5 h-5 text-primary mb-2" />
            <p className="font-display text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <h3 className="font-display text-lg font-semibold mb-4">Recent Orders</h3>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-left">Type</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Total</th></tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-2">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2">{o.order_type}</td>
                <td className="px-4 py-2"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${o.status === "served" ? "bg-green-100 text-green-700" : o.status === "cooking" ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>{o.status}</span></td>
                <td className="px-4 py-2 text-right font-medium">£{Number(o.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
