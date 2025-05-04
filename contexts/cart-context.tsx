"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Cart, CartItem, Product } from "@/types"

interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "ecommerce-cart"

const initialCart: Cart = {
  items: [],
  total: 0,
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, isInitialized])

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex((item) => item.product_id === product._id)

      let newItems

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = [...prevCart.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        }
      } else {
        // Add new item
        const newItem: CartItem = {
          product_id: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images?.length > 0 ? product.images[0] : undefined,
        }
        newItems = [...prevCart.items, newItem]
      }

      return {
        items: newItems,
        total: calculateTotal(newItems),
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.product_id !== productId)
      return {
        items: newItems,
        total: calculateTotal(newItems),
      }
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => (item.product_id === productId ? { ...item, quantity } : item))

      return {
        items: newItems,
        total: calculateTotal(newItems),
      }
    })
  }

  const clearCart = () => {
    setCart(initialCart)
  }

  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

