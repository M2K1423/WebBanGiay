"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";

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

const LEGACY_STORAGE_KEY = "myshoes_cart";
const GUEST_STORAGE_KEY = "myshoes_cart:guest";
const MAX_QUANTITY = 99;

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, ""), 10) || 0;
}

function storageKey(userId?: string) {
  return userId ? `myshoes_cart:user:${userId}` : GUEST_STORAGE_KEY;
}

function normalizeQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity)) return 1;
  if (quantity > MAX_QUANTITY) return 1;
  return Math.max(1, Math.floor(quantity));
}

function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  const uniqueItems = new Map<string, CartItem>();
  value.forEach((candidate) => {
    if (!candidate || typeof candidate !== "object") return;
    const item = candidate as CartItem;
    if (!item.productId || !item.name || !item.price || !item.size) return;
    const normalized = {
      ...item,
      color: item.color ?? "",
      oldPrice: item.oldPrice ?? "",
      image: item.image ?? null,
      quantity: normalizeQuantity(item.quantity)
    };
    const key = itemKey(normalized);
    if (!uniqueItems.has(key)) uniqueItems.set(key, normalized);
  });
  return [...uniqueItems.values()];
}

function mergeCarts(...carts: CartItem[][]) {
  return normalizeCart(carts.flat());
}

function loadCart(key: string): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    let raw = localStorage.getItem(key);
    if (!raw && key === GUEST_STORAGE_KEY) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(GUEST_STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    return raw ? normalizeCart(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function saveCart(key: string, items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(normalizeCart(items)));
}

function itemKey(item: { productId: string; size: string; color: string }) {
  return `${item.productId}__${item.size}__${item.color}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthReady(true);
      return;
    }
    return onAuthStateChanged(auth, (activeUser) => {
      setUser(activeUser);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const ownerKey = storageKey(user?.uid);
    const localItems = loadCart(ownerKey);

    if (!user) {
      setItems(localItems);
      return;
    }

    let cancelled = false;
    const syncCartForUser = async () => {
      try {
        const apiBaseUrl = getApiBaseUrl();
        const token = await user.getIdToken();
        const res = await fetch(`${apiBaseUrl}/cart/${user.uid}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          if (!cancelled) {
            setItems(localItems);
          }
          return;
        }

        const backendCart = await res.json();
        const backendItems = normalizeCart(backendCart?.items);
        const guestItems = loadCart(GUEST_STORAGE_KEY);
        const merged = mergeCarts(backendItems, localItems, guestItems);
        if (cancelled) return;

        setItems(merged);
        saveCart(ownerKey, merged);
        localStorage.removeItem(GUEST_STORAGE_KEY);

        void fetch(`${apiBaseUrl}/cart/${user.uid}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ items: merged })
        }).catch((err) => console.warn("Cart backend sync failed:", err));
      } catch (err) {
        if (!cancelled) {
          setItems(localItems);
        }
        console.warn("Cart backend sync on login failed:", err);
      }
    };

    void syncCartForUser();
    return () => {
      cancelled = true;
    };
  }, [user, authReady]);

  const syncToBackend = useCallback(async (currentItems: CartItem[], activeUser: User | null) => {
    const normalizedItems = normalizeCart(currentItems);
    if (!activeUser) return;

    try {
      const apiBaseUrl = getApiBaseUrl();
      const token = await activeUser.getIdToken();
      await fetch(`${apiBaseUrl}/cart/${activeUser.uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ items: normalizedItems })
      });
    } catch (err) {
      console.warn("Cart backend save failed:", err);
    }
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = itemKey(item);
        const existing = prev.find((currentItem) => itemKey(currentItem) === key);
        const updated = normalizeCart(existing
          ? prev.map((currentItem) =>
              itemKey(currentItem) === key
                ? { ...currentItem, quantity: Math.min(MAX_QUANTITY, currentItem.quantity + normalizeQuantity(quantity)) }
                : currentItem
            )
          : [...prev, { ...item, quantity: normalizeQuantity(quantity) }]);

        saveCart(storageKey(user?.uid), updated);
        void syncToBackend(updated, user);
        return updated;
      });
    },
    [user, syncToBackend]
  );

  const removeItem = useCallback(
    (productId: string, size: string, color: string) => {
      setItems((prev) => {
        const updated = prev.filter((item) => itemKey(item) !== `${productId}__${size}__${color}`);
        saveCart(storageKey(user?.uid), updated);
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
        const updated = normalizeCart(prev.map((item) =>
          itemKey(item) === `${productId}__${size}__${color}`
            ? { ...item, quantity: normalizeQuantity(quantity) }
            : item
        ));
        saveCart(storageKey(user?.uid), updated);
        void syncToBackend(updated, user);
        return updated;
      });
    },
    [user, syncToBackend, removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    saveCart(storageKey(user?.uid), []);

    if (user) {
      const apiBaseUrl = getApiBaseUrl();
      void (async () => {
        try {
          const token = await user.getIdToken();
          await fetch(`${apiBaseUrl}/cart/${user.uid}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
        } catch (err) {
          console.warn("Cart backend clear failed:", err);
        }
      })();
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
