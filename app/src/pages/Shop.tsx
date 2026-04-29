import { useEffect, useState } from 'react';
import { ShoppingBag, ImageOff, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import type { Database } from '@/types/database';
import { rowsToSiteContentMap, siteContentUrl } from '@/constants/siteContentDefaults';

type Product = Database['public']['Tables']['products']['Row'];

// ─── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const sizes = product.sizes_available ?? [];

  const handleAddToCart = () => {
    if (!product.is_available) return;
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem({
      productId: product.id,
      productName: product.name,
      size: selectedSize,
      unitPrice: Number(product.price),
      imageUrl: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.querySelector('.img-fallback')!.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`img-fallback ${product.image_url ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
          <ImageOff className="w-12 h-12 text-gray-300" />
        </div>

        {!product.is_available && (
          <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-gray-800 px-3 py-1 text-xs font-bold text-white">
            OUT OF STOCK
          </div>
        )}
        {product.is_available && product.stock_note && (
          <div className="pointer-events-none absolute left-3 bottom-3 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
            {product.stock_note}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {product.category && (
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
            {product.category}
          </p>
        )}
        <h3 className="mb-2 text-lg font-bold text-gray-900 leading-snug">{product.name}</h3>

        {product.description && (
          <p className="text-sm text-gray-500 mb-3 leading-relaxed">{product.description}</p>
        )}

        <p className="mb-4 text-2xl font-black text-[#2E75B6]">${Number(product.price).toFixed(2)}</p>

        {/* Size Selector */}
        {sizes.length > 0 && (
          <div className="mb-4">
            <p className={`mb-2 text-sm font-semibold ${sizeError ? 'text-red-500' : 'text-gray-600'}`}>
              {sizeError ? 'Please select a size' : 'Select Size:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={!product.is_available}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                  className={`h-10 min-w-[40px] px-2 rounded-lg border-2 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    selectedSize === size
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : sizeError
                      ? 'border-red-300 text-gray-500 hover:border-red-400'
                      : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto space-y-2">
          {product.is_available ? (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-bold transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2E75B6] hover:bg-[#1F4E78] text-white'
                }`}
              >
                {added ? (
                  <><CheckCircle2 className="h-4 w-4" /> Added!</>
                ) : (
                  <><ShoppingBag className="h-4 w-4" /> Add to Cart</>
                )}
              </button>
              {added && (
                <button
                  type="button"
                  onClick={openCart}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#2E75B6] py-2.5 text-sm font-bold text-[#2E75B6] hover:bg-blue-50 transition-all"
                >
                  View Cart
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 font-bold text-gray-400"
              disabled
            >
              <ShoppingBag className="h-4 w-4" />
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shop Page ─────────────────────────────────────────────────────────────────

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentBanner, setPaymentBanner] = useState<'success' | 'cancelled' | null>(null);
  const [siteContent, setSiteContent] = useState<Record<string, string | null>>({});
  const { count, openCart, clearCart } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('site_content').select('key, value').order('key');
      if (cancelled) return;
      setSiteContent(rowsToSiteContentMap(data as { key: string; value: string | null }[] | null));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const shopHeroBg = siteContentUrl(siteContent, 'shop_hero_background');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
      setProducts(data ?? []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Detect return from Stripe Checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentBanner('success');
      clearCart();
      // Remove query params from URL so a refresh doesn't re-trigger the banner
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'cancelled') {
      setPaymentBanner('cancelled');
      window.history.replaceState({}, '', window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableCount = products.filter((p) => p.is_available).length;

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-[#0a0a0a] sm:min-h-[78vh]">
        <div className="absolute inset-0 opacity-20">
          <img
            src={shopHeroBg}
            className="h-full w-full object-cover grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-center sm:py-28">
          <p className="mb-6 font-mono text-sm font-bold uppercase tracking-[0.3em] text-primary">
            Official Merchandise
          </p>
          <h1 className="mb-8 font-display text-5xl font-black uppercase leading-[0.85] tracking-tighter text-white sm:text-6xl lg:text-7xl xl:text-8xl">
            Explore the <span className="text-primary italic">Collection</span>
          </h1>
          <div className="mx-auto mb-8 h-1 w-24 rounded-full bg-primary" />
          <p className="mx-auto max-w-2xl text-xl text-white/70">
            {availableCount > 0
              ? 'Order your exclusive TOPAZ 2.0 gear today!'
              : 'Pre-order your exclusive TOPAZ 2.0 gear — coming soon!'}
          </p>

          {count > 0 && (
            <button
              type="button"
              onClick={openCart}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2E75B6] px-6 py-3 font-bold text-white hover:bg-[#1F4E78] transition-all"
            >
              <ShoppingBag className="h-5 w-5" />
              View Cart ({count} item{count !== 1 ? 's' : ''})
            </button>
          )}
        </div>
      </section>

      {/* Stripe return banners */}
      {paymentBanner === 'success' && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-4">
          <div className="mx-auto max-w-7xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-800">
              Payment successful! 🎉 Thank you for your order. You'll receive a confirmation email shortly.
            </p>
            <button
              type="button"
              onClick={() => setPaymentBanner(null)}
              className="ml-auto text-emerald-500 hover:text-emerald-700 transition-colors"
              aria-label="Dismiss"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {paymentBanner === 'cancelled' && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="mx-auto max-w-7xl flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-800">
              Your payment was cancelled. Your cart has been saved — you can complete your purchase anytime.
            </p>
            <button
              type="button"
              onClick={() => setPaymentBanner(null)}
              className="ml-auto text-amber-500 hover:text-amber-700 transition-colors"
              aria-label="Dismiss"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <h2 className="font-display text-3xl font-bold text-gray-900">Featured Items</h2>
            {count > 0 && (
              <button
                type="button"
                onClick={openCart}
                className="flex items-center gap-2 rounded-full bg-[#2E75B6] px-5 py-2.5 font-bold text-sm text-white hover:bg-[#1F4E78] transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                Cart ({count})
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="overflow-hidden rounded-xl bg-white shadow-lg animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-7 bg-gray-200 rounded w-1/3" />
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((j) => <div key={j} className="h-10 w-10 bg-gray-200 rounded-lg" />)}
                    </div>
                    <div className="h-12 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="mx-auto mb-12 max-w-3xl rounded-2xl border-2 border-blue-200 bg-blue-50 p-8 text-center">
              <h3 className="mb-4 text-2xl font-bold text-blue-900">Online Store Coming Soon!</h3>
              <p className="mb-6 text-lg text-blue-800">
                Our online merchandise store is currently being set up. For now, you can purchase
                items at our competitions or pre-order via email.
              </p>
              <p className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                Want to pre-order? Contact us at{' '}
                <a href="mailto:topaz2.0@yahoo.com" className="underline hover:text-blue-900">
                  topaz2.0@yahoo.com
                </a>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Size Guide */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold text-gray-900">Size Guide</h2>
            <p className="text-gray-500">
              All measurements are in inches. When in between sizes, we recommend sizing up.
            </p>
          </div>

          <div className="mb-10">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <span className="inline-block h-6 w-2 rounded-full bg-[#2E75B6]" />
              T-Shirts
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#2E75B6] text-white">
                    <th className="px-6 py-3 text-left font-bold">Size</th>
                    <th className="px-6 py-3 text-center font-bold">Chest</th>
                    <th className="px-6 py-3 text-center font-bold">Length</th>
                    <th className="px-6 py-3 text-center font-bold">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { size: 'S', chest: '34–36"', length: '27"', sleeve: '32"' },
                    { size: 'M', chest: '38–40"', length: '28"', sleeve: '33"' },
                    { size: 'L', chest: '42–44"', length: '29"', sleeve: '34"' },
                    { size: 'XL', chest: '46–48"', length: '30"', sleeve: '35"' },
                    { size: 'XXL', chest: '50–52"', length: '31"', sleeve: '36"' },
                  ].map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 font-bold text-gray-900">{row.size}</td>
                      <td className="px-6 py-3 text-center text-gray-600">{row.chest}</td>
                      <td className="px-6 py-3 text-center text-gray-600">{row.length}</td>
                      <td className="px-6 py-3 text-center text-gray-600">{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <span className="inline-block h-6 w-2 rounded-full bg-[#2E75B6]" />
              Hoodies
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#2E75B6] text-white">
                    <th className="px-6 py-3 text-left font-bold">Size</th>
                    <th className="px-6 py-3 text-center font-bold">Chest</th>
                    <th className="px-6 py-3 text-center font-bold">Length</th>
                    <th className="px-6 py-3 text-center font-bold">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { size: 'S', chest: '36–38"', length: '26"', sleeve: '33"' },
                    { size: 'M', chest: '40–42"', length: '27"', sleeve: '34"' },
                    { size: 'L', chest: '44–46"', length: '28"', sleeve: '35"' },
                    { size: 'XL', chest: '48–50"', length: '29"', sleeve: '36"' },
                    { size: 'XXL', chest: '52–54"', length: '30"', sleeve: '37"' },
                  ].map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 font-bold text-gray-900">{row.size}</td>
                      <td className="px-6 py-3 text-center text-gray-600">{row.chest}</td>
                      <td className="px-6 py-3 text-center text-gray-600">{row.length}</td>
                      <td className="px-6 py-3 text-center text-gray-600">{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            Questions about sizing? Email us at{' '}
            <a
              href="mailto:topaz2.0@yahoo.com"
              className="text-[#2E75B6] underline hover:text-[#1F4E78]"
            >
              topaz2.0@yahoo.com
            </a>
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-gray-900">
            Questions about merchandise?
          </h2>
          <p className="mb-8 text-lg text-gray-500">Need help with sizing or bulk orders for your studio?</p>
          <a
            href="mailto:topaz2.0@yahoo.com"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-black hover:shadow-xl"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
};

export default Shop;
