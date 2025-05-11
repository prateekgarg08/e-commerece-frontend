"use client";
import { useAuth } from "@/contexts/auth-context";
import { redirect } from "next/navigation";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  if (user.role === "merchant") {
    return redirect("/merchant");
  }

  if (user.role === "admin") {
    return redirect("/admin");
  }

  return <>{children}</>;
}
