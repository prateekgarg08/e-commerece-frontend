"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState("")

  const subtotal = cart.total
  const shipping = subtotal > 0 ? 8.99 : 0
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would validate the coupon here
    alert(`Coupon "${couponCode}" applied!`)
  }

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=checkout")
      return
    }

    router.push("/checkout")
  }

  if (cart.items.length === 0) {
    return (
      <div className="container py-16">
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <ShoppingCart className="h-24 w-24 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Button size="lg" asChild>
            <Link href="/products">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-muted rounded-md p-4 hidden md:grid grid-cols-12 font-medium">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {cart.items.map((item) => (
            <div
              key={item.product_id}
              className="border rounded-md p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              {/* Product info - mobile & desktop */}
              <div className="md:col-span-6 flex gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder.svg?height=100&width=100"}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <Link href={`/products/${item.product_id}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-muted-foreground hover:text-destructive p-0 h-auto text-xs flex items-center mt-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>

              {/* Price - mobile & desktop */}
              <div className="md:col-span-2 md:text-center flex justify-between md:block">
                <span className="text-muted-foreground md:hidden">Price:</span>
                <span>${item.price.toFixed(2)}</span>
              </div>

              {/* Quantity - mobile & desktop */}
              <div className="md:col-span-2 md:text-center flex justify-between md:block">
                <span className="text-muted-foreground md:hidden">Quantity:</span>
                <div className="flex items-center border rounded inline-flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Total - mobile & desktop */}
              <div className="md:col-span-2 md:text-right flex justify-between md:block">
                <span className="text-muted-foreground md:hidden">Total:</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-md p-6 space-y-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex space-x-2">
                <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <Button type="submit" variant="outline">
                  Apply
                </Button>
              </div>
            </form>

            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

