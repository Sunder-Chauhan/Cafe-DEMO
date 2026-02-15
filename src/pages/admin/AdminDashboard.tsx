import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, UtensilsCrossed, Tag, Users, Grid3X3, MessageSquare, BarChart3, LogOut, ClipboardList } from "lucide-react";
import MenuManager from "./MenuManager";
import OfferManager from "./OfferManager";
import StaffManager from "./StaffManager";
import TableManager from "./TableManager";
import ContactInbox from "./ContactInbox";
import SalesReports from "./SalesReports";
import OrderManager from "./OrderManager";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "offers", label: "Offers", icon: Tag },
  { id: "staff", label: "Staff", icon: Users },
  { id: "tables", label: "Tables", icon: Grid3X3 },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary min-h-screen p-6 hidden md:flex flex-col">
        <h1 className="font-display text-xl font-bold text-primary-foreground mb-8">Admin Panel</h1>
        <nav className="flex-1 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === id ? "bg-secondary text-secondary-foreground" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>
        <Button variant="ghost" onClick={handleSignOut} className="text-primary-foreground/70 hover:text-primary-foreground gap-2 justify-start">
          <LogOut className="w-4 h-4" />Sign Out
        </Button>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                activeTab === id ? "bg-secondary text-secondary-foreground" : "text-primary-foreground/70"
              }`}
            >
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-6 md:p-8 md:pt-8 pt-16 overflow-y-auto">
        {activeTab === "overview" && <OverviewPanel />}
        {activeTab === "orders" && <OrderManager />}
        {activeTab === "menu" && <MenuManager />}
        {activeTab === "offers" && <OfferManager />}
        {activeTab === "staff" && <StaffManager />}
        {activeTab === "tables" && <TableManager />}
        {activeTab === "messages" && <ContactInbox />}
        {activeTab === "reports" && <SalesReports />}
      </main>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">Dashboard Overview</h2>
      <p className="text-muted-foreground">Select a section from the sidebar to manage your café.</p>
    </div>
  );
}
