import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trash2,
  Plus,
  Megaphone,
  Quote,
  Users,
  ChevronUp,
  ChevronDown,
  Loader2,
  Upload,
  Eye,
  EyeOff,
  Edit2,
} from 'lucide-react';

type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];
type TestimonialRow = Database['public']['Tables']['testimonials']['Row'];
type InstructorRow = Database['public']['Tables']['instructors']['Row'];

export default function AnnouncementsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Content</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Announcements, testimonials, and instructors shown across the site.
        </p>
      </div>

      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-700 h-10">
          <TabsTrigger
            value="announcements"
            className="data-[state=active]:bg-[#2E75B6] data-[state=active]:text-white"
          >
            <Megaphone className="w-3.5 h-3.5 mr-1.5" />
            Announcements
          </TabsTrigger>
          <TabsTrigger
            value="testimonials"
            className="data-[state=active]:bg-[#2E75B6] data-[state=active]:text-white"
          >
            <Quote className="w-3.5 h-3.5 mr-1.5" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger
            value="instructors"
            className="data-[state=active]:bg-[#2E75B6] data-[state=active]:text-white"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Judges & Classes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-6">
          <AnnouncementsSection />
        </TabsContent>
        <TabsContent value="testimonials" className="mt-6">
          <TestimonialsSection />
        </TabsContent>
        <TabsContent value="instructors" className="mt-6">
          <InstructorsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Announcements ────────────────────────────────────────────────────────────
function AnnouncementsSection() {
  const [rows, setRows] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setRows((data as AnnouncementRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('announcements').insert({
      title: title.trim(),
      body: body.trim(),
      is_active: true,
    });
    setSaving(false);
    if (error) alert(error.message);
    else {
      setOpen(false);
      setTitle('');
      setBody('');
      load();
    }
  }

  async function toggleActive(id: string, is_active: boolean) {
    await supabase.from('announcements').update({ is_active }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-slate-400">
          Visible to approved members in the members area.
        </p>
        <Button className="bg-[#2E75B6] hover:bg-[#1F4E78]" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-950 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Body</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2E75B6]" disabled={saving} onClick={add}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500 text-sm py-10 text-center border border-dashed border-slate-700 rounded-xl">
          No announcements yet.
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 flex flex-col lg:flex-row lg:items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg">{r.title}</h3>
                <p className="text-slate-300 text-sm mt-2 whitespace-pre-wrap">{r.body}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-400">Active</span>
                <Switch checked={r.is_active} onCheckedChange={(v) => toggleActive(r.id, v)} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                  onClick={() => remove(r.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [content, setContent] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    setRows((data as TestimonialRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setEditing(null);
    setAuthorName('');
    setAuthorRole('');
    setContent('');
    setIsVisible(true);
  }

  function openAdd() {
    resetForm();
    setOpen(true);
  }

  function openEdit(row: TestimonialRow) {
    setEditing(row);
    setAuthorName(row.author_name);
    setAuthorRole(row.author_role ?? '');
    setContent(row.content);
    setIsVisible(row.is_visible);
    setOpen(true);
  }

  async function save() {
    if (!authorName.trim() || !content.trim()) {
      alert('Author name and quote are required.');
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from('testimonials')
        .update({
          author_name: authorName.trim(),
          author_role: authorRole.trim() || null,
          content: content.trim(),
          is_visible: isVisible,
        })
        .eq('id', editing.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('testimonials').insert({
        author_name: authorName.trim(),
        author_role: authorRole.trim() || null,
        content: content.trim(),
        is_visible: isVisible,
        display_order: rows.length,
      });
      if (error) alert(error.message);
    }
    setSaving(false);
    setOpen(false);
    resetForm();
    load();
  }

  async function toggleVisible(id: string, v: boolean) {
    await supabase.from('testimonials').update({ is_visible: v }).eq('id', id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_visible: v } : r)));
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete testimonial from ${name}?`)) return;
    await supabase.from('testimonials').delete().eq('id', id);
    load();
  }

  async function move(id: string, dir: 'up' | 'down') {
    const idx = rows.findIndex((r) => r.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === rows.length - 1) return;
    const next = [...rows];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setRows(next);
    setReordering(true);
    await Promise.all(
      next.map((row, i) =>
        supabase.from('testimonials').update({ display_order: i }).eq('id', row.id)
      )
    );
    setReordering(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-slate-400">
          Shown on the public homepage. Toggle visibility to hide without deleting.
        </p>
        <Button className="bg-[#2E75B6] hover:bg-[#1F4E78]" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="bg-slate-950 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit testimonial' : 'New testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300">Author Name</Label>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white"
                placeholder="Sarah Mitchell"
              />
            </div>
            <div>
              <Label className="text-slate-300">Role (optional)</Label>
              <Input
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white"
                placeholder="Dance Studio Owner"
              />
            </div>
            <div>
              <Label className="text-slate-300">Quote</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white min-h-[120px]"
                placeholder="What they had to say…"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isVisible} onCheckedChange={setIsVisible} />
              <div>
                <p className="text-sm text-white font-medium">Show on public website</p>
                <p className="text-xs text-slate-500">Off hides from the homepage</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2E75B6]" disabled={saving} onClick={save}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500 text-sm py-10 text-center border border-dashed border-slate-700 rounded-xl">
          No testimonials yet. Add your first quote to show it on the homepage.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, idx) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-700 bg-slate-900/50 p-5 flex flex-col lg:flex-row lg:items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                  &ldquo;{r.content}&rdquo;
                </p>
                <p className="mt-3 text-sm font-bold text-[#7EB8E8]">
                  {r.author_name}
                  {r.author_role && <span className="text-slate-400 font-normal"> · {r.author_role}</span>}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleVisible(r.id, !r.is_visible)}
                  className={`p-1.5 rounded transition-colors ${
                    r.is_visible
                      ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                  }`}
                  title={r.is_visible ? 'Visible — click to hide' : 'Hidden — click to show'}
                >
                  {r.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => move(r.id, 'up')}
                  disabled={idx === 0 || reordering}
                  className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                  title="Move up"
                >
                  {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => move(r.id, 'down')}
                  disabled={idx === rows.length - 1 || reordering}
                  className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                  title="Move down"
                >
                  {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300"
                  onClick={() => openEdit(r)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                  onClick={() => remove(r.id, r.author_name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Instructors (Judges & Masterclass) ───────────────────────────────────────
function InstructorsSection() {
  const [rows, setRows] = useState<InstructorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'judge' | 'masterclass'>('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InstructorRow | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [type, setType] = useState<'judge' | 'masterclass'>('judge');
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('instructors')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    setRows((data as InstructorRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setEditing(null);
    setName('');
    setTitle('');
    setBio('');
    setPhotoUrl(null);
    setType('judge');
    setIsVisible(true);
  }

  function openAdd() {
    resetForm();
    setOpen(true);
  }

  function openEdit(row: InstructorRow) {
    setEditing(row);
    setName(row.name);
    setTitle(row.title ?? '');
    setBio(row.bio ?? '');
    setPhotoUrl(row.photo_url);
    setType(row.type);
    setIsVisible(row.is_visible);
    setOpen(true);
  }

  async function onUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    setUploading(true);
    const path = `instructors/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
    const { error: upErr } = await supabase.storage
      .from('gallery')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (upErr) {
      alert(`Photo upload failed: ${upErr.message}`);
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
    setPhotoUrl(publicUrl);
    setUploading(false);
  }

  async function save() {
    if (!name.trim()) {
      alert('Name is required.');
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from('instructors')
        .update({
          name: name.trim(),
          title: title.trim() || null,
          bio: bio.trim() || null,
          photo_url: photoUrl,
          type,
          is_visible: isVisible,
        })
        .eq('id', editing.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('instructors').insert({
        name: name.trim(),
        title: title.trim() || null,
        bio: bio.trim() || null,
        photo_url: photoUrl,
        type,
        is_visible: isVisible,
        display_order: rows.filter((r) => r.type === type).length,
      });
      if (error) alert(error.message);
    }
    setSaving(false);
    setOpen(false);
    resetForm();
    load();
  }

  async function toggleVisible(id: string, v: boolean) {
    await supabase.from('instructors').update({ is_visible: v }).eq('id', id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_visible: v } : r)));
  }

  async function remove(id: string, n: string) {
    if (!confirm(`Remove ${n}?`)) return;
    await supabase.from('instructors').delete().eq('id', id);
    load();
  }

  async function move(id: string, dir: 'up' | 'down') {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const typeRows = rows.filter((r) => r.type === row.type);
    const idx = typeRows.findIndex((r) => r.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === typeRows.length - 1) return;
    const nextType = [...typeRows];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [nextType[idx], nextType[swapIdx]] = [nextType[swapIdx], nextType[idx]];
    setReordering(true);
    await Promise.all(
      nextType.map((r, i) =>
        supabase.from('instructors').update({ display_order: i }).eq('id', r.id)
      )
    );
    setReordering(false);
    load();
  }

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-slate-400">
          Shown on the homepage under Master Classes and Panel &amp; Judges.
        </p>
        <Button className="bg-[#2E75B6] hover:bg-[#1F4E78]" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Person
        </Button>
      </div>

      <div className="flex gap-2">
        {([
          { id: 'all', label: 'All' },
          { id: 'judge', label: 'Judges' },
          { id: 'masterclass', label: 'Masterclass' },
        ] as const).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
              filter === f.id
                ? 'bg-[#2E75B6] text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="bg-slate-950 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit person' : 'Add person'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white"
                placeholder="Jane Smith"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Title (optional)</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 bg-slate-900 border-slate-600 text-white"
                  placeholder="Head Judge"
                />
              </div>
              <div>
                <Label className="text-slate-300">Type</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'judge' | 'masterclass')}
                  className="mt-1 w-full h-10 rounded-md bg-slate-900 border border-slate-600 text-white px-3 text-sm"
                >
                  <option value="judge">Judge</option>
                  <option value="masterclass">Masterclass Instructor</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Bio (optional)</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-600 text-white min-h-[100px]"
                placeholder="Short background or credentials…"
              />
            </div>
            <div>
              <Label className="text-slate-300">Photo (optional)</Label>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onUploadPhoto}
              />
              <div className="mt-1 flex items-center gap-3">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 text-xs font-medium"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> {photoUrl ? 'Replace photo' : 'Upload photo'}
                    </>
                  )}
                </button>
                {photoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400"
                    onClick={() => setPhotoUrl(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isVisible} onCheckedChange={setIsVisible} />
              <div>
                <p className="text-sm text-white font-medium">Show on public website</p>
                <p className="text-xs text-slate-500">Off hides from the homepage</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2E75B6]" disabled={saving} onClick={save}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500 text-sm py-10 text-center border border-dashed border-slate-700 rounded-xl">
          {filter === 'all' ? 'No judges or masterclass instructors yet.' : `No ${filter === 'judge' ? 'judges' : 'masterclass instructors'} yet.`}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((r) => {
            const typeRows = rows.filter((x) => x.type === r.type);
            const idx = typeRows.findIndex((x) => x.id === r.id);
            return (
              <div
                key={r.id}
                className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 flex items-start gap-3"
              >
                {r.photo_url ? (
                  <img
                    src={r.photo_url}
                    alt={r.name}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white truncate">{r.name}</p>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        r.type === 'judge'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-violet-500/10 text-violet-300 border border-violet-500/30'
                      }`}
                    >
                      {r.type === 'judge' ? 'Judge' : 'Masterclass'}
                    </span>
                  </div>
                  {r.title && <p className="text-xs text-[#7EB8E8] mt-0.5">{r.title}</p>}
                  {r.bio && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.bio}</p>}
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      type="button"
                      onClick={() => toggleVisible(r.id, !r.is_visible)}
                      className={`p-1.5 rounded transition-colors ${
                        r.is_visible
                          ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                      }`}
                      title={r.is_visible ? 'Visible — click to hide' : 'Hidden — click to show'}
                    >
                      {r.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => move(r.id, 'up')}
                      disabled={idx === 0 || reordering}
                      className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => move(r.id, 'down')}
                      disabled={idx === typeRows.length - 1 || reordering}
                      className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <Button variant="ghost" size="sm" className="text-slate-300" onClick={() => openEdit(r)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => remove(r.id, r.name)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
