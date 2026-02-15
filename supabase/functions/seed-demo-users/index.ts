import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const demoUsers = [
    { email: "admin@demo.com", password: "Demo@123", full_name: "Demo Admin", role: "admin" },
    { email: "staff@demo.com", password: "Demo@123", full_name: "Demo Staff", role: "staff" },
    { email: "kitchen@demo.com", password: "Demo@123", full_name: "Demo Kitchen", role: "kitchen" },
    { email: "customer@demo.com", password: "Demo@123", full_name: "Demo Customer", role: "customer" },
  ];

  const results: any[] = [];

  for (const u of demoUsers) {
    // Check if user exists
    const { data: existing } = await adminClient.auth.admin.listUsers();
    const found = existing?.users?.find((x: any) => x.email === u.email);

    let userId: string;

    if (found) {
      userId = found.id;
      results.push({ email: u.email, status: "already_exists", userId });
    } else {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });
      if (error) {
        results.push({ email: u.email, status: "error", error: error.message });
        continue;
      }
      userId = data.user.id;
      results.push({ email: u.email, status: "created", userId });
    }

    // Ensure profile exists (trigger should handle this, but just in case)
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      await adminClient.from("profiles").insert({
        user_id: userId,
        full_name: u.full_name,
        email: u.email,
      });
    }

    // Upsert role
    const { data: existingRole } = await adminClient
      .from("user_roles")
      .select("id, role")
      .eq("user_id", userId)
      .single();

    if (existingRole) {
      if (existingRole.role !== u.role) {
        await adminClient
          .from("user_roles")
          .update({ role: u.role })
          .eq("user_id", userId);
      }
    } else {
      await adminClient.from("user_roles").insert({
        user_id: userId,
        role: u.role,
      });
    }
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
