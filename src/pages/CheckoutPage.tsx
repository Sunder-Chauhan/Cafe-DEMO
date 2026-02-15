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
  const [orderType, setOrderType] = useState<"dine_in" | "pickup">("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstAmount = 0;
  const grandTotal = total + gstAmount;

  const validate = (): string | null => {
    if (items.length === 0) return "Your cart is empty.";
    if (orderType === "dine_in" && !tableNumber.trim()) return "Please enter a table number for dine-in orders.";
    if (grandTotal <= 0) return "Order total must be greater than zero.";
    return null;
  };

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
    if (!code) {
      toast({ title: "Enter a coupon code", variant: "destructive" });
      return;
    }
    setCouponLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      toast({ title: "Invalid coupon", description: "This coupon code is not valid or has expired.", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast({ title: "Coupon expired", description: "This coupon has expired.", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    const err = applyCoupon(data.code, data.discount_type, data.discount_value, data.min_order);
    if (err) {
      toast({ title: "Cannot apply coupon", description: err, variant: "destructive" });
    } else {
      toast({ title: "Coupon applied!", description: `${data.code} — ${data.discount_type === "percentage" ? `${data.discount_value}% off` : `£${data.discount_value} off`}` });
      setCouponInput("");
    }
    setCouponLoading(false);
  };

  const handlePlaceOrder = async () => {
    const err = validate();
    if (err) {
      toast({ title: "Validation Error", description: err, variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      let tableId: string | null = null;
      if (orderType === "dine_in" && tableNumber) {
        const { data: tbl } = await supabase
          .from("cafe_tables")
          .select("id")
          .eq("table_number", parseInt(tableNumber))
          .single();
        tableId = tbl?.id ?? null;
      }

      const isGuest = !user;

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          customer_id: user?.id ?? null,
          order_type: orderType,
          table_id: tableId,
          total: subtotal,
          discount: discount || 0,
          coupon_code: couponCode || null,
          notes: notes || null,
          status: "pending",
          is_guest: isGuest,
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

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      setSuccess(true);
      toast({ title: "Order placed!", description: "Your order has been submitted." });
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">Your order is being prepared. Thank you!</p>
          <Button onClick={() => navigate("/menu")}>Back to Menu</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-16 text-center">
        <h1 className="font-display text-4xl font-bold text-primary-foreground">Checkout</h1>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Button onClick={() => navigate("/menu")}>Browse Menu</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Items summary */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount ({couponCode})</span><span>-£{discount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-sm text-muted-foreground"><span>GST</span><span>£{gstAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-base"><span>Grand Total</span><span>£{grandTotal.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              {/* Order type */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Order Type</h2>
                <div className="flex gap-3">
                  {(["dine_in", "pickup"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`flex-1 py-3 rounded-md text-sm font-medium tracking-wider uppercase transition-colors ${
                        orderType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {type === "dine_in" ? "Dine In" : "Pickup"}
                    </button>
                  ))}
                </div>

                {orderType === "dine_in" && (
                  <div className="mt-4">
                    <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-1 block">Table Number *</label>
                    <input
                      type="number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary"
                      placeholder="Enter table number"
                    />
                  </div>
                )}
              </div>

              {/* Coupon code */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Coupon Code
                </h2>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-muted rounded-md px-4 py-3">
                    <span className="text-sm font-medium text-foreground">
                      {couponCode} applied — <span className="text-primary">£{discount.toFixed(2)} off</span>
                    </span>
                    <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      className="flex-1 px-4 py-3 bg-background border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary uppercase"
                      placeholder="Enter coupon code"
                    />
                    <Button onClick={handleApplyCoupon} disabled={couponLoading} variant="outline">
                      {couponLoading ? "Checking..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Payment info */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Payment</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">Cash</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-amber-600">Unpaid (pay at counter)</span></div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Special Notes</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Any special requests..."
                />
              </div>

              {!user && (
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-foreground">Ordering as <strong>Guest</strong>. <a href="/login" className="text-primary underline">Sign in</a> to track your orders.</p>
                </div>
              )}

              <Button className="w-full py-6 text-base" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? "Placing Order..." : `Place Order · £${grandTotal.toFixed(2)}`}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
