"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ordersApi } from "@/lib/api-client";
import type { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Search, AlertCircle, Filter, Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await ordersApi.getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you might want to call the API with search params
    // For now, we'll just filter the existing orders
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updatedOrder = await ordersApi.updateOrder(orderId, {
        status: newStatus,
      });

      setOrders(orders.map((order) => (order._id === orderId ? updatedOrder : order)));

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update the order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter orders based on search query, status, and date
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order._id.includes(searchQuery) ||
      order.shipping_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.contact_phone.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesDate = true;
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      matchesDate = order.created_at.startsWith(today);
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(order.created_at) >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = new Date(order.created_at) >= monthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Group orders by status
  const pendingOrders = filteredOrders.filter((order) => order.status.toLowerCase() === "pending");
  const processingOrders = filteredOrders.filter((order) => order.status.toLowerCase() === "processing");
  const shippedOrders = filteredOrders.filter((order) => order.status.toLowerCase() === "shipped");
  const deliveredOrders = filteredOrders.filter((order) => order.status.toLowerCase() === "delivered");
  const cancelledOrders = filteredOrders.filter((order) => order.status.toLowerCase() === "cancelled");

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <ShoppingBag className="h-5 w-5" />;
    }
  };

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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center text-destructive mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage and track your customer orders</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search by order ID, address, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Orders ({filteredOrders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({processingOrders.length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({shippedOrders.length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({deliveredOrders.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderOrdersTable(filteredOrders)}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {renderOrdersTable(pendingOrders)}
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          {renderOrdersTable(processingOrders)}
        </TabsContent>

        <TabsContent value="shipped" className="mt-6">
          {renderOrdersTable(shippedOrders)}
        </TabsContent>

        <TabsContent value="delivered" className="mt-6">
          {renderOrdersTable(deliveredOrders)}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {renderOrdersTable(cancelledOrders)}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderOrdersTable(orders: Order[]) {
    if (orders.length === 0) {
      return (
        <div className="text-center p-12 border rounded-lg">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No orders found</h2>
          <p className="text-muted-foreground mb-6">
            {filteredOrders.length === 0 && orders.length === 0
              ? "You haven't received any orders yet."
              : "No orders match your current filters."}
          </p>
          {filteredOrders.length > 0 && orders.length === 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left py-3 px-4 font-medium">Order ID</th>
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Customer</th>

              <th className="text-left py-3 px-4 font-medium">Total</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="py-3 px-4">
                  <div className="font-medium">#{order._id.slice(-8)}</div>
                </td>
                <td className="py-3 px-4">
                  <div>{formatDate(order.created_at)}</div>
                  <div className="text-sm text-muted-foreground">{formatTime(order.created_at)}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{order.user_name}</div>
                  <div className="text-sm text-muted-foreground">{order.shipping_address}</div>
                  <div className="text-sm text-muted-foreground">{order.contact_phone}</div>
                </td>
                <td className="py-3 px-4">₹{order.total_amount.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    {getStatusBadge(order.status)}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    {order.status.toLowerCase() === "pending" && (
                      <Button size="sm" onClick={() => handleUpdateOrderStatus(order._id, "processing")}>
                        Process
                      </Button>
                    )}

                    {order.status.toLowerCase() === "processing" && (
                      <Button size="sm" onClick={() => handleUpdateOrderStatus(order._id, "shipped")}>
                        Ship
                      </Button>
                    )}

                    {order.status.toLowerCase() === "shipped" && (
                      <Button size="sm" onClick={() => handleUpdateOrderStatus(order._id, "delivered")}>
                        Mark Delivered
                      </Button>
                    )}

                    {["pending", "processing"].includes(order.status.toLowerCase()) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
