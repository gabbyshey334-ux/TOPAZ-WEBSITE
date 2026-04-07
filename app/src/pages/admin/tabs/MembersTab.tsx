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

type Row = Database['public']['Tables']['members']['Row'];

export default function MembersTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.studio_name.toLowerCase().includes(q)
    );
  }, [rows, search]);

  async function setApproved(id: string, is_approved: boolean) {
    await supabase.from('members').update({ is_approved }).eq('id', id);
    load();
  }

  async function rejectMember(id: string) {
    if (!confirm('Reject and remove this member account from the directory? They can register again.')) return;
    await supabase.from('members').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Members</h2>
        <p className="text-sm text-slate-400">Approve new studios or revoke access.</p>
      </div>

      <Input
        placeholder="Search name, email, or studio…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm bg-slate-900 border-slate-600 text-white"
      />

      <div className="rounded-xl border border-slate-700 overflow-x-auto">
        {loading ? (
          <p className="p-8 text-slate-400">Loading…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Email</TableHead>
                <TableHead className="text-slate-300">Studio</TableHead>
                <TableHead className="text-slate-300">Joined</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="border-slate-700">
                  <TableCell className="text-white font-medium">{r.full_name}</TableCell>
                  <TableCell className="text-slate-300 text-sm">{r.email}</TableCell>
                  <TableCell className="text-slate-300">{r.studio_name}</TableCell>
                  <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {r.is_approved ? (
                      <span className="text-emerald-400">Approved</span>
                    ) : (
                      <span className="text-amber-400">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1 whitespace-nowrap">
                    {!r.is_approved ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-400"
                          onClick={() => setApproved(r.id, true)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400"
                          onClick={() => rejectMember(r.id)}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-400"
                        onClick={() => {
                          if (confirm('Revoke access for this member?')) setApproved(r.id, false);
                        }}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
