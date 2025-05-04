import React from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Users, Package, ShoppingBag, LayoutDashboard, List, User } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Helper to determine active link (optional, can be improved)
  // const pathname = usePathname();
  // const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex flex-col items-center justify-center p-4">
          <LayoutDashboard className="h-8 w-8 text-primary mb-2" />
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/merchants">
                  <User className="h-4 w-4 mr-2" />
                  Merchants
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/categories">
                  <List className="h-4 w-4 mr-2" />
                  Categories
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/products">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/orders">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Orders
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/customers">
                  <Users className="h-4 w-4 mr-2" />
                  Customers
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Link href="/">
            <span className="text-primary">Exit Admin</span>
          </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex items-center text-lg font-semibold">Admin</div>
        </div>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
