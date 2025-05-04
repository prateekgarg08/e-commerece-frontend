"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useMerchant } from "@/contexts/merchant-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Store,
  BarChart,
  HelpCircle,
} from "lucide-react"

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { merchant, isLoading, isMerchant } = useMerchant()

  // Protect merchant routes
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/merchant/dashboard")
    } else if (!isLoading && !isMerchant) {
      router.push("/become-merchant")
    }
  }, [user, isMerchant, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !merchant) {
    return null // Will redirect in the useEffect
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex flex-col items-center justify-center p-4">
          <Store className="h-8 w-8 text-primary mb-2" />
          <h1 className="text-lg font-bold">Merchant Portal</h1>
          <p className="text-sm text-muted-foreground">{merchant.business_name}</p>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/merchant/dashboard")}>
                <Link href="/merchant/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/merchant/products")}>
                <Link href="/merchant/products">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/merchant/orders")}>
                <Link href="/merchant/orders">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Orders
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/merchant/analytics")}>
                <Link href="/merchant/analytics">
                  <BarChart className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/merchant/customers")}>
                <Link href="/merchant/customers">
                  <Users className="h-4 w-4 mr-2" />
                  Customers
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <Separator className="my-4" />

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/merchant/settings")}>
                <Link href="/merchant/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/merchant/help")}>
                <Link href="/merchant/help">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4 mr-2" />
              Exit Merchant Portal
            </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex items-center text-lg font-semibold">
            {pathname === "/merchant/dashboard" && "Dashboard"}
            {pathname === "/merchant/products" && "Products"}
            {pathname === "/merchant/orders" && "Orders"}
            {pathname === "/merchant/analytics" && "Analytics"}
            {pathname === "/merchant/customers" && "Customers"}
            {pathname === "/merchant/settings" && "Settings"}
            {pathname === "/merchant/help" && "Help & Support"}
            {pathname.startsWith("/merchant/products/") && "Product Details"}
            {pathname.startsWith("/merchant/orders/") && "Order Details"}
          </div>
        </div>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

