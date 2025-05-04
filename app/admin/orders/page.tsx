"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { fetchApi } from "@/lib/api-client";

interface Order {
  _id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  contact_phone: string;
  is_active?: boolean;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<Partial<Order>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchApi("/api/v1/orders")
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch orders");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openDialog = (order: Order) => {
    setEditing(order);
    setForm(order);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditing(null);
    setForm({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        // Update
        const updated = await fetchApi(`/api/v1/orders/${editing._id}`, {
          method: "PUT",
          body: form,
        });
        setOrders((ords) => ords.map((o) => (o._id === updated._id ? updated : o)));
        closeDialog();
      }
    } catch {
      setError("Failed to update order");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await fetchApi(`/api/v1/orders/${id}`, { method: "DELETE" });
      setOrders((ords) => ords.filter((o) => o._id !== id));
    } catch {
      setError("Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Manage Orders</h2>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Order ID</th>
                <th className="p-2 border">User ID</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Active</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="p-2 border">{order._id}</td>
                  <td className="p-2 border">{order.user_id}</td>
                  <td className="p-2 border">{order.total_amount}</td>
                  <td className="p-2 border">{order.status}</td>
                  <td className="p-2 border">{order.is_active !== false ? "Yes" : "No"}</td>
                  <td className="p-2 border flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDialog(order)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(order._id)}
                      disabled={deletingId === order._id}
                    >
                      {deletingId === order._id ? "Deleting..." : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Edit Order</AlertDialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input name="status" placeholder="Status" value={form.status || ""} onChange={handleChange} required />
            <Input
              name="shipping_address"
              placeholder="Shipping Address"
              value={form.shipping_address || ""}
              onChange={handleChange}
            />
            <Input
              name="contact_phone"
              placeholder="Contact Phone"
              value={form.contact_phone || ""}
              onChange={handleChange}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
