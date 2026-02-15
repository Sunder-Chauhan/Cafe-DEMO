import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  is_available: boolean;
  image_url: string | null;
  sort_order: number;
}

interface Category {
  id: string;
  name: string;
  description?: string | null;
  sort_order: number;
}

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    is_available: true
  });

  const fetchData = async () => {
    const [itemsRes, catsRes] = await Promise.all([
      supabase.from("menu_items").select("*").order("sort_order"),
      supabase.from("menu_categories").select("*").order("sort_order"),
    ]);

    setItems(itemsRes.data ?? []);
    setCategories(catsRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ---------------- CATEGORY CRUD ----------------

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    const { error } = await supabase.from("menu_categories").insert({
      name: newCategory,
      description: "",
      sort_order: categories.length + 1
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setNewCategory("");
    fetchData();
  };

  const renameCategory = async (id: string) => {
    const name = prompt("New category name");
    if (!name) return;

    await supabase.from("menu_categories").update({ name }).eq("id", id);
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("menu_items").delete().eq("category_id", id);
    await supabase.from("menu_categories").delete().eq("id", id);
    fetchData();
  };

  // ---------------- ITEM CRUD ----------------

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", description: "", price: "", category_id: categories[0]?.id ?? "", is_available: true });
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category_id: item.category_id,
      is_available: item.is_available
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const data = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      category_id: form.category_id,
      is_available: form.is_available,
    };

    if (editItem) {
      const { error } = await supabase.from("menu_items").update(data).eq("id", editItem.id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Updated", description: "Menu item updated." });
    } else {
      const { error } = await supabase.from("menu_items").insert(data);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Added", description: "Menu item added." });
    }

    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    fetchData();
  };

  const toggleAvailability = async (item: MenuItem) => {
    await supabase.from("menu_items").update({ is_available: !item.is_available }).eq("id", item.id);
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Menu Manager</h2>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Add Item</Button>
      </div>

      {/* ADD CATEGORY */}
      <div className="flex gap-2 mb-6">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="px-3 py-2 border rounded-md text-sm"
        />
        <Button onClick={addCategory}>Add Category</Button>
      </div>

      {/* CATEGORY LIST */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id);

          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display font-semibold text-lg text-primary">{cat.name}</h3>
                <Button size="icon" variant="ghost" onClick={() => renameCategory(cat.id)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => deleteCategory(cat.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>

              {catItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items yet</p>
              ) : (
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {!item.is_available && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">Unavailable</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>

                      <span className="font-bold">£{Number(item.price).toFixed(2)}</span>

                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => toggleAvailability(item)}>
                          <div className={`w-3 h-3 rounded-full ${item.is_available ? "bg-green-500" : "bg-red-500"}`} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ITEM FORM */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Item" : "Add Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 border rounded-md text-sm" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-2 border rounded-md text-sm resize-none" />
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="w-full px-3 py-2 border rounded-md text-sm" />

            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />Available
            </label>

            <Button onClick={handleSave} className="w-full">{editItem ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
