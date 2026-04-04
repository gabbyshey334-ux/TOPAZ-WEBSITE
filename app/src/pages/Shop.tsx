import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

/** Public URL for files in /public/products/ (filenames include spaces). */
function productImage(filename: string) {
  return `${BASE}products/${encodeURIComponent(filename)}`;
}

const products = [
  {
    id: 1,
    name: 'Blue Topaz 2.0 Shirt',
    typeLabel: 'T-Shirt' as const,
    category: 't-shirts',
    imageBack: 'Blue Topaz 2.0 Shirt Back.jpg',
    imageFront: 'Blue Topaz 2.0 Shirt Front.jpg',
    price: '$48',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false,
  },
  {
    id: 2,
    name: 'Black Topaz 2.0 T-Shirt',
    typeLabel: 'T-Shirt' as const,
    category: 't-shirts',
    imageBack: 'Black Topaz 2.0 T Shirt Back.jpg',
    imageFront: 'Black Topaz 2.0 T Shirt Front.jpg',
    price: '$45',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false,
  },
  {
    id: 3,
    name: 'Black Topaz 2.0 Hoodie New Logo',
    typeLabel: 'Hoodie' as const,
    category: 'hoodies',
    imageBack: 'Black Topaz 2.0 Hoodie New Logo Back.jpg',
    imageFront: 'Black Topaz 2.0 Hoodie New Logo Front.jpg',
    price: '$60',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false,
  },
  {
    id: 4,
    name: 'Blue Topaz 2.0 Original T-Shirt',
    typeLabel: 'T-Shirt' as const,
    category: 't-shirts',
    imageBack: 'Blue Topaz 2.0 Orig T Shirt Back.jpg',
    imageFront: 'Blue Topaz 2.0 Orig T Shirt.jpg',
    price: '$48',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false,
  },
  {
    id: 5,
    name: 'Black Topaz 2.0 T-Shirt Womens',
    typeLabel: 'T-Shirt' as const,
    category: 't-shirts',
    imageBack: 'Black Topaz 2.0 T shirt Womens Back.jpg',
    imageFront: 'Black Topaz 2.0 T shirt Womens Front.jpg',
    price: '$45',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false,
  },
];

const ProductCard = ({ product }: { product: (typeof products)[number] }) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const srcBack = productImage(product.imageBack);
  const srcFront = productImage(product.imageFront);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
      <div className="shop-flip-group relative">
        <div className="shop-flip-perspective relative aspect-square overflow-hidden bg-gray-100">
          <div className="shop-flip-inner relative h-full w-full">
            <div
              className="shop-flip-face absolute inset-0"
              style={{ transform: 'rotateY(0deg)' }}
            >
              <img
                src={srcBack}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80';
                }}
              />
            </div>
            <div
              className="shop-flip-face absolute inset-0"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <img
                src={srcFront}
                alt={product.name}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80';
                }}
              />
            </div>
          </div>
        </div>

        {!product.available && (
          <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
            COMING SOON
          </div>
        )}
      </div>

      <div className="p-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#2E75B6]">
          {product.typeLabel}
        </p>
        <h3 className="mb-2 text-lg font-bold text-gray-900">{product.name}</h3>

        <p className="mb-4 text-2xl font-black text-[#2E75B6]">{product.price}</p>

        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-600">Size:</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-10 w-10 rounded-lg border-2 text-sm font-semibold transition-all ${
                  selectedSize === size
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 font-bold text-gray-500"
          disabled
        >
          <ShoppingBag className="h-4 w-4" />
          Coming Soon
        </button>
      </div>
    </div>
  );
};

const Shop = () => {
  return (
    <div className="bg-gray-50">
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-[#0a0a0a] sm:min-h-[78vh]">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop"
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
            Pre-order your exclusive TOPAZ gear now!
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-12 max-w-3xl rounded-2xl border-2 border-blue-200 bg-blue-50 p-8 text-center">
            <h3 className="mb-4 text-2xl font-bold text-blue-900">Online Store Coming Soon!</h3>
            <p className="mb-6 text-lg text-blue-800">
              Our online merchandise store is currently under development. For now, you can purchase
              these items at our competitions or pre-order via email.
            </p>
            <p className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Want to pre-order? Contact us at{' '}
              <a
                href="mailto:topaz2.0@yahoo.com"
                className="underline hover:text-blue-900"
              >
                topaz2.0@yahoo.com
              </a>
            </p>
          </div>

          <div className="mb-8">
            <h2 className="mb-8 font-display text-3xl font-bold text-gray-900">Featured Items</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

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
