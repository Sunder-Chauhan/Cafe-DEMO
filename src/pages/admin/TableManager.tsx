import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TableManager() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ table_number: "", seats: "2" });

  const fetchTables = async () => {
    const { data } = await supabase.from("cafe_tables").select("*").order("table_number");
    setTables(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTables(); }, []);

  const handleAdd = async () => {
    const { error } = await supabase.from("cafe_tables").insert({ table_number: parseInt(form.table_number), seats: parseInt(form.seats) });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Table added" });
    setShowForm(false);
    fetchTables();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("cafe_tables").delete().eq("id", id);
    toast({ title: "Table removed" });
    fetchTables();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("cafe_tables").update({ status: status as "available" | "occupied" | "reserved" }).eq("id", id);
    fetchTables();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Table Manager</h2>
        <Button onClick={() => { setForm({ table_number: "", seats: "2" }); setShowForm(true); }} className="gap-2"><Plus className="w-4 h-4" />Add Table</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map((t) => (
          <div key={t.id} className={`bg-card border rounded-lg p-4 text-center ${t.status === "occupied" ? "border-destructive/50" : t.status === "reserved" ? "border-secondary" : "border-border"}`}>
            <p className="font-display text-2xl font-bold">{t.table_number}</p>
            <p className="text-xs text-muted-foreground mb-2">{t.seats} seats</p>
            <select
              value={t.status}
              onChange={(e) => updateStatus(t.id, e.target.value)}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-background mb-2"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
            </select>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)} className="text-destructive w-full"><Trash2 className="w-3 h-3 mr-1" />Remove</Button>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Table</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <input type="number" value={form.table_number} onChange={(e) => setForm({ ...form, table_number: e.target.value })} placeholder="Table number" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            <input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} placeholder="Seats" className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" />
            <Button onClick={handleAdd} className="w-full">Add Table</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
