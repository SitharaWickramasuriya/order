export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

const STORAGE_KEY = "orderflow-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem) {
  const items = getCart();
  const existing = items.find((x) => x.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  setCart(items);
}
