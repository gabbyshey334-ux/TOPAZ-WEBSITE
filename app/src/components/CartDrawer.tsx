import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, Loader2, ArrowLeft, CheckCircle2, CreditCard } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';

type CheckoutStep = 'cart' | 'checkout' | 'success';

type CheckoutForm = {
  name: string;
  email: string;
  notes: string;
};

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, count, isOpen, closeCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [form, setForm] = useState<CheckoutForm>({ name: '', email: '', notes: '' });
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderId] = useState('');

  const handleClose = () => {
    if (step === 'success') {
      setStep('cart');
      setForm({ name: '', email: '', notes: '' });
    }
    closeCart();
  };

  const validate = (): boolean => {
    const errs: Partial<CheckoutForm> = {};
    if (!form.name.trim()) errs.name = 'Your name is required.';
    if (!form.email.trim()) errs.email = 'Your email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePayWithCard = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const cartItems = items.map((i) => ({
        productId: i.productId,
        name: i.productName,
        size: i.size,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }));

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items: cartItems,
          customerEmail: form.email.trim().toLowerCase(),
          customerName: form.name.trim(),
          notes: form.notes.trim() || undefined,
        },
      });

      if (error) throw new Error(error.message ?? 'Failed to create checkout session');
      if (!data?.url) throw new Error('No checkout URL returned');

      // Redirect to Stripe Hosted Checkout — cart is preserved in localStorage
      // so it survives the redirect if the customer cancels.
      window.location.href = data.url;
    } catch (err) {
      console.error('[CartDrawer] Stripe checkout error:', err);
      setSubmitError(
        'Payment setup failed. Please try again or contact us at topaz2.0@yahoo.com'
      );
      setSubmitting(false);
    }
    // Note: setSubmitting(false) is NOT called on success because the page
    // is redirecting — keeping the spinner shows until the navigation happens.
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-white p-0 flex flex-col border-l border-gray-200"
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-black text-gray-900 tracking-tight">
              {step === 'cart' && (
                <span>
                  Your Cart{' '}
                  {count > 0 && (
                    <span className="text-sm font-bold text-[#2E75B6] bg-blue-50 rounded-full px-2 py-0.5 ml-1">
                      {count}
                    </span>
                  )}
                </span>
              )}
              {step === 'checkout' && 'Checkout'}
              {step === 'success' && 'Order Confirmed!'}
            </SheetTitle>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        {/* Cart Step */}
        {step === 'cart' && (
          <>
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
                <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-6">Add some TOPAZ 2.0 merch to get started!</p>
                <Button onClick={closeCart} className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white">
                  Keep Shopping
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}:${item.size}`}
                      className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-tight">{item.productName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                        <p className="text-sm font-black text-[#2E75B6] mt-1">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity + Remove */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-xl font-black text-[#2E75B6]">${total.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={() => setStep('checkout')}
                    className="w-full bg-[#2E75B6] hover:bg-[#1F4E78] text-white font-bold py-3 text-base"
                  >
                    Checkout
                  </Button>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Checkout Step */}
        {step === 'checkout' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to cart
              </button>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Order Summary</h3>
                {items.map((item) => (
                  <div key={`${item.productId}:${item.size}`} className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{item.productName} ({item.size}) ×{item.quantity}</span>
                    <span className="font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-[#2E75B6]">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Stripe payment info */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
                <CreditCard className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  You'll be securely redirected to Stripe to complete payment. Your card details never touch this site.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-name" className="text-gray-700 font-semibold text-sm">
                    Your Name *
                  </Label>
                  <Input
                    id="checkout-name"
                    value={form.name}
                    onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: undefined })); }}
                    placeholder="Jane Smith"
                    className={`border-gray-300 ${errors.name ? 'border-red-400' : ''}`}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="checkout-email" className="text-gray-700 font-semibold text-sm">
                    Email Address *
                  </Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: undefined })); }}
                    placeholder="jane@example.com"
                    className={`border-gray-300 ${errors.email ? 'border-red-400' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  <p className="text-xs text-gray-400">Your order confirmation will be sent here.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="checkout-notes" className="text-gray-700 font-semibold text-sm">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="checkout-notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Any special requests or questions…"
                    rows={3}
                    className="border-gray-300 resize-none"
                  />
                </div>
              </div>

              {submitError && (
                <p className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {submitError}
                </p>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <Button
                onClick={handlePayWithCard}
                disabled={submitting}
                className="w-full bg-[#2E75B6] hover:bg-[#1F4E78] text-white font-bold py-3 text-base"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Redirecting to payment…</>
                ) : (
                  <><CreditCard className="w-5 h-5 mr-2" />Pay with Card · ${total.toFixed(2)}</>
                )}
              </Button>
              <p className="text-center text-xs text-gray-400 mt-2">Secured by Stripe</p>
            </div>
          </>
        )}

        {/* Success Step — shown as fallback when returning from Stripe via /shop?payment=success */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h3>
            {orderId && (
              <p className="text-xs text-gray-400 font-mono mb-4">
                Order #{orderId.slice(0, 8).toUpperCase()}
              </p>
            )}
            <p className="text-gray-600 mb-2 leading-relaxed">
              Your order has been confirmed and paid.
            </p>
            <p className="text-gray-600 leading-relaxed">
              A confirmation will be sent to{' '}
              <strong className="text-[#2E75B6]">{form.email}</strong>.
            </p>
            <Button
              onClick={handleClose}
              className="mt-8 bg-[#2E75B6] hover:bg-[#1F4E78] text-white"
            >
              Done
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
