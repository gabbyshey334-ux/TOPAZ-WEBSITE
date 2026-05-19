import { useMemo } from 'react';
import { siteContentText, type SiteContentTextKey } from '@/constants/siteContentDefaults';
import { useSiteContentMap } from '@/contexts/SiteContentContext';

/** Fallbacks when `site_content` rows are missing — keep in sync with edge function defaults. */
export const SHOP_SHIPPING_FLAT_DEFAULT = 9.95;
export const SHOP_HANDLING_FLAT_DEFAULT = 2.5;
export const SHOP_TAX_RATE_DEFAULT = 0;

export type ShopFulfillment = 'ship' | 'pickup';

export type ShopFeesConfig = {
  shippingFlat: number;
  handlingFlat: number;
  taxRate: number;
  pricePlusLabel: string;
};

export type ShopOrderTotals = {
  subtotal: number;
  shipping: number;
  handling: number;
  tax: number;
  total: number;
};

const FEE_KEYS = {
  shipping: 'shop_shipping_flat',
  handling: 'shop_handling_flat',
  tax: 'shop_tax_rate',
  pricePlus: 'shop_price_plus_label',
} as const satisfies Record<string, SiteContentTextKey>;

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseFee(value: string | null | undefined, fallback: number): number {
  const n = Number(String(value ?? '').trim());
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function parseShopFeesConfig(
  map: Record<string, string | null | undefined>,
): ShopFeesConfig {
  return {
    shippingFlat: parseFee(map[FEE_KEYS.shipping], SHOP_SHIPPING_FLAT_DEFAULT),
    handlingFlat: parseFee(map[FEE_KEYS.handling], SHOP_HANDLING_FLAT_DEFAULT),
    taxRate: parseFee(map[FEE_KEYS.tax], SHOP_TAX_RATE_DEFAULT),
    pricePlusLabel: siteContentText(map, FEE_KEYS.pricePlus),
  };
}

export function shippingHandlingFlatTotal(config: ShopFeesConfig): number {
  return roundMoney(config.shippingFlat + config.handlingFlat);
}

/** Suffix after unit price, e.g. "+ shipping & handling". */
export function productPricePlusLine(config: ShopFeesConfig): string {
  const label = config.pricePlusLabel.trim() || '+ shipping & handling';
  return label.startsWith('+') ? label : `+ ${label}`;
}

/** Full display for shop cards: "$25.00 + shipping & handling". */
export function formatProductPriceDisplay(unitPrice: number, config: ShopFeesConfig): string {
  return `$${unitPrice.toFixed(2)} ${productPricePlusLine(config)}`;
}

export function computeShopOrderTotals(
  subtotal: number,
  fulfillment: ShopFulfillment,
  config: ShopFeesConfig = parseShopFeesConfig({}),
): ShopOrderTotals {
  const sub = roundMoney(subtotal);
  const shipping = fulfillment === 'ship' ? config.shippingFlat : 0;
  const handling = fulfillment === 'ship' ? config.handlingFlat : 0;
  const taxable = sub + shipping + handling;
  const tax = roundMoney(taxable * config.taxRate);
  const total = roundMoney(taxable + tax);
  return { subtotal: sub, shipping, handling, tax, total };
}

export function useShopFees(): ShopFeesConfig {
  const map = useSiteContentMap();
  return useMemo(() => parseShopFeesConfig(map), [map]);
}
