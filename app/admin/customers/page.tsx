"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api-client";

interface User {
  _id: string;
  full_name?: string;
  email: string;
  is_active?: boolean;
  role?: string;
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchApi("/api/v1/users")
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch users");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await fetchApi(`/api/v1/users/${id}`, { method: "DELETE" });
      setUsers((users) => users.filter((u) => u._id !== id));
    } catch {
      setError("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Manage Customers</h2>
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
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Active</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="p-2 border">{user.full_name || "-"}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.role || "-"}</td>
                  <td className="p-2 border">{user.is_active !== false ? "Yes" : "No"}</td>
                  <td className="p-2 border flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingId === user._id}
                    >
                      {deletingId === user._id ? "Deleting..." : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
