"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { fetchApi } from "@/lib/api-client";

interface Merchant {
  _id: string;
  business_name: string;
  business_description?: string;
  contact_email: string;
  contact_phone?: string;
  is_verified?: boolean;
}

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Merchant | null>(null);
  const [form, setForm] = useState<Partial<Merchant>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all merchants
  useEffect(() => {
    setLoading(true);
    fetchApi("/api/v1/merchants")
      .then((data) => {
        setMerchants(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch merchants");
        setLoading(false);
      });
  }, []);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Open dialog for create or edit
  const openDialog = (merchant?: Merchant) => {
    setEditing(merchant || null);
    setForm(merchant || {});
    setShowDialog(true);
  };

  // Close dialog
  const closeDialog = () => {
    setShowDialog(false);
    setEditing(null);
    setForm({});
  };

  // Create or update merchant
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        closeDialog();
      } else {
        closeDialog();
      }
    } catch {
      setError("Failed to save merchant");
    }
  };

  // Delete merchant
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await fetchApi(`/api/v1/merchants/${id}`, { method: "DELETE" });
      setMerchants((merchants) => merchants.filter((m) => m._id !== id));
    } catch {
      setError("Failed to delete merchant");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Manage Merchants</h2>
        <Button onClick={() => openDialog()}>Create Merchant</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Business Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Verified</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => (
                <tr key={merchant._id}>
                  <td className="p-2 border">{merchant.business_name}</td>
                  <td className="p-2 border">{merchant.contact_email}</td>
                  <td className="p-2 border">{merchant.contact_phone || "-"}</td>
                  <td className="p-2 border">{merchant.is_verified ? "Yes" : "No"}</td>
                  <td className="p-2 border flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDialog(merchant)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(merchant._id)}
                      disabled={deletingId === merchant._id}
                    >
                      {deletingId === merchant._id ? "Deleting..." : "Delete"}
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
          <AlertDialogTitle>{editing ? "Edit Merchant" : "Create Merchant"}</AlertDialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input
              name="business_name"
              placeholder="Business Name"
              value={form.business_name || ""}
              onChange={handleChange}
              required
            />
            <Input
              name="contact_email"
              placeholder="Email"
              value={form.contact_email || ""}
              onChange={handleChange}
              required
            />
            <Input name="contact_phone" placeholder="Phone" value={form.contact_phone || ""} onChange={handleChange} />
            <Input
              name="business_description"
              placeholder="Description"
              value={form.business_description || ""}
              onChange={handleChange}
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
