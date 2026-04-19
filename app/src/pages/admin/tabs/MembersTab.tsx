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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Download, Mail, Trash2, Users } from 'lucide-react';

type Row = Database['public']['Tables']['members']['Row'];
type MailingRow = Database['public']['Tables']['mailing_list']['Row'];

export default function MembersTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Mailing list state
  const [mailingRows, setMailingRows] = useState<MailingRow[]>([]);
  const [mailingLoading, setMailingLoading] = useState(true);
  const [mailingSearch, setMailingSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, []);

  const loadMailingList = useCallback(async () => {
    setMailingLoading(true);
    const { data } = await supabase
      .from('mailing_list')
      .select('*')
      .order('created_at', { ascending: false });
    setMailingRows((data as MailingRow[]) ?? []);
    setMailingLoading(false);
  }, []);

  useEffect(() => {
    load();
    loadMailingList();
  }, [load, loadMailingList]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.full_name ?? '').toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.studio_name ?? '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const filteredMailing = useMemo(() => {
    const q = mailingSearch.toLowerCase().trim();
    if (!q) return mailingRows;
    return mailingRows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.source ?? '').toLowerCase().includes(q)
    );
  }, [mailingRows, mailingSearch]);

  async function setApproved(id: string, is_approved: boolean) {
    await supabase.from('members').update({ is_approved }).eq('id', id);
    load();
  }

  async function rejectMember(id: string) {
    if (!confirm('Reject and remove this member account from the directory? They can register again.')) return;
    await supabase.from('members').delete().eq('id', id);
    load();
  }

  async function deleteSubscriber(id: string, email: string) {
    if (!confirm(`Remove ${email} from mailing list?`)) return;
    await supabase.from('mailing_list').delete().eq('id', id);
    loadMailingList();
  }

  function exportMailingCsv() {
    const headers = ['Name', 'Email', 'Source', 'Date Subscribed'];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rowsCsv = mailingRows.map((r) =>
      [
        r.name ?? '',
        r.email,
        r.source ?? '',
        new Date(r.created_at).toISOString(),
      ]
        .map(escape)
        .join(',')
    );
    const csv = [headers.map(escape).join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mailing-list-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Members</h2>
        <p className="text-sm text-slate-400">Approve studios or manage the public mailing list.</p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-700">
          <TabsTrigger value="members" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-300">
            <Users className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="mailing" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-300">
            <Mail className="w-4 h-4 mr-2" />
            Mailing List
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-200">
              {mailingRows.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 mt-6">
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
        </TabsContent>

        <TabsContent value="mailing" className="space-y-4 mt-6">
          {/* Stat card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <div className="flex items-center gap-3 text-slate-400 text-xs uppercase tracking-wider font-bold">
                <Mail className="w-4 h-4" />
                Total Subscribers
              </div>
              <div className="mt-2 text-3xl font-black text-white">
                {mailingLoading ? '…' : mailingRows.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Active mailing list subscribers</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <Input
              placeholder="Search email, name, or source…"
              value={mailingSearch}
              onChange={(e) => setMailingSearch(e.target.value)}
              className="max-w-sm bg-slate-900 border-slate-600 text-white"
            />
            <Button
              onClick={exportMailingCsv}
              disabled={mailingRows.length === 0}
              className="bg-[#2E75B6] hover:bg-[#1F4E78] text-white gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          <div className="rounded-xl border border-slate-700 overflow-x-auto">
            {mailingLoading ? (
              <p className="p-8 text-slate-400">Loading…</p>
            ) : filteredMailing.length === 0 ? (
              <p className="p-8 text-slate-400 text-center">
                {mailingRows.length === 0
                  ? 'No subscribers yet. Invite people to join the mailing list from the homepage.'
                  : 'No subscribers match your search.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Source</TableHead>
                    <TableHead className="text-slate-300">Date Subscribed</TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMailing.map((r) => (
                    <TableRow key={r.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {r.name ?? <span className="text-slate-500">—</span>}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">{r.email}</TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
                          {r.source ?? 'unknown'}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => deleteSubscriber(r.id, r.email)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
