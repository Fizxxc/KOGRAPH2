"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import type { CartItem, MenuItem } from "./types"

interface CartContextType {
  items: CartItem[]
  addToCart: (menuItem: MenuItem, notes?: string) => void
  removeFromCart: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  updateNotes: (menuItemId: string, notes: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addToCart = (menuItem: MenuItem, notes?: string) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.menuItem.id === menuItem.id)

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity += 1
        if (notes) {
          updated[existingIndex].notes = notes
        }
        return updated
      }

      return [...prev, { menuItem, quantity: 1, notes }]
    })
  }

  const removeFromCart = (menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItem.id !== menuItemId))
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId)
      return
    }

    setItems((prev) => prev.map((item) => (item.menuItem.id === menuItemId ? { ...item, quantity } : item)))
  }

  const updateNotes = (menuItemId: string, notes: string) => {
    setItems((prev) => prev.map((item) => (item.menuItem.id === menuItemId ? { ...item, notes } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        totalItems,
        totalPrice,
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
