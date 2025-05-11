"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { fetchApi } from "@/lib/api-client";

interface Category {
  _id: string;
  name: string;
  description?: string;
  parent_id?: string;
  is_active?: boolean;
  subcategories?: Category[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/api/v1/categories");
      setCategories(data);
    } catch (err) {
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openDialog = (category?: Category) => {
    setEditing(category || null);
    setForm(category || {});
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
        const updated = await fetchApi(`/api/v1/categories/${editing._id}`, {
          method: "PUT",
          body: form,
        });
        setCategories((cats) => cats.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        // Create
        const created = await fetchApi("/api/v1/categories", {
          method: "POST",
          body: form,
        });
        setCategories((cats) => [...cats, created]);
      }
      closeDialog();
    } catch {
      setError("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await fetchApi(`/api/v1/categories/${id}`, { method: "DELETE" });
      setCategories((cats) => cats.filter((c) => c._id !== id));
    } catch {
      setError("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setTogglingId(id);
    setError(null);
    try {
      const updated = await fetchApi(`/api/v1/categories/${id}/toggle-status`, {
        method: "PATCH",
      });
      setCategories((cats) => cats.map((c) => (c._id === updated._id ? updated : c)));
    } catch {
      setError("Failed to toggle category status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Manage Categories</h2>
        <Button onClick={() => openDialog()}>Create Category</Button>
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
                <th className="p-2 border">Parent</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td className="p-2 border">{category.name}</td>
                  <td className="p-2 border">{category.description || "-"}</td>
                  <td className="p-2 border">{categories.find((c) => c._id === category.parent_id)?.name || "-"}</td>
                  <td className="p-2 border">
                    <Button
                      size="sm"
                      variant={category.is_active ? "default" : "secondary"}
                      onClick={() => handleToggleStatus(category._id)}
                      disabled={togglingId === category._id}
                    >
                      {togglingId === category._id ? "Updating..." : category.is_active ? "Active" : "Inactive"}
                    </Button>
                  </td>
                  <td className="p-2 border flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDialog(category)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(category._id)}
                      disabled={deletingId === category._id}
                    >
                      {deletingId === category._id ? "Deleting..." : "Delete"}
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
          <AlertDialogTitle>{editing ? "Edit Category" : "Create Category"}</AlertDialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input name="name" placeholder="Name" value={form.name || ""} onChange={handleChange} required />
            <Input
              name="description"
              placeholder="Description"
              value={form.description || ""}
              onChange={handleChange}
            />
            <select
              name="parent_id"
              value={form.parent_id || ""}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            >
              <option value="">No Parent</option>
              {categories
                .filter((c) => c._id !== editing?._id) // Prevent selecting self as parent
                .map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
            </select>
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
