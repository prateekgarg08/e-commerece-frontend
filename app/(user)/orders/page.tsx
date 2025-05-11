"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ordersApi } from "@/lib/api-client";
import type { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Package, Clock, CheckCircle, TruckIcon, AlertCircle, ArchiveIcon } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load your orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  // Group orders by status
  const pendingOrders = orders.filter((order) =>
    ["pending", "processing", "shipped"].includes(order.status.toLowerCase())
  );

  const completedOrders = orders.filter((order) => order.status.toLowerCase() === "delivered");

  const cancelledOrders = orders.filter((order) => order.status.toLowerCase() === "cancelled");

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="text-center p-12 border rounded-lg">
          <ArchiveIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onOrderChanged={fetchOrders} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {pendingOrders.length > 0 ? (
            pendingOrders.map((order) => <OrderCard key={order._id} order={order} onOrderChanged={fetchOrders} />)
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">No active orders</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedOrders.length > 0 ? (
            completedOrders.map((order) => <OrderCard key={order._id} order={order} onOrderChanged={fetchOrders} />)
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">No completed orders</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-6">
          {cancelledOrders.length > 0 ? (
            cancelledOrders.map((order) => <OrderCard key={order._id} order={order} onOrderChanged={fetchOrders} />)
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-muted-foreground">No cancelled orders</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onOrderChanged?: () => void;
}

function OrderCard({ order, onOrderChanged }: OrderCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(order.status)}
              Order #{order._id.slice(-8)}
            </CardTitle>
            <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
          </div>
          <div className="text-right">
            <div>{getStatusBadge(order.status)}</div>
            <div className="text-sm font-medium mt-1">₹{order.total_amount.toFixed(2)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Items</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">Shipping Address</h4>
              <p className="text-muted-foreground">{order.shipping_address}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Contact</h4>
              <p className="text-muted-foreground">{order.contact_phone}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col sm:flex-row justify-between gap-2">
          {/* <Button variant="outline" size="sm" asChild>
            <Link href={`/orders/${order._id}`}>View Details</Link>
          </Button> */}
          <div className="flex gap-2">
            {/* {order.status.toLowerCase() === "delivered" && (
              <Button variant="outline" size="sm">
                Write a Review
              </Button>
            )} */}
            {order.status.toLowerCase() === "pending" && (
              <CancelOrderButton orderId={order._id} onOrderChanged={onOrderChanged} />
            )}
            {/* <Button variant="outline" size="sm">
              Get Support
            </Button> */}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function CancelOrderButton({ orderId, onOrderChanged }: { orderId: string; onOrderChanged?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      await ordersApi.cancelOrder(orderId);
      if (onOrderChanged) onOrderChanged();
    } catch (err) {
      const apiError = err as { data?: { detail?: string } };
      setError(apiError?.data?.detail || "Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
        {loading ? "Cancelling..." : "Cancel Order"}
      </Button>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </>
  );
}
