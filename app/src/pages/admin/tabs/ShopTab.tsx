import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  Package,
  ImageOff,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { rowsToSiteContentMap } from '@/constants/siteContentDefaults';
import {
  formatProductPriceDisplay,
  parseShopFeesConfig,
  shippingHandlingFlatTotal,
} from '@/lib/shopFees';

type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

type OrderItem = {
  product_id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
};

/** Youth sizes — labels match the Shop page size guide tables. */
const YOUTH_SIZES = [
  'Youth XS (4–5)',
  'Youth S (6–7)',
  'Youth M (8)',
  'Youth L (10–12)',
  'Youth XL (14–16)',
] as const;
const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const PRESET_SIZES = [...YOUTH_SIZES, ...ADULT_SIZES];
const CATEGORIES = ['t-shirts', 'hoodies', 'accessories', 'other'] as const;
const ORDER_STATUSES = ['pending', 'paid', 'fulfilled', 'cancelled'] as const;

const MAX_PRODUCT_IMAGES = 10;

function dedupeUrlsPreserveOrder(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const t = (raw ?? '').trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function statusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    case 'paid': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'fulfilled': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
}

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  sizes: string[];
  customSize: string;
  /** Ordered product photos; first = main thumbnail on shop & cart. */
  gallery_urls: string[];
  is_available: boolean;
  is_visible: boolean;
  stock_note: string;
  display_order: string;
};

const defaultForm = (): ProductFormData => ({
  name: '',
  description: '',
  price: '',
  category: 't-shirts',
  sizes: [...YOUTH_SIZES, ...ADULT_SIZES],
  customSize: '',
  gallery_urls: [],
  is_available: true,
  is_visible: true,
  stock_note: '',
  display_order: '0',
});

function productFromDB(p: Product): ProductFormData {
  return {
    name: p.name,
    description: p.description ?? '',
    price: String(p.price),
    category: p.category ?? 't-shirts',
    sizes: p.sizes_available ?? [],
    customSize: '',
    gallery_urls: dedupeUrlsPreserveOrder([
      ...(p.image_url?.trim() ? [p.image_url.trim()] : []),
      ...(p.image_urls ?? []).map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean),
    ]),
    is_available: p.is_available,
    is_visible: p.is_visible,
    stock_note: p.stock_note ?? '',
    display_order: String(p.display_order),
  };
}

// ─── Product Form Dialog ──────────────────────────────────────────────────────

function ProductFormDialog({
  open,
  onClose,
  editingProduct,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState('');
  const [galleryPaste, setGalleryPaste] = useState('');
  const fileGalleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(editingProduct ? productFromDB(editingProduct) : defaultForm());
      setGalleryPaste('');
      setError('');
    }
  }, [open, editingProduct]);

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const addCustomSize = () => {
    const s = form.customSize.trim().toUpperCase();
    if (s && !form.sizes.includes(s)) {
      setForm((f) => ({ ...f, sizes: [...f.sizes, s], customSize: '' }));
    }
  };

  const removeSize = (size: string) => {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((s) => s !== size) }));
  };

  const handleGalleryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (form.gallery_urls.length >= MAX_PRODUCT_IMAGES) {
      setError(`Maximum ${MAX_PRODUCT_IMAGES} photos per product.`);
      return;
    }
    setUploadingGallery(true);
    setError('');
    try {
      const ext = file.name.split('.').pop();
      const path = `shop/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(path, file, { upsert: false });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from('gallery').getPublicUrl(path);
      setForm((f) => {
        if (f.gallery_urls.length >= MAX_PRODUCT_IMAGES) return f;
        return { ...f, gallery_urls: dedupeUrlsPreserveOrder([...f.gallery_urls, data.publicUrl]) };
      });
    } catch (err) {
      setError('Image upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploadingGallery(false);
    }
  };

  const addGalleryFromPaste = () => {
    const t = galleryPaste.trim();
    if (!t) return;
    if (form.gallery_urls.length >= MAX_PRODUCT_IMAGES) {
      setError(`Maximum ${MAX_PRODUCT_IMAGES} photos per product.`);
      return;
    }
    setForm((f) => ({ ...f, gallery_urls: dedupeUrlsPreserveOrder([...f.gallery_urls, t]) }));
    setGalleryPaste('');
  };

  const removeGalleryAt = (index: number) => {
    setForm((f) => ({ ...f, gallery_urls: f.gallery_urls.filter((_, j) => j !== index) }));
  };

  const moveGallery = (index: number, delta: number) => {
    setForm((f) => {
      const arr = [...f.gallery_urls];
      const j = index + delta;
      if (j < 0 || j >= arr.length) return f;
      const t = arr[index];
      arr[index] = arr[j];
      arr[j] = t;
      return { ...f, gallery_urls: arr };
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { setError('Enter a valid price.'); return; }

    setSaving(true);
    setError('');
    try {
      const urls = dedupeUrlsPreserveOrder(form.gallery_urls);
      const image_url = urls[0] || null;
      const image_urls = urls.length > 0 ? urls : null;

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price,
        category: form.category || null,
        sizes_available: form.sizes.length > 0 ? form.sizes : null,
        image_url: image_url,
        image_urls,
        is_available: form.is_available,
        is_visible: form.is_visible,
        stock_note: form.stock_note.trim() || null,
        display_order: parseInt(form.display_order) || 0,
        updated_at: new Date().toISOString(),
      };

      if (editingProduct) {
        const { error: err } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('products').insert(payload);
        if (err) throw err;
      }
      onSaved();
      onClose();
    } catch (err) {
      setError('Save failed. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const customSizes = form.sizes.filter((s) => !(PRESET_SIZES as readonly string[]).includes(s));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {editingProduct ? 'Update the product details below.' : 'Fill in the details for the new product.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Product Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Blue Topaz 2.0 Shirt"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Price (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="45.00"
                  className="bg-slate-800 border-slate-600 text-white pl-7"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-white capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3">
            <Label className="text-slate-300">Sizes Available</Label>
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Youth (kids)</p>
              <div className="flex flex-wrap gap-2">
                {YOUTH_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`min-h-9 rounded-lg border-2 px-2.5 py-1.5 text-left text-xs font-semibold leading-snug transition-all max-w-full ${
                      form.sizes.includes(size)
                        ? 'border-[#2E75B6] bg-[#2E75B6]/20 text-[#7EB8E8]'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Adult</p>
              <div className="flex flex-wrap gap-2">
                {ADULT_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`h-9 w-12 rounded-lg border-2 text-sm font-semibold transition-all ${
                      form.sizes.includes(size)
                        ? 'border-[#2E75B6] bg-[#2E75B6]/20 text-[#7EB8E8]'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            {customSizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customSizes.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full"
                  >
                    {s}
                    <button type="button" onClick={() => removeSize(s)} className="text-slate-400 hover:text-red-400">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={form.customSize}
                onChange={(e) => setForm((f) => ({ ...f, customSize: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                placeholder="Custom size (e.g. One Size)"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomSize}
                className="shrink-0 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Product photos (gallery) */}
          <div className="space-y-3">
            <div>
              <Label className="text-slate-300">Product photos</Label>
              <p className="text-xs text-slate-500 mt-1">
                First photo is the main thumbnail on the shop and in the cart. Add multiple angles, back print, or color
                options (up to {MAX_PRODUCT_IMAGES}).
              </p>
            </div>

            {form.gallery_urls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.gallery_urls.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className="relative w-[72px] h-[72px] rounded-lg overflow-hidden bg-slate-800 border border-slate-600 shrink-0"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-0 left-0 right-0 bg-black/70 text-[9px] font-bold text-center py-0.5 text-white">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      title="Remove photo"
                      onClick={() => removeGalleryAt(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600/90 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 z-10"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5 bg-black/55 py-0.5">
                      <button
                        type="button"
                        title="Move earlier"
                        disabled={i === 0}
                        onClick={() => moveGallery(i, -1)}
                        className="w-6 h-5 rounded bg-slate-800/95 text-white flex items-center justify-center disabled:opacity-25 hover:bg-slate-700"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        title="Move later"
                        disabled={i === form.gallery_urls.length - 1}
                        onClick={() => moveGallery(i, 1)}
                        className="w-6 h-5 rounded bg-slate-800/95 text-white flex items-center justify-center disabled:opacity-25 hover:bg-slate-700"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileGalleryRef.current?.click()}
                disabled={uploadingGallery || form.gallery_urls.length >= MAX_PRODUCT_IMAGES}
                className="w-full h-14 rounded-lg border-2 border-dashed border-slate-600 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-[#2E75B6] hover:text-[#7EB8E8] transition-colors disabled:opacity-50 text-xs"
              >
                {uploadingGallery ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Uploading…</span></>
                ) : (
                  <><Plus className="w-4 h-4" /><span>Add photo (upload)</span></>
                )}
              </button>
              <input
                ref={fileGalleryRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleGalleryFile(e)}
              />
              <div className="flex gap-2">
                <Input
                  value={galleryPaste}
                  onChange={(e) => setGalleryPaste(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGalleryFromPaste())}
                  placeholder="Or paste image URL and Add"
                  disabled={form.gallery_urls.length >= MAX_PRODUCT_IMAGES}
                  className="bg-slate-800 border-slate-600 text-white text-xs placeholder:text-slate-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addGalleryFromPaste}
                  disabled={form.gallery_urls.length >= MAX_PRODUCT_IMAGES || !galleryPaste.trim()}
                  className="shrink-0 border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                >
                  Add URL
                </Button>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-3">
              <div>
                <p className="text-sm font-medium text-white">In Stock</p>
                <p className="text-xs text-slate-400">Shows "Out of Stock" if off</p>
              </div>
              <Switch
                checked={form.is_available}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_available: v }))}
              />
            </div>
            <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-3">
              <div>
                <p className="text-sm font-medium text-white">Visible</p>
                <p className="text-xs text-slate-400">Hides from public if off</p>
              </div>
              <Switch
                checked={form.is_visible}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_visible: v }))}
              />
            </div>
          </div>

          {/* Display order */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Display Order</Label>
              <Input
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-500">Lower = appears first</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Stock Note</Label>
              <Input
                value={form.stock_note}
                onChange={(e) => setForm((f) => ({ ...f, stock_note: e.target.value }))}
                placeholder="e.g. Limited sizes left"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Description (optional)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short product description…"
              rows={2}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white"
          >
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : 'Save Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteProductDialog({
  product,
  onClose,
  onDeleted,
}: {
  product: Product | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;
      onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-red-400">Delete Product</DialogTitle>
          <DialogDescription className="text-slate-400">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white">{product?.name}</strong>? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</> : 'Yes, Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="aspect-square bg-slate-700 relative">
        {(product.image_url?.trim() || product.image_urls?.[0]?.trim()) ? (
          <img
            src={(product.image_url?.trim() || product.image_urls?.[0]?.trim())!}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-slate-600" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              product.is_available
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}
          >
            {product.is_available ? 'In Stock' : 'Out of Stock'}
          </span>
          {!product.is_visible && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-600/60 text-slate-300 border-slate-500 flex items-center gap-1">
              <EyeOff className="w-2.5 h-2.5" /> Hidden
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
          {product.category ?? 'merchandise'}
        </p>
        <h3 className="text-sm font-bold text-white leading-snug mb-1">{product.name}</h3>
        <p className="text-lg font-black text-[#7EB8E8] mb-2">${Number(product.price).toFixed(2)}</p>

        {product.sizes_available && product.sizes_available.length > 0 && (
          <p className="text-xs text-slate-400 mb-3">
            Sizes: {product.sizes_available.join(', ')}
          </p>
        )}

        {product.stock_note && (
          <p className="text-xs text-amber-400 mb-2 italic">{product.stock_note}</p>
        )}

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="flex-1 h-8 text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Pencil className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="h-8 w-8 p-0 border-slate-600 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              className="w-6 h-4 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              className="w-6 h-4 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (!error) setProducts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const above = products[index - 1];
    const current = products[index];
    await Promise.all([
      supabase.from('products').update({ display_order: above.display_order, updated_at: new Date().toISOString() }).eq('id', current.id),
      supabase.from('products').update({ display_order: current.display_order, updated_at: new Date().toISOString() }).eq('id', above.id),
    ]);
    fetchProducts();
  };

  const handleMoveDown = async (index: number) => {
    if (index === products.length - 1) return;
    const below = products[index + 1];
    const current = products[index];
    await Promise.all([
      supabase.from('products').update({ display_order: below.display_order, updated_at: new Date().toISOString() }).eq('id', current.id),
      supabase.from('products').update({ display_order: current.display_order, updated_at: new Date().toISOString() }).eq('id', below.id),
    ]);
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-white">Products</h3>
          <p className="text-xs text-slate-400">{products.length} product{products.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 animate-pulse">
              <div className="aspect-square bg-slate-700" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-slate-700 rounded w-3/4" />
                <div className="h-5 bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No products yet</p>
          <p className="text-sm mt-1">Add your first product to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              isFirst={i === 0}
              isLast={i === products.length - 1}
              onEdit={() => { setEditing(p); setFormOpen(true); }}
              onDelete={() => setDeleteTarget(p)}
              onMoveUp={() => handleMoveUp(i)}
              onMoveDown={() => handleMoveDown(i)}
            />
          ))}
        </div>
      )}

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editingProduct={editing}
        onSaved={fetchProducts}
      />
      <DeleteProductDialog
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={fetchProducts}
      />
    </div>
  );
}

// ─── Orders Section ───────────────────────────────────────────────────────────

function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from('orders').update({ status }).eq('id', id);
    await fetchOrders();
    setUpdatingId(null);
  };

  const confirmDeleteOrder = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    setDeleteError('');
    const { error } = await supabase.from('orders').delete().eq('id', deleteTarget.id);
    if (error) {
      setDeleteError(
        error.message.includes('permission') || error.message.includes('policy')
          ? 'Delete blocked by database rules. Run the latest Supabase migration (orders admin delete) or ask your developer.'
          : error.message,
      );
      setDeleteSubmitting(false);
      return;
    }
    setDeleteTarget(null);
    setDeleteSubmitting(false);
    await fetchOrders();
  };

  const exportCsv = () => {
    const headers = [
      'Order ID', 'Customer Name', 'Customer Email', 'Phone', 'Shipping Address',
      'Status', 'Total Amount', 'Items Summary', 'Notes', 'Date',
    ];
    const rows = orders.map((o) => {
      const items = Array.isArray(o.items)
        ? (o.items as OrderItem[]).map((i) => `${i.product_name} (${i.size}) x${i.quantity}`).join(' | ')
        : '';
      return [
        o.id,
        o.customer_name,
        o.customer_email ?? '',
        o.phone ?? '',
        o.shipping_address ?? '',
        o.status,
        `$${Number(o.total_amount).toFixed(2)}`,
        items,
        o.notes ?? '',
        new Date(o.created_at).toLocaleDateString(),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topaz-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'fulfilled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Orders</h3>
          <p className="text-xs text-slate-400">
            {orders.length} order{orders.length !== 1 ? 's' : ''} · ${totalRevenue.toFixed(2)} total
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportCsv}
          disabled={orders.length === 0}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm"
        >
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-4 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-slate-700 rounded w-32" />
                <div className="h-5 bg-slate-700 rounded w-20" />
              </div>
              <div className="h-3 bg-slate-700 rounded w-48 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders yet</p>
          <p className="text-sm mt-1">Orders from the public shop will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
            const isUpdating = updatingId === order.id;
            const isCancelled = order.status?.toLowerCase() === 'cancelled';
            return (
              <div
                key={order.id}
                className="bg-slate-800 rounded-xl border border-slate-700 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">{order.customer_name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${statusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 break-all">
                      {order.customer_email ? order.customer_email : <span className="italic">No email</span>}
                    </p>
                    {order.phone && (
                      <p className="text-xs text-slate-400 mt-0.5">{order.phone}</p>
                    )}
                    {order.shipping_address && (
                      <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap break-words">{order.shipping_address}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-[#7EB8E8]">
                      ${Number(order.total_amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="bg-slate-900/50 rounded-lg px-3 py-2 mb-3 space-y-1">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-slate-300">
                        <span>{item.product_name} <span className="text-slate-500">({item.size})</span> ×{item.quantity}</span>
                        <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {order.notes && (
                  <p className="text-xs text-slate-400 italic mb-3">Note: {order.notes}</p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {ORDER_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={isUpdating || order.status === s}
                      onClick={() => updateStatus(order.id, s)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:cursor-not-allowed capitalize ${
                        order.status === s
                          ? statusColor(s) + ' opacity-100'
                          : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {isUpdating && order.status !== s ? (
                        <Loader2 className="w-3 h-3 animate-spin inline" />
                      ) : (
                        <>
                          {s === order.status && (order.status === 'fulfilled' ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : s === 'cancelled' ? <XCircle className="w-3 h-3 inline mr-1" /> : null)}
                          {s}
                        </>
                      )}
                    </button>
                  ))}
                </div>
                {isCancelled && (
                  <div className="mt-3 pt-3 border-t border-slate-700/80">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => {
                        setDeleteError('');
                        setDeleteTarget(order);
                      }}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-red-900/60 text-red-300 hover:bg-red-950/40 hover:border-red-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden />
                      Delete permanently
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1.5 max-w-md">
                      Removes this row from the database. Only use for cancelled orders you do not need for records.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError('');
            setDeleteSubmitting(false);
          }
        }}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              {deleteTarget && (
                <>
                  This permanently removes order <span className="font-mono text-slate-200">{deleteTarget.id.slice(0, 8).toUpperCase()}</span>
                  {' '}for <strong className="text-white">{deleteTarget.customer_name}</strong>. This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">{deleteError}</p>
          ) : null}
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white mt-0">
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteSubmitting}
              className="bg-red-700 hover:bg-red-800"
              onClick={() => void confirmDeleteOrder()}
            >
              {deleteSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Deleting…
                </>
              ) : (
                'Delete permanently'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Shop fees (site_content) ─────────────────────────────────────────────────

const SHOP_FEE_KEYS = [
  'shop_shipping_flat',
  'shop_handling_flat',
  'shop_tax_rate',
  'shop_price_plus_label',
] as const;

function ShopFeesSettingsSection() {
  const [shipping, setShipping] = useState('9.95');
  const [handling, setHandling] = useState('2.5');
  const [taxRate, setTaxRate] = useState('0');
  const [pricePlusLabel, setPricePlusLabel] = useState('+ shipping & handling');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('site_content')
      .select('key, value')
      .in('key', [...SHOP_FEE_KEYS]);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const cfg = parseShopFeesConfig(rowsToSiteContentMap(data));
    setShipping(String(cfg.shippingFlat));
    setHandling(String(cfg.handlingFlat));
    setTaxRate(String(cfg.taxRate));
    setPricePlusLabel(cfg.pricePlusLabel);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const previewConfig = parseShopFeesConfig({
    shop_shipping_flat: shipping,
    shop_handling_flat: handling,
    shop_tax_rate: taxRate,
    shop_price_plus_label: pricePlusLabel,
  });

  const handleSave = async () => {
    const ship = parseFloat(shipping);
    const hand = parseFloat(handling);
    const tax = parseFloat(taxRate);
    if (!Number.isFinite(ship) || ship < 0) {
      setError('Enter a valid shipping amount.');
      return;
    }
    if (!Number.isFinite(hand) || hand < 0) {
      setError('Enter a valid handling amount.');
      return;
    }
    if (!Number.isFinite(tax) || tax < 0) {
      setError('Enter a valid tax rate (use 0 for no tax).');
      return;
    }
    if (!pricePlusLabel.trim()) {
      setError('Enter the text shown under product prices.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    const rows = [
      { key: 'shop_shipping_flat', value: String(ship) },
      { key: 'shop_handling_flat', value: String(hand) },
      { key: 'shop_tax_rate', value: String(tax) },
      { key: 'shop_price_plus_label', value: pricePlusLabel.trim() },
    ];
    for (const row of rows) {
      const { error: err } = await supabase.from('site_content').upsert(row, { onConflict: 'key' });
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setMessage('Saved. The shop and checkout now use these shipping and handling settings.');
    void load();
  };

  return (
    <div className="max-w-xl space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
      <div>
        <h3 className="text-lg font-bold text-white">Shipping &amp; handling</h3>
        <p className="mt-1 text-sm text-slate-400">
          Controls the line under each product price (e.g. &quot;+ shipping &amp; handling&quot;) and fees added at checkout when customers choose mail delivery.
        </p>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Shipping ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
                className="border-slate-600 bg-slate-900 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Handling ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={handling}
                onChange={(e) => setHandling(e.target.value)}
                className="border-slate-600 bg-slate-900 text-white"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Tax rate (decimal)</Label>
            <Input
              type="number"
              min={0}
              step="0.001"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="border-slate-600 bg-slate-900 text-white"
            />
            <p className="text-xs text-slate-500">Use 0 for no tax (Oregon). Use 0.085 for 8.5% if needed later.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Text under product price</Label>
            <Input
              value={pricePlusLabel}
              onChange={(e) => setPricePlusLabel(e.target.value)}
              placeholder="+ shipping & handling"
              className="border-slate-600 bg-slate-900 text-white"
            />
          </div>

          <div className="rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
            <p className="font-semibold text-white mb-1">Preview</p>
            <p className="text-2xl font-black text-[#7EB8E8] leading-snug">
              {formatProductPriceDisplay(25, previewConfig)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Mail delivery adds ${shippingHandlingFlatTotal(previewConfig).toFixed(2)} to the order total.
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}

          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              'Save shipping settings'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main ShopTab ─────────────────────────────────────────────────────────────

export default function ShopTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Shop</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage TOPAZ 2.0 merchandise, products, and orders.</p>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="bg-slate-800 border border-slate-700 mb-6">
          <TabsTrigger value="products" className="data-[state=active]:bg-[#2E75B6] data-[state=active]:text-white text-slate-400">
            <Package className="w-4 h-4 mr-2" /> Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-[#2E75B6] data-[state=active]:text-white text-slate-400">
            <ShoppingBag className="w-4 h-4 mr-2" /> Orders
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#2E75B6] data-[state=active]:text-white text-slate-400">
            <Settings2 className="w-4 h-4 mr-2" /> Shipping
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsSection />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersSection />
        </TabsContent>
        <TabsContent value="settings">
          <ShopFeesSettingsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
