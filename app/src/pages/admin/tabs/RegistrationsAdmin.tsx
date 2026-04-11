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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Eye, Trash2 } from 'lucide-react';

type RegRow = Database['public']['Tables']['registrations']['Row'];

export default function RegistrationsAdmin() {
  const [rows, setRows] = useState<RegRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [detail, setDetail] = useState<RegRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setRows(data as RegRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const s = new Set(rows.map((r) => r.category));
    return ['all', ...Array.from(s).sort()];
  }, [rows]);

  const ageDivisions = useMemo(() => {
    const s = new Set(rows.map((r) => r.age_division));
    return ['all', ...Array.from(s).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.toLowerCase();
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
  }

  function exportCsv() {
    const cols = [
      'id',
      'created_at',
      'contestant_name',
      'age',
      'studio_name',
      'teacher_name',
      'routine_name',
      'email',
      'phone',
      'category',
      'age_division',
      'ability_level',
      'group_size',
      'contestant_count',
      'total_fee',
      'payment_method',
      'status',
    ] as const;
    const esc = (v: unknown) => {
      const s = v == null ? '' : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [
      cols.join(','),
      ...filtered.map((r) => cols.map((c) => esc(r[c])).join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `topaz-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Registrations</h2>
          <p className="text-sm text-slate-400">Review, approve, and export competition entries.</p>
        </div>
        <Button
          variant="outline"
          className="border-slate-600 text-white hover:bg-slate-800"
          onClick={exportCsv}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name, studio, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-slate-900 border-slate-600 text-white"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-slate-900 border-slate-600 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[220px] bg-slate-900 border-slate-600 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === 'all' ? 'All categories' : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ageFilter} onValueChange={setAgeFilter}>
          <SelectTrigger className="w-[220px] bg-slate-900 border-slate-600 text-white">
            <SelectValue placeholder="Age division" />
          </SelectTrigger>
          <SelectContent>
            {ageDivisions.map((c) => (
              <SelectItem key={c} value={c}>
                {c === 'all' ? 'All age divisions' : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-700 overflow-x-auto">
        {loading ? (
          <p className="p-8 text-slate-400">Loading…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Contestant</TableHead>
                <TableHead className="text-slate-300">Studio</TableHead>
                <TableHead className="text-slate-300">Category</TableHead>
                <TableHead className="text-slate-300">Age div.</TableHead>
                <TableHead className="text-slate-300">Ability</TableHead>
                <TableHead className="text-slate-300">Group</TableHead>
                <TableHead className="text-slate-300">Fee</TableHead>
                <TableHead className="text-slate-300">Pay</TableHead>
                <TableHead className="text-slate-300">Submitted</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="border-slate-700">
                  <TableCell className="text-white font-medium">{r.contestant_name}</TableCell>
                  <TableCell className="text-slate-300">{r.studio_name}</TableCell>
                  <TableCell className="text-slate-300 max-w-[140px] truncate" title={r.category}>
                    {r.category}
                  </TableCell>
                  <TableCell className="text-slate-300 text-xs max-w-[100px] truncate">
                    {r.age_division}
                  </TableCell>
                  <TableCell className="text-slate-300 text-xs max-w-[100px] truncate">
                    {r.ability_level}
                  </TableCell>
                  <TableCell className="text-slate-300 text-xs max-w-[120px] truncate">
                    {r.group_size}
                  </TableCell>
                  <TableCell className="text-slate-200">${Number(r.total_fee).toFixed(2)}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{r.payment_method}</TableCell>
                  <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}>
                      <SelectTrigger className="h-8 w-[110px] bg-slate-900 border-slate-600 text-white text-xs">
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
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-300"
                      onClick={() => setDetail(r)}
                    >
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
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400"
                      onClick={() => setStatus(r.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400"
                      onClick={() => remove(r.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Registration detail</DialogTitle>
          </DialogHeader>
          {detail ? (
            <pre className="text-xs text-slate-300 whitespace-pre-wrap">
              {JSON.stringify(detail, null, 2)}
            </pre>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
