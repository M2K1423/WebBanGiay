"use client";

import { createContext, useContext, useCallback, useEffect, useState, useRef, type ReactNode } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getApiBaseUrl } from "@/features/auth/utils";


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
  const [user, setUser] = useState<User | null>(null);
  const syncedUserUidRef = useRef<string | null>(null);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  // Listen to Auth State
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Fetch and Sync Cart on Login
  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      syncedUserUidRef.current = null;
      return;
    }

    if (syncedUserUidRef.current === user.uid) {
      return;
    }

    const syncCartOnLogin = async () => {
      try {
        const apiBaseUrl = getApiBaseUrl();
        const res = await fetch(`${apiBaseUrl}/cart/${user.uid}`);
        if (!res.ok) return;

        const backendCart = await res.json();
        const backendItems = Array.isArray(backendCart?.items) ? backendCart.items : [];

        setItems((prevLocalItems) => {
          const merged = [...backendItems];

          prevLocalItems.forEach((localItem) => {
            const matchIdx = merged.findIndex(
              (i) => i.productId === localItem.productId && i.size === localItem.size && i.color === localItem.color
            );

            if (matchIdx > -1) {
              merged[matchIdx].quantity = (merged[matchIdx].quantity || 0) + (localItem.quantity || 1);
            } else {
              merged.push(localItem);
            }
          });

          // Sync merged items to backend
          void fetch(`${apiBaseUrl}/cart/${user.uid}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ items: merged })
          }).catch((err) => console.error("Lỗi đồng bộ giỏ hàng lên backend:", err));

          return merged;
        });

        syncedUserUidRef.current = user.uid;
      } catch (err) {
        console.error("Lỗi đồng bộ giỏ hàng khi đăng nhập:", err);
      }
    };

    void syncCartOnLogin();
  }, [user, mounted]);

  // Helper to sync to backend
  const syncToBackend = useCallback(async (currentItems: CartItem[], activeUser: User | null) => {
    if (!activeUser) return;
    try {
      const apiBaseUrl = getApiBaseUrl();
      await fetch(`${apiBaseUrl}/cart/${activeUser.uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ items: currentItems })
      });
    } catch (err) {
      console.error("Lỗi lưu giỏ hàng lên backend:", err);
    }
  }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = itemKey(item);
        const existing = prev.find((i) => itemKey(i) === key);
        let updated: CartItem[];
        if (existing) {
          updated = prev.map((i) =>
            itemKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          updated = [...prev, { ...item, quantity }];
        }
        void syncToBackend(updated, user);
        return updated;
      });
    },
    [user, syncToBackend]
  );

  const removeItem = useCallback(
    (productId: string, size: string, color: string) => {
      setItems((prev) => {
        const updated = prev.filter((i) => itemKey(i) !== `${productId}__${size}__${color}`);
        void syncToBackend(updated, user);
        return updated;
      });
    },
    [user, syncToBackend]
  );

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, size, color);
        return;
      }
      setItems((prev) => {
        const updated = prev.map((i) =>
          itemKey(i) === `${productId}__${size}__${color}`
            ? { ...i, quantity }
            : i
        );
        void syncToBackend(updated, user);
        return updated;
      });
    },
    [user, syncToBackend, removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (user) {
      const apiBaseUrl = getApiBaseUrl();
      void fetch(`${apiBaseUrl}/cart/${user.uid}`, {
        method: "DELETE"
      }).catch((err) => console.error("Lỗi xóa giỏ hàng trên backend:", err));
    }
  }, [user]);

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
