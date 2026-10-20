const KEY = "tf_pending_cart";

/**
 * Stash a cart add intent across the login redirect.
 * @param {{ productId: string, quantity?: number, size?: string|null, returnTo?: string }} item
 */
export function stashPendingCart(item) {
  if (!item?.productId) return;
  sessionStorage.setItem(
    KEY,
    JSON.stringify({
      productId: item.productId,
      quantity: item.quantity ?? 1,
      size: item.size ?? null,
      returnTo: item.returnTo || "/",
    }),
  );
}

export function peekPendingCart() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingCart() {
  sessionStorage.removeItem(KEY);
}

/**
 * After login: add stashed item (if any) and return where to navigate.
 */
export async function flushPendingCart(addToCart) {
  const pending = peekPendingCart();
  if (!pending?.productId) return null;
  clearPendingCart();
  try {
    await addToCart(pending.productId, pending.quantity ?? 1, pending.size);
    return { ok: true, returnTo: pending.returnTo || "/cart" };
  } catch {
    return { ok: false, returnTo: pending.returnTo || "/" };
  }
}
