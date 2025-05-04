"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { fetchApi } from "@/lib/api-client";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  is_active?: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchApi("/api/v1/products")
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch products");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openDialog = (product?: Product) => {
    setEditing(product || null);
    setForm(product || {});
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
        const updated = await fetchApi(`/api/v1/products/${editing._id}`, {
          method: "PUT",
          body: form,
        });
        setProducts((prods) => prods.map((p) => (p._id === updated._id ? updated : p)));
      } else {
        // Create
        const created = await fetchApi("/api/v1/products", {
          method: "POST",
          body: form,
        });
        setProducts((prods) => [...prods, created]);
      }
      closeDialog();
    } catch {
      setError("Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await fetchApi(`/api/v1/products/${id}`, { method: "DELETE" });
      setProducts((prods) => prods.filter((p) => p._id !== id));
    } catch {
      setError("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Manage Products</h2>
        <Button onClick={() => openDialog()}>Create Product</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Stock</th>
                <th className="p-2 border">Active</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">{product.description || "-"}</td>
                  <td className="p-2 border">{product.price}</td>
                  <td className="p-2 border">{product.stock_quantity}</td>
                  <td className="p-2 border">{product.is_active ? "Yes" : "No"}</td>
                  <td className="p-2 border flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDialog(product)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product._id)}
                      disabled={deletingId === product._id}
                    >
                      {deletingId === product._id ? "Deleting..." : "Delete"}
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
          <AlertDialogTitle>{editing ? "Edit Product" : "Create Product"}</AlertDialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input name="name" placeholder="Name" value={form.name || ""} onChange={handleChange} required />
            <Input
              name="description"
              placeholder="Description"
              value={form.description || ""}
              onChange={handleChange}
            />
            <Input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price || ""}
              onChange={handleChange}
              required
            />
            <Input
              name="stock_quantity"
              type="number"
              placeholder="Stock"
              value={form.stock_quantity || ""}
              onChange={handleChange}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save" : "Create"}</Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
