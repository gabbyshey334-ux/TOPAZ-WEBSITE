import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'TOPAZ Heritage Tee - Black',
    category: 't-shirts',
    price: 25,
    image: `${import.meta.env.BASE_URL}images/products/tshirt-black-1.jpg`,
    description: 'Classic black t-shirt with TOPAZ logo',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false // Coming soon
  },
  {
    id: 2,
    name: 'TOPAZ Performance Blue Tee',
    category: 't-shirts',
    price: 25,
    image: `${import.meta.env.BASE_URL}images/products/tshirt-blue-1.jpg`,
    description: 'Blue performance t-shirt with dancer design',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false
  },
  {
    id: 3,
    name: 'TOPAZ Legacy Tee - Black',
    category: 't-shirts',
    price: 25,
    image: `${import.meta.env.BASE_URL}images/products/tshirt-black-2.jpg`,
    description: 'Black legacy design t-shirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false
  },
  {
    id: 4,
    name: 'TOPAZ Signature Hoodie',
    category: 'sweatshirts',
    price: 45,
    image: `${import.meta.env.BASE_URL}images/products/sweatshirt-black-1.jpg`,
    description: 'Black hoodie with signature TOPAZ design',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false
  }
];

const ProductCard = ({ product }: { product: typeof products[0] }) => {
  const [selectedSize, setSelectedSize] = useState('M');

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
      
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback image if product image missing
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80';
          }}
        />
        
        {/* Coming Soon Badge */}
        {!product.available && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
            COMING SOON
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2">
          {product.name}
        </h3>
        
        <p className="text-2xl font-black text-blue-600 mb-4">
          ${product.price}
        </p>

        {/* Size Selector */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Size:</p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-10 h-10 rounded-lg border-2 font-semibold transition-all text-sm ${
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

        {/* Add to Cart Button */}
        <button
          className="w-full py-3 bg-gray-100 text-gray-500 font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
          disabled
        >
          <ShoppingBag className="w-4 h-4" />
          Coming Soon
        </button>
      </div>

    </div>
  );
};

const Shop = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* SECTION 1: HERO */}
      <section className="relative bg-[#0a0a0a] min-h-screen overflow-hidden flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop"
            className="w-full h-full object-cover grayscale"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <p className="hero-animate font-mono text-primary font-bold tracking-[0.3em] uppercase mb-6">
            Official Merchandise
          </p>
          <h1 className="hero-animate font-display font-black text-5xl sm:text-6xl lg:text-[8rem] text-white leading-[0.85] tracking-tighter uppercase mb-8">
            Explore the <span className="text-primary italic">Collection</span>
          </h1>
          <div className="hero-animate w-24 h-1 bg-primary mx-auto rounded-full mb-8" />
          <p className="hero-animate text-xl text-white/70 max-w-2xl mx-auto">
            Pre-order your exclusive TOPAZ gear now!
          </p>
        </div>
      </section>

      {/* SECTION 4: COMING SOON NOTICE */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Online Store Coming Soon!
            </h3>
            <p className="text-blue-800 mb-6 text-lg">
              Our online merchandise store is currently under development. 
              For now, you can purchase these items at our competitions or pre-order via email.
            </p>
            <p className="text-sm font-semibold text-blue-700 bg-blue-100 inline-block px-4 py-2 rounded-full">
              Want to pre-order? Contact us at <a href="mailto:topaz2.0@yahoo.com" className="underline hover:text-blue-900">topaz2.0@yahoo.com</a>
            </p>
          </div>

          {/* SECTION 2: FEATURED PRODUCTS */}
          <div className="mb-12">
            <h2 className="font-display font-bold text-3xl text-gray-900 mb-8">Featured Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SIZE GUIDE */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-gray-900 mb-3">Size Guide</h2>
            <p className="text-gray-500">All measurements are in inches. When in between sizes, we recommend sizing up.</p>
          </div>

          {/* T-Shirts */}
          <div className="mb-10">
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#2E75B6] rounded-full inline-block"></span>
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

          {/* Sweatshirts */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#2E75B6] rounded-full inline-block"></span>
              Sweatshirts
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

          <p className="text-center text-sm text-gray-400 mt-6">
            Questions about sizing? Email us at{' '}
            <a href="mailto:topaz2.0@yahoo.com" className="text-[#2E75B6] underline hover:text-[#1F4E78]">
              topaz2.0@yahoo.com
            </a>
          </p>
        </div>
      </section>

      {/* SECTION 6: BOTTOM CTA */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
            Questions about merchandise?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Need help with sizing or bulk orders for your studio?
          </p>
          <a
            href="mailto:topaz2.0@yahoo.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Contact Us
          </a>
        </div>
      </section>

    </div>
  );
};

export default Shop;
