"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { productsApi, ordersApi } from "@/lib/api-client";
import { useMerchant } from "@/contexts/merchant-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Package, ShoppingBag, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

export default function MerchantDashboardPage() {
  const { merchant } = useMerchant();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  // Sample data for charts
  const salesData = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
    { name: "Apr", sales: 2780 },
    { name: "May", sales: 1890 },
    { name: "Jun", sales: 2390 },
    { name: "Jul", sales: 3490 },
  ];

  const orderStatusData = [
    { name: "Pending", value: 5 },
    { name: "Processing", value: 10 },
    { name: "Shipped", value: 15 },
    { name: "Delivered", value: 20 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const recentOrders = [
    { id: "1", customer: "John Doe", date: "2023-05-15", total: 125.99, status: "Pending" },
    { id: "2", customer: "Jane Smith", date: "2023-05-14", total: 89.5, status: "Processing" },
    { id: "3", customer: "Bob Johnson", date: "2023-05-13", total: 210.75, status: "Shipped" },
    { id: "4", customer: "Alice Brown", date: "2023-05-12", total: 45.25, status: "Delivered" },
  ];

  const topProducts = [
    { id: "1", name: "Wireless Headphones", sold: 42, revenue: 8399.58 },
    { id: "2", name: "Smart Watch", sold: 38, revenue: 9499.62 },
    { id: "3", name: "Bluetooth Speaker", sold: 35, revenue: 3149.65 },
    { id: "4", name: "Laptop Backpack", sold: 31, revenue: 2479.69 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch merchant products
        const products = await productsApi.getMerchantProducts();

        // Fetch merchant orders
        const orders = await ordersApi.getOrders();

        // Calculate stats
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total_amount, 0);
        const pendingOrders = orders.filter((order: any) =>
          ["pending", "processing"].includes(order.status.toLowerCase())
        ).length;

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {merchant.business_name}</h1>
          <p className="text-muted-foreground">Here's what's happening with your store today.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/merchant/products/new">
              <Package className="h-4 w-4 mr-2" />
              Add New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalProducts}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">12%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">8%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">₹{stats.totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">23%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <h3 className="text-2xl font-bold mt-1">{stats.pendingOrders}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500 font-medium">5%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Top Products */}
      <Tabs defaultValue="recent-orders">
        <TabsList>
          <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="top-products">Top Products</TabsTrigger>
        </TabsList>

        <TabsContent value="recent-orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Total</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-3 px-4">#{order.id}</td>
                        <td className="py-3 px-4">{order.customer}</td>
                        <td className="py-3 px-4">{order.date}</td>
                        <td className="py-3 px-4">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Processing"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Shipped"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/merchant/orders/${order.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/merchant/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="top-products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Your best-selling products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Product</th>
                      <th className="text-left py-3 px-4 font-medium">Units Sold</th>
                      <th className="text-left py-3 px-4 font-medium">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.sold}</td>
                        <td className="py-3 px-4">${product.revenue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/merchant/products/${product.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/merchant/products">View All Products</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
