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
import type { RegistrationParticipant } from '@/types/database';

type RegRow = Database['public']['Tables']['registrations']['Row'];

function DetailField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="border-b border-slate-800 py-2">
      <dt className="text-xs uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-200 mt-0.5 whitespace-pre-wrap">{value ?? '—'}</dd>
    </div>
  );
}

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
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.contestant_name.toLowerCase().includes(q) ||
        r.studio_name.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
      const matchAge = ageFilter === 'all' || r.age_division === ageFilter;
      return matchSearch && matchStatus && matchCat && matchAge;
    });
  }, [rows, search, statusFilter, categoryFilter, ageFilter]);

  async function setStatus(id: string, status: string) {
    await supabase.from('registrations').update({ status }).eq('id', id);
    load();
    setDetail((d) => (d && d.id === id ? { ...d, status } : d));
  }

  async function remove(id: string) {
    if (!confirm('Delete this registration permanently?')) return;
    await supabase.from('registrations').delete().eq('id', id);
    setDetail((d) => (d?.id === id ? null : d));
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
      ...rows.map((r) => cols.map((c) => esc(r[c])).join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `topaz-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const rawParts = detail?.participants;
  const participants: RegistrationParticipant[] = Array.isArray(rawParts)
    ? (rawParts as RegistrationParticipant[])
    : [];

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
          placeholder="Search contestant name or studio…"
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
                  <TableCell className="text-slate-300 text-xs capitalize">{r.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-300 h-8 px-2"
                        onClick={() => setDetail(r)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-400 h-8 px-2"
                        onClick={() => setStatus(r.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-400 h-8 px-2"
                        onClick={() => setStatus(r.id, 'rejected')}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 h-8 px-2"
                        onClick={() => remove(r.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Registration details</DialogTitle>
          </DialogHeader>
          {detail ? (
            <div className="space-y-4 text-sm">
              <dl className="grid gap-0">
                <DetailField label="Contestant name" value={detail.contestant_name} />
                <DetailField label="Age (as of competition)" value={detail.age} />
                <DetailField label="Studio" value={detail.studio_name} />
                <DetailField label="Teacher" value={detail.teacher_name} />
                <DetailField label="Routine / names on back" value={detail.routine_name} />
                <DetailField label="Phone" value={detail.phone} />
                <DetailField label="Email" value={detail.email} />
                <DetailField label="Years of training" value={detail.years_of_training} />
                <DetailField label="Soloist address" value={detail.soloist_address} />
                <DetailField label="City / State / Zip" value={[detail.city, detail.state, detail.zip].filter(Boolean).join(', ') || null} />
                <DetailField
                  label="Studio address"
                  value={
                    [detail.studio_address, detail.studio_city, detail.studio_state, detail.studio_zip]
                      .filter(Boolean)
                      .join(', ') || null
                  }
                />
                <DetailField label="Category" value={detail.category} />
                <DetailField label="Age division" value={detail.age_division} />
                <DetailField label="Ability level" value={detail.ability_level} />
                <DetailField label="Group size" value={detail.group_size} />
                <DetailField label="Contestant count" value={detail.contestant_count} />
                <DetailField label="Total fee" value={`$${Number(detail.total_fee).toFixed(2)}`} />
                <DetailField label="Payment method" value={detail.payment_method} />
                <DetailField label="Status" value={detail.status} />
                <DetailField label="Disclaimer accepted" value={detail.disclaimer_accepted ? 'Yes' : 'No'} />
                <DetailField label="Submitted" value={new Date(detail.created_at).toLocaleString()} />
              </dl>

              {participants.length > 0 ? (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Participants</h4>
                  <div className="rounded-lg border border-slate-800 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-900">
                        <tr>
                          <th className="text-left p-2 text-slate-400">Name</th>
                          <th className="text-left p-2 text-slate-400">Age</th>
                          <th className="text-left p-2 text-slate-400">Signature</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p, i) => (
                          <tr key={i} className="border-t border-slate-800">
                            <td className="p-2 text-slate-200">{p.name}</td>
                            <td className="p-2 text-slate-200">{p.age}</td>
                            <td className="p-2 text-slate-200">{p.signature_confirmed ? 'Yes' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setStatus(detail.id, 'approved')}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="border-amber-700 text-amber-400" onClick={() => setStatus(detail.id, 'rejected')}>
                  Reject
                </Button>
                <Button size="sm" variant="outline" className="border-red-800 text-red-400" onClick={() => remove(detail.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
