import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Tag, X } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, discount, couponCode, clearCart, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<"dine_in" | "pickup" | "delivery">("dine_in");
  const [tableNumber, setTableNumber] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstAmount = 0;
  const grandTotal = total + gstAmount;

  // ================= VALIDATION =================

  const validate = (): string | null => {
    if (items.length === 0) return "Your cart is empty.";

    if (orderType === "dine_in" && !tableNumber.trim())
      return "Table number is required.";

    if (orderType === "pickup" || orderType === "delivery") {
      if (!user) return "Login required for pickup or delivery.";
      if (!customerName.trim()) return "Full name is required.";
      if (!customerPhone.trim()) return "Phone number is required.";
    }

    if (orderType === "delivery" && !customerAddress.trim())
      return "Full delivery address is required.";

    return null;
  };

  // ================= COUPON APPLY =================

  const handleApplyCoupon = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to use coupons",
        variant: "destructive"
      });
      return;
    }

    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      toast({ title: "Invalid coupon", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    // per-user usage limit check
    const { data: usage } = await supabase
      .from("coupon_usages")
      .select("used_count")
      .eq("coupon_id", data.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      usage &&
      data.usage_limit_per_user !== null &&
      usage.used_count >= data.usage_limit_per_user
    ) {
      toast({
        title: "Coupon limit reached",
        description: "You have already used this coupon maximum allowed times",
        variant: "destructive"
      });
      setCouponLoading(false);
      return;
    }

    const err = applyCoupon(
      data.code,
      data.discount_type,
      data.discount_value,
      data.min_order
    );

    if (!err) setCouponInput("");

    setCouponLoading(false);
  };

  // ================= PLACE ORDER =================

  const handlePlaceOrder = async () => {
  const err = validate();
  if (err) {
    toast({ title: "Validation Error", description: err, variant: "destructive" });
    return;
  }

  setLoading(true);

  try {
    let profileId: string | null = null;

    // 🔹 Fetch profile ID if user logged in
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      profileId = profile?.id ?? null;
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_id: profileId, // ✅ correct foreign key

        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address:
          orderType === "delivery" ? customerAddress : null,

        order_type: orderType,

        table_number:
          orderType === "dine_in" && tableNumber.trim() !== ""
            ? parseInt(tableNumber)
            : null,

        total: subtotal,
        discount: discount || 0,
        coupon_code: couponCode || null,
        notes: notes || null,
        status: "pending",
        is_guest: !user,
        gst_amount: gstAmount,
        grand_total: grandTotal,
        payment_method: "cash",
        payment_status: "unpaid",
      })
      .select()
      .single();

    if (error) throw error;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      item_id: item.id,
      item_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    await supabase.from("order_items").insert(orderItems);

    // 🔹 Increment coupon usage only AFTER successful order
    if (couponCode && user) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("id")
        .eq("code", couponCode)
        .single();

      if (coupon) {
        await supabase.rpc("increment_coupon_usage", {
          uid: user.id,
          cid: coupon.id,
        });
      }
    }

    clearCart();
    setSuccess(true);
    toast({ title: "Order placed successfully" });

  } catch (e: any) {
    toast({
      title: "Order failed",
      description: e.message,
      variant: "destructive",
    });
  }

  setLoading(false);
};


  // ================= SUCCESS =================

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <Button onClick={() => navigate("/menu")} className="mt-6">
            Back to Menu
          </Button>
        </motion.div>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-2xl space-y-6">

        {/* ORDER SUMMARY */}
        <div className="bg-card p-6 border rounded-lg space-y-3">
          <h2 className="font-bold text-lg">Invoice</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>£{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({couponCode})</span>
                <span>-£{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Grand Total</span>
              <span>£{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ORDER TYPE */}
        <div className="flex gap-2">
          {["dine_in", "pickup", "delivery"].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type as any)}
              className={`flex-1 py-2 rounded ${
                orderType === type ? "bg-primary text-white" : "bg-muted"
              }`}
            >
              {type.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* TABLE */}
        {orderType === "dine_in" && (
          <input
            type="number"
            placeholder="Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full px-3 py-2 border rounded"
          />
        )}

        {/* CONTACT SECTION */}
        {(orderType === "pickup" || orderType === "delivery") && (
          <div className="bg-card p-4 border rounded-lg space-y-3">
            <h3 className="font-semibold">Contact Information</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="tel"
              placeholder="Phone (numeric only)"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}

        {/* DELIVERY ADDRESS */}
        {orderType === "delivery" && (
          <textarea
            placeholder="Full Address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded resize-none"
            rows={3}
          />
        )}

        {/* COUPON */}
        <div className="bg-card p-4 border rounded-lg">
          <h3 className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4" /> Coupon Code
          </h3>

          {!user && (
            <p className="text-sm text-muted-foreground mb-2">
              Login required to use coupons
            </p>
          )}

          {couponCode ? (
            <div className="flex justify-between items-center">
              <span>{couponCode} applied</span>
              <button onClick={removeCoupon}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
                placeholder="Enter coupon"
              />
              <Button onClick={handleApplyCoupon} disabled={couponLoading}>
                Apply
              </Button>
            </div>
          )}
        </div>

        <Button onClick={handlePlaceOrder} disabled={loading} className="w-full py-4">
          {loading ? "Placing Order..." : `Place Order · £${grandTotal.toFixed(2)}`}
        </Button>

      </div>
    </div>
  );
}
