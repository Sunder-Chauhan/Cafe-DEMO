import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

export default function StaffManager() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const fetchStaff = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    if (!roles) { setLoading(false); return; }
    const userIds = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
    const merged = (profiles ?? []).map((p) => ({
      ...p,
      role: roles.find((r) => r.user_id === p.user_id)?.role ?? "customer",
    }));
    setStaff(merged);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleUpdateRole = async () => {
    if (!editUser) return;
    const { error } = await supabase.from("user_roles").update({ role: selectedRole as "admin" | "staff" | "kitchen" | "customer" }).eq("user_id", editUser.user_id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Role updated" });
    setEditUser(null);
    fetchStaff();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Staff Manager</h2>
      <div className="space-y-3">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">{s.full_name?.charAt(0) ?? "?"}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{s.full_name}</p>
              <p className="text-sm text-muted-foreground">{s.email}</p>
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase px-2 py-1 rounded-sm bg-primary/10 text-primary">{s.role}</span>
            <Button size="icon" variant="ghost" onClick={() => { setEditUser(s); setSelectedRole(s.role); }}>
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Role for {editUser?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="kitchen">Kitchen</option>
              <option value="customer">Customer</option>
            </select>
            <Button onClick={handleUpdateRole} className="w-full">Update Role</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
