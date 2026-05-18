/** Flat shop fees — keep in sync with `supabase/functions/submit-pending-shop-order/index.ts`. */
export const SHOP_SHIPPING_FLAT = 9.95;
export const SHOP_HANDLING_FLAT = 2.5;
/** Oregon has no state sales tax; adjust if you begin collecting tax elsewhere. */
export const SHOP_TAX_RATE = 0;

export type ShopFulfillment = 'ship' | 'pickup';

export type ShopOrderTotals = {
  subtotal: number;
  shipping: number;
  handling: number;
  tax: number;
  total: number;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeShopOrderTotals(subtotal: number, fulfillment: ShopFulfillment): ShopOrderTotals {
  const sub = roundMoney(subtotal);
  const shipping = fulfillment === 'ship' ? SHOP_SHIPPING_FLAT : 0;
  const handling = fulfillment === 'ship' ? SHOP_HANDLING_FLAT : 0;
  const taxable = sub + shipping + handling;
  const tax = roundMoney(taxable * SHOP_TAX_RATE);
  const total = roundMoney(taxable + tax);
  return { subtotal: sub, shipping, handling, tax, total };
}
