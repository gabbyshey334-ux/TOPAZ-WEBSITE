import { useState } from 'react';
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Wallet,
  Banknote,
  Landmark,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';

type CheckoutStep = 'cart' | 'checkout' | 'success';

type CheckoutForm = {
  name: string;
  email: string;
  notes: string;
};

/** Matches registration / merch policy — keep in sync with confirmation emails. */
const ZELLE_PAYEE = 'topaz2.0@yahoo.com';
const CHECK_MAILING_LINE = 'TOPAZ 2.0, PO BOX 131, BANKS OR 97106';

type ShopPayMethod = 'card' | 'zelle' | 'cash' | 'check';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, count, isOpen, closeCart, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [form, setForm] = useState<CheckoutForm>({ name: '', email: '', notes: '' });
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [payMethod, setPayMethod] = useState<ShopPayMethod>('zelle');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [placedOrderTotal, setPlacedOrderTotal] = useState(0);

  const handleClose = () => {
    if (step === 'success') {
      setStep('cart');
      setForm({ name: '', email: '', notes: '' });
      setCreatedOrderId('');
      setPlacedOrderTotal(0);
      setPayMethod('zelle');
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

  const offlineMethodLabel = (m: Exclude<ShopPayMethod, 'card'>) => {
    if (m === 'zelle') return 'Zelle';
    if (m === 'cash') return 'Cash (pickup or at event)';
    return 'Check by mail';
  };

  const handlePlaceOfflineOrder = async () => {
    if (!validate()) return;
    if (payMethod === 'card') return;

    setSubmitting(true);
    setSubmitError('');

    const orderItems = items.map((i) => ({
      product_id: i.productId,
      product_name: i.productName,
      size: i.size,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    }));

    const methodLine = `Customer selected payment: ${offlineMethodLabel(payMethod)}`;
    const notesCombined = [methodLine, form.notes.trim()].filter(Boolean).join('\n\n');

    try {
      const { data: order, error: insertErr } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name.trim(),
          customer_email: form.email.trim().toLowerCase(),
          items: orderItems,
          total_amount: total,
          status: 'pending',
          payment_reference: `offline:${crypto.randomUUID()}`,
          notes: notesCombined || null,
        })
        .select('id')
        .single();

      if (insertErr || !order?.id) {
        throw new Error(insertErr?.message ?? 'Could not save your order');
      }

      const { error: notifyErr } = await supabase.functions.invoke('send-order-notification', {
        body: {
          order_id: order.id,
          customer_name: form.name.trim(),
          customer_email: form.email.trim().toLowerCase(),
          items: orderItems,
          total_amount: total,
          notes: notesCombined || undefined,
        },
      });
      if (notifyErr) {
        console.warn('[CartDrawer] send-order-notification failed (order was saved):', notifyErr);
      }

      setPlacedOrderTotal(total);
      clearCart();
      setCreatedOrderId(order.id);
      setStep('success');
    } catch (err) {
      console.error('[CartDrawer] Offline checkout error:', err);
      setSubmitError(
        'We could not place your order. Please try again or email topaz2.0@yahoo.com with what you would like to order.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckoutSubmit = () => {
    if (payMethod === 'card') void handlePayWithCard();
    else void handlePlaceOfflineOrder();
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
                        <p className="text-sm font-bold text-gray-900 leading-tight break-words">{item.productName}</p>
                        <p className="text-xs text-gray-500 mt-0.5 break-words">Size: {item.size}</p>
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
                onClick={() => {
                  setStep('cart');
                  setSubmitError('');
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to cart
              </button>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Order Summary</h3>
                {items.map((item) => (
                  <div key={`${item.productId}:${item.size}`} className="flex justify-between items-baseline gap-3 text-sm text-gray-600 mb-1">
                    <span className="min-w-0 flex-1 break-words">{item.productName} ({item.size}) ×{item.quantity}</span>
                    <span className="font-semibold shrink-0 whitespace-nowrap">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-[#2E75B6]">${total.toFixed(2)}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-800 mb-3">How would you like to pay?</h3>
              <RadioGroup
                value={payMethod}
                onValueChange={(v) => {
                  setPayMethod(v as ShopPayMethod);
                  setSubmitError('');
                }}
                className="space-y-2.5 mb-5"
              >
                <label
                  htmlFor="pay-zelle"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${payMethod === 'zelle' ? 'border-[#2E75B6] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <RadioGroupItem value="zelle" id="pay-zelle" className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Wallet className="h-4 w-4 shrink-0 text-[#2E75B6]" aria-hidden />
                      Zelle
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-gray-500">
                      Pay to <strong className="text-gray-800">{ZELLE_PAYEE}</strong>. After you place the order, use your order number in the memo.
                    </span>
                  </span>
                </label>
                <label
                  htmlFor="pay-cash"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${payMethod === 'cash' ? 'border-[#2E75B6] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <RadioGroupItem value="cash" id="pay-cash" className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Banknote className="h-4 w-4 shrink-0 text-[#2E75B6]" aria-hidden />
                      Cash
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-gray-500">
                      Pay when you pick up your merch or at the event. Your order is held once you submit it.
                    </span>
                  </span>
                </label>
                <label
                  htmlFor="pay-check"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${payMethod === 'check' ? 'border-[#2E75B6] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <RadioGroupItem value="check" id="pay-check" className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Landmark className="h-4 w-4 shrink-0 text-[#2E75B6]" aria-hidden />
                      Check by mail
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-gray-500">
                      Mail checks payable to <strong className="text-gray-800">Topaz 2.0 LLC</strong> to {CHECK_MAILING_LINE}.
                    </span>
                  </span>
                </label>
                <label
                  htmlFor="pay-card"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${payMethod === 'card' ? 'border-[#2E75B6] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <RadioGroupItem value="card" id="pay-card" className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <CreditCard className="h-4 w-4 shrink-0 text-[#2E75B6]" aria-hidden />
                      Credit or debit card
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-gray-500">
                      Secure checkout with Stripe — you will leave this page to pay, then return here when you are done.
                    </span>
                  </span>
                </label>
              </RadioGroup>

              {payMethod === 'card' ? (
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 mb-6">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                  <p className="text-sm text-blue-900">
                    Your card details are processed by Stripe and never stored on our servers.
                  </p>
                </div>
              ) : (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
                  <p className="text-sm text-amber-950">
                    Your order will be saved as <strong>pending</strong> until we receive payment. We will follow up at your email if we need anything else.
                  </p>
                </div>
              )}

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
                  <p className="text-xs text-gray-400">
                    {payMethod === 'card'
                      ? 'Stripe will send your receipt to this address after payment.'
                      : 'We may contact you here about pickup, shipping, or your payment.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="checkout-notes" className="text-gray-700 font-semibold text-sm">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="checkout-notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Pickup preference, shipping address, sizing questions…"
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
                onClick={handleCheckoutSubmit}
                disabled={submitting}
                className="w-full bg-[#2E75B6] hover:bg-[#1F4E78] text-white font-bold py-3 text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {payMethod === 'card' ? 'Redirecting to payment…' : 'Placing your order…'}
                  </>
                ) : payMethod === 'card' ? (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay with card · ${total.toFixed(2)}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Place order · ${total.toFixed(2)}
                  </>
                )}
              </Button>
              {payMethod === 'card' ? (
                <p className="mt-2 text-center text-xs text-gray-400">Secured by Stripe</p>
              ) : (
                <p className="mt-2 text-center text-xs text-gray-400">
                  Zelle, cash, and check orders stay pending until payment is received.
                </p>
              )}
            </div>
          </>
        )}

        {/* Success: Stripe return banner on Shop is primary; this step is used for offline checkout. */}
        {step === 'success' && (
          <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <CheckCircle2 className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="mb-2 text-2xl font-black text-gray-900">Order received</h3>
            {createdOrderId && (
              <p className="mb-4 font-mono text-xs text-gray-500">
                Order #{createdOrderId.slice(0, 8).toUpperCase()}
              </p>
            )}
            <div className="max-w-sm space-y-4 text-left text-sm leading-relaxed text-gray-700">
              {payMethod === 'zelle' && (
                <p>
                  Complete your purchase by sending the amount below via <strong>Zelle</strong>, using your order number in the memo.
                </p>
              )}
              {payMethod === 'cash' && (
                <p>
                  We recorded your order as <strong>cash on pickup</strong> (or at the event). Bring payment when you collect your items. If you prefer to pay sooner, you can use Zelle or mail a check instead — details below.
                </p>
              )}
              {payMethod === 'check' && (
                <p>
                  Mail a check or money order for the amount below, payable to <strong>Topaz 2.0 LLC</strong>, to the address below. Include your name and order number on the memo line.
                </p>
              )}
              <p>
                <strong>Amount due:</strong>{' '}
                <span className="text-[#2E75B6]">${placedOrderTotal.toFixed(2)}</span>
              </p>
              <p>
                <strong>Zelle:</strong> Send to <strong className="break-all">{ZELLE_PAYEE}</strong>. In the memo, include your name and order #
                {createdOrderId ? ` ${createdOrderId.slice(0, 8).toUpperCase()}` : ''}.
              </p>
              <p>
                <strong>Check or money order:</strong> Payable to <strong>Topaz 2.0 LLC</strong>, mailed to {CHECK_MAILING_LINE}.
              </p>
              <p className="text-xs text-gray-500">
                Questions? Email <span className="break-all">topaz2.0@yahoo.com</span> or call 971-299-4401.
              </p>
            </div>
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
