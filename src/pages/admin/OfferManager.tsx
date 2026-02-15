import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function OfferManager() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ code: "", description: "", discount_type: "percentage", discount_value: "", min_order: "", is_active: true });

  const fetchData = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditItem(null); setForm({ code: "", description: "", discount_type: "percentage", discount_value: "", min_order: "", is_active: true }); setShowForm(true); };

  const openEdit = (c: any) => {
    setEditItem(c);
    setForm({ code: c.code, description: c.description ?? "", discount_type: c.discount_type, discount_value: String(c.discount_value), min_order: c.min_order ? String(c.min_order) : "", is_active: c.is_active });
    setShowForm(true);
  };

  const handleSave = async () => {
    const data = {
      code: form.code.toUpperCase(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order: form.min_order ? parseFloat(form.min_order) : null,
      is_active: form.is_active,
    };

    if (editItem) {
      await supabase.from("coupons").update(data).eq("id", editItem.id);
      toast({ title: "Updated" });
    } else {
      await supabase.from("coupons").insert(data);
      toast({ title: "Added" });
    }
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Offer Manager</h2>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Add Coupon</Button>
      </div>

      <div className="space-y-3">
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">{c.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${c.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{c.is_active ? "Active" : "Inactive"}</span>
              </div>
              <p className="text-sm text-muted-foreground">{c.description ?? `${c.discount_type === "percentage" ? c.discount_value + "%" : "£" + c.discount_value} off`}</p>
              {c.min_order > 0 && <p className="text-xs text-muted-foreground">Min order: £{Number(c.min_order).toFixed(2)}</p>}
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Coupon" : "Add Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code (e.g. LOVE20)" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="Discount value" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            <input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} placeholder="Min order (optional)" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />Active</label>
            <Button onClick={handleSave} className="w-full">{editItem ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
