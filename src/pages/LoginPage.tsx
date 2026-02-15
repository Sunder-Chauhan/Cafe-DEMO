import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, getRoleDashboard } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, role } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast({ title: "Please fill all fields", variant: "destructive" }); return; }
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      // Wait a moment for role to load then redirect
      setTimeout(async () => {
        const { data } = await (await import("@/integrations/supabase/client")).supabase
          .from("user_roles").select("role").eq("user_id", (await (await import("@/integrations/supabase/client")).supabase.auth.getUser()).data.user?.id ?? "").single();
        const r = data?.role as any ?? "customer";
        navigate(getRoleDashboard(r));
        setLoading(false);
      }, 500);
    } else {
      if (!name) { toast({ title: "Please enter your name", variant: "destructive" }); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      toast({ title: "Account created!", description: "You can now sign in." });
      setIsLogin(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Heart className="w-8 h-8 text-secondary mx-auto mb-4 fill-secondary/30" />
          <h1 className="font-display text-3xl font-bold text-primary-foreground">
            {isLogin ? "Welcome Back" : "Join Us"}
          </h1>
          <p className="text-primary-foreground/60 mt-2 text-sm">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-8 shadow-luxury">
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-1 block">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Your name" />
              </div>
            )}
            <div>
              <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-1 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary transition-colors" placeholder="your@email.com" />
            </div>
            <div>
              <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-1 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary transition-colors pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-semibold tracking-wider uppercase text-sm hover:bg-burgundy-light transition-colors mt-2 disabled:opacity-50">
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

          {isLogin && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-3 text-center">Demo Accounts</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Admin:</span><span>admin@demo.com</span></div>
                <div className="flex justify-between"><span>Staff:</span><span>staff@demo.com</span></div>
                <div className="flex justify-between"><span>Kitchen:</span><span>kitchen@demo.com</span></div>
                <div className="flex justify-between"><span>Customer:</span><span>customer@demo.com</span></div>
                <p className="text-center mt-2 text-muted-foreground/70">Password: Demo@123</p>
              </div>
            </div>
          )}
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-primary-foreground/50 text-sm hover:text-secondary transition-colors">← Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
}
