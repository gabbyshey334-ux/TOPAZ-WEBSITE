import { useMemo, useState } from 'react';
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Wallet,
  Banknote,
  Landmark,
  ScrollText,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { computeShopOrderTotals, type ShopFulfillment } from '@/lib/shopFees';

type CheckoutStep = 'cart' | 'checkout' | 'success';

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

/** Matches registration / merch policy — keep in sync with confirmation emails. */
const ZELLE_PAYEE = 'topaz2.0@yahoo.com';
const CHECK_MAILING_LINE = 'TOPAZ 2.0, PO BOX 131, BANKS OR 97106';

type ShopPayMethod = 'zelle' | 'cash' | 'check' | 'money_order';

function OrderTotalsBreakdown({
  totals,
  showFeesNote,
}: {
  totals: ReturnType<typeof computeShopOrderTotals>;
  showFeesNote?: boolean;
}) {
  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
      </div>
      {totals.shipping > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-semibold">${totals.shipping.toFixed(2)}</span>
        </div>
      )}
      {totals.handling > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>Handling</span>
          <span className="font-semibold">${totals.handling.toFixed(2)}</span>
        </div>
      )}
      {totals.tax > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span className="font-semibold">${totals.tax.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-black text-gray-900 pt-1">
        <span>Total</span>
        <span className="text-[#2E75B6]">${totals.total.toFixed(2)}</span>
      </div>
      {showFeesNote && totals.shipping === 0 && (
        <p className="text-xs text-gray-400 pt-1">Pickup at the event or studio — no shipping or handling fees.</p>
      )}
    </div>
  );
}

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, total, count, isOpen, closeCart, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [form, setForm] = useState<CheckoutForm>({ name: '', email: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [payMethod, setPayMethod] = useState<ShopPayMethod>('zelle');
  const [fulfillment, setFulfillment] = useState<ShopFulfillment>('pickup');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [placedOrderTotal, setPlacedOrderTotal] = useState(0);
  const [customerConfirmationSent, setCustomerConfirmationSent] = useState(false);

  const orderTotals = useMemo(
    () => computeShopOrderTotals(total, fulfillment),
    [total, fulfillment],
  );

  const handleClose = () => {
    if (step === 'success') {
      setStep('cart');
      setForm({ name: '', email: '', phone: '', address: '', notes: '' });
      setCreatedOrderId('');
      setPlacedOrderTotal(0);
      setCustomerConfirmationSent(false);
      setPayMethod('zelle');
      setFulfillment('pickup');
    }
    closeCart();
  };

  const validate = (): boolean => {
    const errs: CheckoutErrors = {};
    if (!form.name.trim()) errs.name = 'Your name is required.';
    const addr = form.address.trim();
    if (!addr || addr.length < 8) {
      errs.address = 'Please enter your full street address or pickup location (at least a few words).';
    }
    const emailTrim = form.email.trim();
    if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errs.email = 'Enter a valid email, or leave this field blank.';
    }
    const phoneTrim = form.phone.trim();
    if (phoneTrim && phoneTrim.length < 7) {
      errs.phone = 'If you enter a phone number, please include a complete number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOfflineOrder = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const { data, error } = await supabase.functions.invoke('submit-pending-shop-order', {
        body: {
          items: items.map((i) => ({
            product_id: i.productId,
            product_name: i.productName,
            size: i.size,
            quantity: i.quantity,
          })),
          customer_name: form.name.trim(),
          customer_email: form.email.trim().toLowerCase() || undefined,
          phone: form.phone.trim() || undefined,
          shipping_address: form.address.trim(),
          notes: form.notes.trim() || undefined,
          payment_method: payMethod,
          fulfillment,
        },
      });

      if (error) throw new Error(error.message ?? 'Checkout failed');
      const res = data as {
        success?: boolean;
        orderId?: string;
        total_amount?: number;
        emailDelivered?: boolean;
        customerEmailDelivered?: boolean;
        customerEmailError?: string;
        error?: string;
      };
      if (res?.error) throw new Error(res.error);
      if (!res?.success || !res.orderId) throw new Error('Unexpected response from checkout');

      setPlacedOrderTotal(typeof res.total_amount === 'number' ? res.total_amount : orderTotals.total);
      setCustomerConfirmationSent(Boolean(form.email.trim() && res.customerEmailDelivered));
      clearCart();
      setCreatedOrderId(res.orderId);
      setStep('success');
      if (res.emailDelivered === false) {
        console.warn(
          '[CartDrawer] Order saved but admin email may not have sent. Order id:',
          res.orderId,
        );
      }
      if (form.email.trim() && res.customerEmailDelivered === false) {
        console.warn(
          '[CartDrawer] Order saved but customer confirmation email may not have sent. Order id:',
          res.orderId,
          res.customerEmailError,
        );
      }
    } catch (err) {
      console.error('[CartDrawer] Offline checkout error:', err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'We could not place your order. Please try again or email topaz2.0@yahoo.com with what you would like to order.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckoutSubmit = () => {
    void handlePlaceOfflineOrder();
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
                  <OrderTotalsBreakdown totals={orderTotals} showFeesNote />
                  <p className="text-xs text-gray-400">Shipping fees apply if you choose mail delivery at checkout.</p>
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
                <div className="border-t border-gray-200 mt-3 pt-3">
                  <OrderTotalsBreakdown totals={orderTotals} showFeesNote />
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-800 mb-3">Delivery</h3>
              <RadioGroup
                value={fulfillment}
                onValueChange={(v) => setFulfillment(v as ShopFulfillment)}
                className="space-y-2.5 mb-6"
              >
                <label
                  htmlFor="fulfillment-pickup"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${fulfillment === 'pickup' ? 'border-[#2E75B6] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <RadioGroupItem value="pickup" id="fulfillment-pickup" className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-gray-900">Pickup at event or studio</span>
                    <span className="mt-1 block text-xs leading-snug text-gray-500">No shipping or handling fees.</span>
                  </span>
                </label>
                <label
                  htmlFor="fulfillment-ship"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${fulfillment === 'ship' ? 'border-[#2E75B6] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <RadioGroupItem value="ship" id="fulfillment-ship" className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-gray-900">Ship to my address</span>
                    <span className="mt-1 block text-xs leading-snug text-gray-500">
                      Adds $12.45 shipping &amp; handling.
                    </span>
                  </span>
                </label>
              </RadioGroup>

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
                  htmlFor="pay-money-order"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${payMethod === 'money_order' ? 'border-[#2E75B6] bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <RadioGroupItem value="money_order" id="pay-money-order" className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <ScrollText className="h-4 w-4 shrink-0 text-[#2E75B6]" aria-hidden />
                      Money order
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-gray-500">
                      Mail a money order payable to <strong className="text-gray-800">Topaz 2.0 LLC</strong> to {CHECK_MAILING_LINE}.
                    </span>
                  </span>
                </label>
              </RadioGroup>

              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
                <p className="text-sm text-amber-950">
                  Your order will be saved as <strong>pending</strong> until we receive payment. We will follow up using the email or phone number you provided, if any.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-name" className="text-gray-700 font-semibold text-sm">
                    Your name *
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
                  <Label htmlFor="checkout-address" className="text-gray-700 font-semibold text-sm">
                    Shipping or pickup address *
                  </Label>
                  <Textarea
                    id="checkout-address"
                    value={form.address}
                    onChange={(e) => { setForm((f) => ({ ...f, address: e.target.value })); setErrors((er) => ({ ...er, address: undefined })); }}
                    placeholder="Street, city, state, ZIP — or where you will pick up (studio / event)."
                    rows={3}
                    className={`border-gray-300 resize-none ${errors.address ? 'border-red-400' : ''}`}
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="checkout-email" className="text-gray-700 font-semibold text-sm">
                    Email <span className="font-normal text-gray-400">(recommended for order confirmation)</span>
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
                    We may use this for order updates. You can leave it blank if you prefer.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="checkout-phone" className="text-gray-700 font-semibold text-sm">
                    Phone <span className="font-normal text-gray-400">(optional)</span>
                  </Label>
                  <Input
                    id="checkout-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((er) => ({ ...er, phone: undefined })); }}
                    placeholder="971-555-0100"
                    className={`border-gray-300 ${errors.phone ? 'border-red-400' : ''}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="checkout-notes" className="text-gray-700 font-semibold text-sm">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="checkout-notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Sizing questions, gift note, second pickup contact…"
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
                    Placing your order…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Place order · ${orderTotals.total.toFixed(2)}
                  </>
                )}
              </Button>
              <p className="mt-2 text-center text-xs text-gray-400">
                Zelle, cash, check, and money order orders stay pending until payment is received.
              </p>
            </div>
          </>
        )}

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
                  Mail a check for the amount below, payable to <strong>Topaz 2.0 LLC</strong>, to the address below. Include your name and order number on the memo line.
                </p>
              )}
              {payMethod === 'money_order' && (
                <p>
                  Mail a money order for the amount below, payable to <strong>Topaz 2.0 LLC</strong>, to the address below. Include your name and order number on the memo line.
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
              {customerConfirmationSent && (
                <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  A confirmation email was sent to you with these payment details.
                </p>
              )}
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
