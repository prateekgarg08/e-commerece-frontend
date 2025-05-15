"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { fetchApi, ordersApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Truck, Home, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import Script from "next/script";
import Image from "next/image";
const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(4, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(10, "Phone number is required"),
  shippingMethod: z.enum(["standard", "express", "overnight"]),
  paymentMethod: z.enum(["credit_card", "paypal", "razorpay"]),
  // Credit card fields (only required if payment method is credit_card)
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  // Notes
  orderNotes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  // If cart is empty or user is not logged in, redirect
  if (typeof window !== "undefined") {
    if (cart.items.length === 0) {
      router.push("/cart");
    }
    if (!user) {
      router.push("/login?redirect=checkout");
    }
  }

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || "",
      fullName: user?.full_name || "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "US",
      phone: "",
      shippingMethod: "standard",
      paymentMethod: "razorpay",
      orderNotes: "",
    },
  });

  const subtotal = cart.total;
  const shippingMethod = form.watch("shippingMethod");

  let shippingCost = 0;
  switch (shippingMethod) {
    case "express":
      shippingCost = 14.99;
      break;
    case "overnight":
      shippingCost = 24.99;
      break;
    default: // standard
      shippingCost = 8.99;
  }

  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  // Razorpay payment handler
  const handleRazorpayPayment = async (values: CheckoutFormValues) => {
    setRazorpayLoading(true);
    setError(null);
    try {
      // Create Razorpay order via API
      const data = await fetchApi("/api/v1/orders/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          amount: Math.round(total * 100), // in paise
          currency: "INR",
          receipt: `order_rcptid_${Date.now()}`,
        },
      });

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Set this in your .env.local
        amount: Math.round(total * 100),
        currency: "INR",
        name: "E-Commerce Shop",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          // On successful payment, create the order in your DB
          try {
            const orderItems = cart.items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            }));
            const shippingAddress = `${values.address}, ${values.city}, ${values.state} ${values.zip}, ${values.country}`;
            const orderData = {
              items: orderItems,
              total_amount: total,
              shipping_address: shippingAddress,
              contact_phone: values.phone,
              payment_id: response.razorpay_payment_id,
              payment_method: "razorpay",
            };
            const newOrder = await ordersApi.createOrder(orderData);
            clearCart();
            toast({
              title: "Order placed successfully!",
              description: "Your order has been received and is being processed.",
            });
            router.push(`/orders/${newOrder._id}`);
          } catch {
            setError("Order creation failed after payment. Please contact support.");
          }
        },
        prefill: {
          name: values.fullName,
          email: values.email,
          contact: values.phone,
        },
        theme: { color: "#3399cc" },
      };
      // @ts-expect-error: Razorpay is not typed on window object
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: { error: { description?: string } }) {
        setError(response.error.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: unknown) {
      setError((err as Error).message || "Razorpay payment failed");
    } finally {
      setRazorpayLoading(false);
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (values.paymentMethod === "razorpay") {
      await handleRazorpayPayment(values);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert cart items to order items
      const orderItems = cart.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      // Prepare shipping address
      const shippingAddress = `${values.address}, ${values.city}, ${values.state} ${values.zip}, ${values.country}`;

      // Create order
      const orderData = {
        items: orderItems,
        total_amount: total,
        shipping_address: shippingAddress,
        contact_phone: values.phone,
      };

      // Call the API to create the order
      const newOrder = await ordersApi.createOrder(orderData);

      // Clear the cart
      clearCart();

      // Show success message
      toast({
        title: "Order placed successfully!",
        description: "Your order has been received and is being processed.",
      });

      // Redirect to order confirmation
      router.push(`/orders/${newOrder._id}`);
    } catch (err) {
      console.error("Order creation error:", err);
      setError("Failed to place your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP/Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="IN">India</SelectItem>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Shipping Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="shippingMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                            <div className="flex items-center space-x-2 border p-4 rounded-lg">
                              <RadioGroupItem value="standard" id="standard" />
                              <Label htmlFor="standard" className="flex-1">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">Standard Shipping</div>
                                    <div className="text-sm text-muted-foreground">Delivery in 5-7 business days</div>
                                  </div>
                                  <div className="font-medium">₹8.99</div>
                                </div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-4 rounded-lg">
                              <RadioGroupItem value="express" id="express" />
                              <Label htmlFor="express" className="flex-1">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">Express Shipping</div>
                                    <div className="text-sm text-muted-foreground">Delivery in 2-3 business days</div>
                                  </div>
                                  <div className="font-medium">₹14.99</div>
                                </div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-4 rounded-lg">
                              <RadioGroupItem value="overnight" id="overnight" />
                              <Label htmlFor="overnight" className="flex-1">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">Overnight Shipping</div>
                                    <div className="text-sm text-muted-foreground">Delivery the next business day</div>
                                  </div>
                                  <div className="font-medium">₹24.99</div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                            <div className="flex items-center space-x-2 border p-4 rounded-lg">
                              <RadioGroupItem value="razorpay" id="razorpay" />
                              <Label htmlFor="razorpay" className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Image src="/image.png" alt="Razorpay" width={20} height={20} />
                                  <span>Razorpay</span>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Razorpay Loading Spinner */}
                  {razorpayLoading && (
                    <div className="flex items-center mt-4 text-blue-600">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initializing Razorpay...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="orderNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Special instructions for delivery or any other notes"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order
              </Button>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cart Items (Collapsed) */}
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 items-start">
              <div className="flex items-center text-sm text-muted-foreground">
                <Truck className="h-4 w-4 mr-2" />
                <span>Free shipping on orders over ₹50</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Home className="h-4 w-4 mr-2" />
                <span>30-day return policy</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
