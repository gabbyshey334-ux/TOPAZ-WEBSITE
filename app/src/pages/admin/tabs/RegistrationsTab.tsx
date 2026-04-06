import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Eye, Trash2 } from 'lucide-react';

type Row = Database['public']['Tables']['registrations']['Row'];

export default function RegistrationsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [detail, setDetail] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
    if (!error && data) setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const s = new Set(rows.map((r) => r.category));
    return ['all', ...Array.from(s).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.contestant_name.toLowerCase().includes(q) ||
        r.studio_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
      const matchAge = ageFilter === 'all' || r.age_division === ageFilter;
      return matchSearch && matchStatus && matchCat && matchAge;
    });
  }, [rows, search, statusFilter, categoryFilter, ageFilter]);

  async function setStatus(id: string, status: string) {
    await supabase.from('registrations').update({ status }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this registration permanently?')) return;
    await supabase.from('registrations').delete().eq('id', id);
    load();
    setDetail(null);
  }

  function exportCsv() {
    const list = filtered.length ? filtered : rows;
    if (!list.length) return;
    const keys = Object.keys(list[0]) as (keyof Row)[];
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const header = keys.join(',');
    const lines = list.map((r) => keys.map((k) => esc(r[k])).join(','));
    const blob = new Blob([header + '\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `topaz-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Registrations</h1>
        <p className="text-sm text-white/50 mt-1">Review, approve, and export competition entries.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-white/50 block mb-1">Search</label>
          <Input
            placeholder="Name, studio, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">Category</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === 'all' ? 'All' : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">Age division</label>
          <Select value={ageFilter} onValueChange={setAgeFilter}>
            <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="3–7 years of age">3–7</SelectItem>
              <SelectItem value="8–12 years of age">8–12</SelectItem>
              <SelectItem value="13–18 years of age">13–18</SelectItem>
              <SelectItem value="19 years of age and up">19+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCsv} className="bg-[#2E75B6] hover:bg-[#1F4E78]">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/70">Contestant</TableHead>
              <TableHead className="text-white/70">Studio</TableHead>
              <TableHead className="text-white/70">Category</TableHead>
              <TableHead className="text-white/70">Age div.</TableHead>
              <TableHead className="text-white/70">Ability</TableHead>
              <TableHead className="text-white/70">Group</TableHead>
              <TableHead className="text-white/70">Fee</TableHead>
              <TableHead className="text-white/70">Pay</TableHead>
              <TableHead className="text-white/70">Submitted</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-white/50">
                  Loading…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-white/50">
                  No registrations match.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} className="border-white/10">
                  <TableCell className="text-white font-medium">{r.contestant_name}</TableCell>
                  <TableCell className="text-white/80 text-sm">{r.studio_name}</TableCell>
                  <TableCell className="text-white/80 text-xs max-w-[140px] truncate">{r.category}</TableCell>
                  <TableCell className="text-white/80 text-xs">{r.age_division}</TableCell>
                  <TableCell className="text-white/80 text-xs max-w-[120px] truncate">{r.ability_level}</TableCell>
                  <TableCell className="text-white/80 text-xs max-w-[120px] truncate">{r.group_size}</TableCell>
                  <TableCell className="text-white/80">${Number(r.total_fee).toFixed(2)}</TableCell>
                  <TableCell className="text-white/80 text-xs">{r.payment_method}</TableCell>
                  <TableCell className="text-white/60 text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}>
                      <SelectTrigger className="h-8 w-[110px] bg-white/5 border-white/10 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right space-x-1 whitespace-nowrap">
                    <Button size="sm" variant="ghost" className="text-white" onClick={() => setDetail(r)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-400"
                      onClick={() => setStatus(r.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400" onClick={() => remove(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-slate-900 text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Registration details</DialogTitle>
          </DialogHeader>
          {detail ? (
            <pre className="text-xs text-white/80 whitespace-pre-wrap break-words">
              {JSON.stringify(detail, null, 2)}
            </pre>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
