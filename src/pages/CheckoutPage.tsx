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

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPostcode, setDeliveryPostcode] = useState("");

  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstAmount = 0;
  const grandTotal = total + gstAmount;

  // ---------------- VALIDATION ----------------

  const validate = (): string | null => {
    if (items.length === 0) return "Your cart is empty.";

    if (orderType === "dine_in" && !tableNumber.trim())
      return "Table number required.";

    if ((orderType === "pickup" || orderType === "delivery") && !user) {
      if (!guestName.trim()) return "Name required.";
      if (!guestPhone.trim()) return "Phone required.";
    }

    if (orderType === "delivery") {
      if (!deliveryAddress.trim()) return "Delivery address required.";
      if (!deliveryPostcode.trim()) return "Postcode required.";
    }

    if (grandTotal <= 0) return "Order total must be greater than zero.";

    return null;
  };

  // ---------------- COUPON APPLY ----------------

  const handleApplyCoupon = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to use coupons",
        variant: "destructive",
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

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast({ title: "Coupon expired", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    const { data: usage } = await supabase
      .from("coupon_usages")
      .select("used_count")
      .eq("coupon_id", data.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      usage &&
      data.usage_limit_per_user &&
      usage.used_count >= data.usage_limit_per_user
    ) {
      toast({
        title: "Coupon limit reached",
        variant: "destructive",
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

    if (!err) {
      toast({ title: "Coupon applied!" });
      setCouponInput("");
    }

    setCouponLoading(false);
  };

  // ---------------- PLACE ORDER ----------------

  const handlePlaceOrder = async () => {
    const err = validate();
    if (err) {
      toast({ title: err, variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      let tableId: string | null = null;

      if (orderType === "dine_in") {
        const { data } = await supabase
          .from("cafe_tables")
          .select("id")
          .eq("table_number", parseInt(tableNumber))
          .single();
        tableId = data?.id ?? null;
      }

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          customer_id: user?.id ?? null,

          // guest fields
          guest_name: !user ? guestName : null,
          guest_phone: !user ? guestPhone : null,
          guest_email: !user ? guestEmail : null,

          order_type: orderType,
          table_id: tableId,
          delivery_address: orderType === "delivery" ? deliveryAddress : null,
          delivery_postcode: orderType === "delivery" ? deliveryPostcode : null,

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

      // record coupon usage
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
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }

    setLoading(false);
  };

  // ---------------- SUCCESS PAGE ----------------

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          <Button onClick={() => navigate("/menu")}>Back to Menu</Button>
        </motion.div>
      </div>
    );
  }

  // ---------------- MAIN UI ----------------

  return (
    <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto space-y-6">

      {/* ORDER TYPE */}
      <div className="flex gap-2">
        {(["dine_in", "pickup", "delivery"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`flex-1 py-3 rounded ${
              orderType === type
                ? "bg-primary text-white"
                : "bg-muted"
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* PICKUP / DELIVERY CONTACT */}
      {(orderType === "pickup" || orderType === "delivery") && !user && (
        <div className="space-y-3">
          <input
            placeholder="Full Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-3 border rounded"
          />

          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Phone Number"
            value={guestPhone}
            onChange={(e) =>
              setGuestPhone(e.target.value.replace(/\D/g, ""))
            }
            className="w-full p-3 border rounded"
          />

          <input
            type="email"
            placeholder="Email (optional)"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>
      )}

      {/* DELIVERY ADDRESS */}
      {orderType === "delivery" && (
        <div className="space-y-3">
          <input
            placeholder="Delivery Address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full p-3 border rounded"
          />

          <input
            placeholder="Postcode"
            value={deliveryPostcode}
            onChange={(e) => setDeliveryPostcode(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>
      )}

      {/* PLACE ORDER */}
      <Button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full py-5 text-lg"
      >
        {loading ? "Placing Order..." : `Place Order · £${grandTotal.toFixed(2)}`}
      </Button>
    </div>
  );
}
