import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const BUCKET = 'gallery-media';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif';

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.-]+/g, '_');
}

function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

type EventImageUploadProps = {
  eventId: string;
  eventSlug: string;
  currentUrl: string | null;
  onUrlChange: (url: string | null) => void;
};

export default function EventImageUpload({
  eventId,
  eventSlug,
  currentUrl,
  onUrlChange,
}: EventImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    const allowed =
      /^image\/(jpeg|png|webp|gif)$/i.test(file.type) ||
      /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    if (!allowed) {
      toast.error('Please use JPG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(`File is too large. Maximum size is 10 MB.`);
      return;
    }

    setUploading(true);
    setProgress(10);
    const prefix = `events/${eventId}/${sanitizeFilename(eventSlug) || 'event'}`;
    const path = `${prefix}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (upErr) {
      setUploading(false);
      setProgress(0);
      toast.error(`Upload failed: ${upErr.message}`);
      return;
    }

    setProgress(70);
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: dbErr } = await supabase
      .from('events')
      .update({ image_url: publicUrl })
      .eq('id', eventId);

    if (dbErr) {
      setUploading(false);
      setProgress(0);
      toast.error(`Could not save image: ${dbErr.message}`);
      return;
    }

    if (currentUrl) {
      const oldPath = storagePathFromPublicUrl(currentUrl, BUCKET);
      if (oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
      }
    }

    onUrlChange(publicUrl);
    setProgress(100);
    setTimeout(() => {
      setProgress(0);
      setUploading(false);
    }, 400);
    toast.success('Event image saved.');
  }

  async function handleRemove() {
    if (!currentUrl) return;
    const oldPath = storagePathFromPublicUrl(currentUrl, BUCKET);
    if (oldPath) {
      await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
    }
    const { error } = await supabase.from('events').update({ image_url: null }).eq('id', eventId);
    if (error) {
      toast.error(error.message);
      return;
    }
    onUrlChange(null);
    toast.success('Event image removed.');
  }

  return (
    <div className="space-y-3">
      <Label className="text-slate-300">Events page card image</Label>
      <p className="text-[10px] text-slate-500">
        Shown on the public Events page for this competition. Leave empty to use the site-wide fallback
        from Website Editor → Schedule.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-48 aspect-[4/3] rounded-lg border border-slate-700 bg-slate-800 overflow-hidden flex items-center justify-center">
          {currentUrl ? (
            <img src={currentUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-10 h-10 text-slate-600" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="border-slate-600 text-slate-200"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {currentUrl ? 'Replace image' : 'Upload image'}
          </Button>
          {currentUrl && (
            <Button
              type="button"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
              disabled={uploading}
              onClick={() => void handleRemove()}
            >
              Remove image
            </Button>
          )}
          {uploading && progress > 0 && <Progress value={progress} className="h-1.5 w-40" />}
        </div>
      </div>
    </div>
  );
}
