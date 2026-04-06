import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
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

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setApproved(id: string, is_approved: boolean) {
    await supabase.from('members').update({ is_approved }).eq('id', id);
    load();
  }

  async function rejectMember(id: string) {
    if (!confirm('Reject this member? Their account will stay in Auth but they will not be able to access the members area until they register again.')) return;
    await supabase.from('members').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Members</h1>
        <p className="text-sm text-white/50 mt-1">Approve or reject studio teacher and dancer accounts.</p>
      </div>

      <div className="rounded-xl border border-white/10 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/70">Name</TableHead>
              <TableHead className="text-white/70">Email</TableHead>
              <TableHead className="text-white/70">Studio</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-white/50">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-white/50">
                  No members yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((m) => (
                <TableRow key={m.id} className="border-white/10">
                  <TableCell className="text-white">{m.full_name || '—'}</TableCell>
                  <TableCell className="text-white/80 text-sm">{m.email}</TableCell>
                  <TableCell className="text-white/80 text-sm">{m.studio_name || '—'}</TableCell>
                  <TableCell className="text-white/80 text-sm">
                    {m.is_approved ? (
                      <span className="text-green-400">Approved</span>
                    ) : (
                      <span className="text-amber-400">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!m.is_approved ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-700 hover:bg-green-600"
                          onClick={() => setApproved(m.id, true)}
                        >
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-400 text-red-400" onClick={() => rejectMember(m.id)}>
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" className="text-white/60" onClick={() => setApproved(m.id, false)}>
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
