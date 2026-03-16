import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'TOPAZ Dancer Silhouettes Tee',
    category: 't-shirts',
    price: 25,
    image: '/images/products/tshirt-black-dancers.jpg',
    description: 'Black t-shirt with dancer silhouettes design',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false // Coming soon
  },
  {
    id: 2,
    name: 'TOPAZ Colorful Dancer Tee',
    category: 't-shirts',
    price: 25,
    image: '/images/products/tshirt-blue-dancer.jpg',
    description: 'Blue t-shirt with colorful swirl dancer',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false
  },
  {
    id: 3,
    name: 'TOPAZ Leap Tee',
    category: 't-shirts',
    price: 25,
    image: '/images/products/tshirt-black-leap.jpg',
    description: 'Black t-shirt with leaping dancer',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    available: false
  },
  {
    id: 4,
    name: 'TOPAZ Dancer Sweatshirt',
    category: 'sweatshirts',
    price: 45,
    image: '/images/products/sweatshirt-black-dancer.jpg',
    description: 'Black sweatshirt with dancer design',
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
      <section className="relative bg-white py-24 lg:py-32 border-b border-gray-100">
        <div className="absolute inset-0 bg-[url('/images/topaz-pattern.png')] opacity-5" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-16">
          <p className="text-blue-600 font-bold tracking-widest uppercase mb-4">Official Merchandise</p>
          <h1 className="font-display font-black text-5xl lg:text-7xl text-gray-900 mb-6 tracking-tight">
            Explore the Collection
          </h1>
          <p className="text-xl text-gray-500 mb-8">
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
