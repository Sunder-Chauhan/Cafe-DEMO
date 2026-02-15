import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Trash2, Mail, MailOpen } from "lucide-react";

export default function ContactInbox() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleRead = async (msg: any) => {
    await supabase.from("contact_messages").update({ is_read: !msg.is_read }).eq("id", msg.id);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    toast({ title: "Message deleted" });
    fetchMessages();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Contact Messages</h2>
      {messages.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg"><p className="text-muted-foreground">No messages yet.</p></div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-card border rounded-lg p-5 ${msg.is_read ? "border-border" : "border-primary/30 bg-primary/5"}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{msg.name}</p>
                  <p className="text-sm text-muted-foreground">{msg.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</span>
                  <Button size="icon" variant="ghost" onClick={() => toggleRead(msg)}>
                    {msg.is_read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4 text-primary" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(msg.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm text-foreground">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
