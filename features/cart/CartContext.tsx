"use client";

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  name: string;
  brand: string;
  price: string;
  oldPrice: string;
  image: string | null;
  size: string;
  color: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "myshoes_cart";

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, ""), 10) || 0;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function itemKey(item: { productId: string; size: string; color: string }) {
  return `${item.productId}__${item.size}__${item.color}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = itemKey(item);
        const existing = prev.find((i) => itemKey(i) === key);
        if (existing) {
          return prev.map((i) =>
            itemKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, size: string, color: string) => {
      setItems((prev) =>
        prev.filter((i) => itemKey(i) !== `${productId}__${size}__${color}`)
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, size, color);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i) === `${productId}__${size}__${color}`
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
