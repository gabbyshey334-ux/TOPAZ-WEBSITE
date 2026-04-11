import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { RegistrationParticipant } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PERFORMING = [
  'TAP',
  'BALLET',
  'JAZZ',
  'LYRICAL/CONTEMPORARY',
  'VOCAL',
  'ACTING',
  'HIP HOP',
] as const;

const VARIETY = [
  'VARIETY A (Song & Dance/Character/Combination of Performing Arts)',
  'VARIETY B (Dance with Prop)',
  'VARIETY C (Dance with Acrobatics)',
  'VARIETY D (Dance with Acrobatics & Prop)',
  'VARIETY E (Hip Hop)',
  'VARIETY F (Ballroom)',
  'VARIETY G (Line Dancing)',
] as const;

const SPECIAL = [
  'PRODUCTION',
  'STUDENT CHOREOGRAPHY',
  'TEACHER/STUDENT',
] as const;

const AGE_DIVISIONS = [
  '3–7 years of age',
  '8–12 years of age',
  '13–18 years of age',
  '19 years of age and up',
] as const;

const ABILITY_LEVELS = [
  'BEGINNING (Less than 2 years training)',
  'INTERMEDIATE (2–4 years of training)',
  'ADVANCED (Starting the 5th year or more of training)',
] as const;

const GROUP_SIZES = [
  'Solo (2½ min limit)',
  'Duo (2½ min limit)',
  'Trio (3 min limit)',
  'Small Group 4–10 contestants (3 min limit)',
  'Large Group 11 or more (3½ min limit)',
  'Production 10 or more (8 min limit)',
] as const;

const PAYMENT_METHODS = ['Check', 'Money Order'] as const;

function needsParticipantTable(groupSize: string): boolean {
  return !groupSize.startsWith('Solo');
}

function defaultParticipantCount(groupSize: string): number {
  if (groupSize.startsWith('Solo')) return 1;
  if (groupSize.startsWith('Duo')) return 2;
  if (groupSize.startsWith('Trio')) return 3;
  if (groupSize.startsWith('Small Group')) return 4;
  if (groupSize.startsWith('Large Group')) return 11;
  if (groupSize.startsWith('Production')) return 10;
  return 1;
}

function minParticipants(groupSize: string): number {
  return defaultParticipantCount(groupSize);
}

function maxParticipants(groupSize: string): number | null {
  if (groupSize.startsWith('Solo')) return 1;
  if (groupSize.startsWith('Duo')) return 2;
  if (groupSize.startsWith('Trio')) return 3;
  if (groupSize.startsWith('Small Group')) return 10;
  if (groupSize.startsWith('Large Group')) return null;
  if (groupSize.startsWith('Production')) return null;
  return null;
}

function computeFee(groupSize: string, count: number): number {
  if (groupSize.startsWith('Solo')) return 100;
  if (groupSize.startsWith('Duo')) return 80 * count;
  if (groupSize.startsWith('Trio')) return 70 * count;
  return 60 * count;
}

function emptyParticipant(): RegistrationParticipant {
  return { name: '', age: '', signature_confirmed: false };
}

export default function CompetitionRegistrationForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    contestant_name: string;
    category: string;
    total_fee: number;
  } | null>(null);

  const [contestantName, setContestantName] = useState('');
  const [age, setAge] = useState('');
  const [studioName, setStudioName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [routineName, setRoutineName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [yearsTraining, setYearsTraining] = useState('');
  const [soloistAddress, setSoloistAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [studioAddress, setStudioAddress] = useState('');
  const [studioCity, setStudioCity] = useState('');
  const [studioState, setStudioState] = useState('');
  const [studioZip, setStudioZip] = useState('');

  const [category, setCategory] = useState('');
  const [ageDivision, setAgeDivision] = useState('');
  const [abilityLevel, setAbilityLevel] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [participants, setParticipants] = useState<RegistrationParticipant[]>([emptyParticipant()]);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const countForFee = useMemo(() => {
    if (!groupSize || !needsParticipantTable(groupSize)) return 1;
    return Math.max(minParticipants(groupSize), participants.length);
  }, [groupSize, participants]);

  const totalFee = useMemo(() => {
    if (!groupSize) return 0;
    return computeFee(groupSize, countForFee);
  }, [groupSize, countForFee]);

  const feeBreakdown = useMemo(() => {
    if (!groupSize) return '';
    const n = countForFee;
    if (groupSize.startsWith('Solo')) return `Solo entry: $100`;
    if (groupSize.startsWith('Duo')) return `Duo: $80 × ${n} = $${80 * n}`;
    if (groupSize.startsWith('Trio')) return `Trio: $70 × ${n} = $${70 * n}`;
    return `Group / Production: $60 × ${n} = $${60 * n}`;
  }, [groupSize, countForFee]);

  function syncParticipantsToGroupSize(gs: string) {
    const n = defaultParticipantCount(gs);
    if (needsParticipantTable(gs)) {
      setParticipants(Array.from({ length: n }, () => emptyParticipant()));
    } else {
      setParticipants([emptyParticipant()]);
    }
  }

  function validateStep(s: number): string | null {
    if (s === 1) {
      if (!contestantName.trim()) return 'Contestant name is required.';
      if (!age.trim()) return 'Age is required.';
      if (!studioName.trim()) return 'Studio name is required.';
      if (!teacherName.trim()) return 'Teacher name is required.';
      if (!routineName.trim()) return 'Routine name is required.';
      if (!phone.trim()) return 'Phone is required.';
      if (!email.trim()) return 'Email is required.';
      if (!yearsTraining.trim()) return 'Years of training is required.';
    }
    if (s === 2 && !category) return 'Select one category.';
    if (s === 3) {
      if (!ageDivision) return 'Select an age division.';
      if (!abilityLevel) return 'Select an ability level.';
      if (!groupSize) return 'Select group size.';
    }
    if (s === 4) {
      if (!paymentMethod) return 'Select a payment method.';
      if (needsParticipantTable(groupSize)) {
        const min = minParticipants(groupSize);
        const max = maxParticipants(groupSize);
        if (participants.length < min) return `Add at least ${min} participants.`;
        if (max != null && participants.length > max) {
          return `This entry type allows at most ${max} participant${max === 1 ? '' : 's'}.`;
        }
        for (let i = 0; i < participants.length; i++) {
          const p = participants[i];
          if (!p.name.trim() || !p.age.trim()) return `Participant ${i + 1}: name and age are required.`;
          if (!p.signature_confirmed) return `Participant ${i + 1}: signature confirmation is required.`;
        }
      }
    }
    if (s === 5 && !disclaimerAccepted) return 'You must agree to the disclaimer.';
    return null;
  }

  function next() {
    const err = validateStep(step);
    setError(err);
    if (err) return;
    setStep((x) => Math.min(5, x + 1));
  }

  function back() {
    setError(null);
    setStep((x) => Math.max(1, x - 1));
  }

  async function submit() {
    const err = validateStep(5);
    setError(err);
    if (err) return;
    setSubmitting(true);

    const n = needsParticipantTable(groupSize) ? Math.max(minParticipants(groupSize), participants.length) : 1;
    const max = maxParticipants(groupSize);
    if (max != null && n > max) {
      setError(`This entry type allows at most ${max} participants.`);
      setSubmitting(false);
      return;
    }
    const fee = computeFee(groupSize, n);

    const row = {
      status: 'pending',
      contestant_name: contestantName.trim(),
      age: age.trim(),
      studio_name: studioName.trim(),
      teacher_name: teacherName.trim(),
      routine_name: routineName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      years_of_training: yearsTraining.trim(),
      soloist_address: soloistAddress.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      zip: zip.trim() || null,
      studio_address: studioAddress.trim() || null,
      studio_city: studioCity.trim() || null,
      studio_state: studioState.trim() || null,
      studio_zip: studioZip.trim() || null,
      category,
      age_division: ageDivision,
      ability_level: abilityLevel,
      group_size: groupSize,
      contestant_count: n,
      total_fee: fee,
      payment_method: paymentMethod,
      participants_json: needsParticipantTable(groupSize) ? participants : null,
      disclaimer_accepted: true,
    };

    const { error: insErr } = await supabase.from('registrations').insert(row);
    setSubmitting(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }

    setSuccess({ contestant_name: contestantName.trim(), category, total_fee: fee });

    void (async () => {
      try {
        const { error: fnErr } = await supabase.functions.invoke('send-registration-confirmation', {
          body: {
            to: row.email,
            contestant_name: row.contestant_name,
            category: row.category,
            total_fee: fee,
          },
        });
        if (fnErr) throw fnErr;
      } catch {
        const subject = encodeURIComponent(`TOPAZ 2.0 — Registration confirmation for ${row.contestant_name}`);
        const bodyText = encodeURIComponent(
          `This is a copy of your registration summary.\n\nContestant: ${row.contestant_name}\nCategory: ${row.category}\nTotal fee: $${fee.toFixed(2)}\nPayment: ${row.payment_method}\n\nPlease complete payment and mail your entry per the instructions on the form.\n\nTOPAZ 2.0`
        );
        window.open(`mailto:topaz2.0@yahoo.com?subject=${subject}&body=${bodyText}`, '_blank');
      }
    })();
  }

  if (success) {
    return (
      <Card className="max-w-xl mx-auto border-emerald-200 bg-emerald-50/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-6 h-6" />
            Registration received
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-emerald-900">
          <p>
            Thank you, <strong>{success.contestant_name}</strong>. Your entry for{' '}
            <strong>{success.category}</strong> has been submitted. Total fee:{' '}
            <strong>${success.total_fee.toFixed(2)}</strong>.
          </p>
          <p className="text-sm">Please check your email for confirmation.</p>
          <Button asChild variant="outline" className="border-emerald-700 text-emerald-900">
            <Link to="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs',
                step === n ? 'bg-[#2E75B6] text-white' : 'bg-gray-200 text-gray-600'
              )}
            >
              {n}
            </span>
            {n < 5 ? <span className="hidden sm:inline w-6 h-px bg-gray-300" /> : null}
          </div>
        ))}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 — Personal information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Contestant name *</Label>
              <Input value={contestantName} onChange={(e) => setContestantName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Age as of competition date *</Label>
              <Input value={age} onChange={(e) => setAge(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Studio name *</Label>
              <Input value={studioName} onChange={(e) => setStudioName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Teacher name *</Label>
              <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Name of routine — for duo/trio/group list names on back *</Label>
              <Input value={routineName} onChange={(e) => setRoutineName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Years of training *</Label>
              <Input value={yearsTraining} onChange={(e) => setYearsTraining(e.target.value)} className="mt-1" />
            </div>
            <p className="sm:col-span-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Address only required for certain competitions (optional below).
            </p>
            <div className="sm:col-span-2">
              <Label>Soloist address</Label>
              <Input value={soloistAddress} onChange={(e) => setSoloistAddress(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>State</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Zip</Label>
              <Input value={zip} onChange={(e) => setZip(e.target.value)} className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Studio address</Label>
              <Input value={studioAddress} onChange={(e) => setStudioAddress(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Studio city</Label>
              <Input value={studioCity} onChange={(e) => setStudioCity(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Studio state</Label>
              <Input value={studioState} onChange={(e) => setStudioState(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Studio zip</Label>
              <Input value={studioZip} onChange={(e) => setStudioZip(e.target.value)} className="mt-1" />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2 — Category selection</CardTitle>
            <p className="text-sm text-gray-600 font-normal">Select 1 category per entry form.</p>
          </CardHeader>
          <CardContent>
            <RadioGroup value={category} onValueChange={setCategory} className="space-y-8">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide text-[#2E75B6] mb-3">Performing Arts</h4>
                <div className="space-y-2">
                  {PERFORMING.map((c) => (
                    <label key={c} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value={c} id={`cat-${c}`} />
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide text-[#2E75B6] mb-3">Variety Arts</h4>
                <div className="space-y-2">
                  {VARIETY.map((c) => (
                    <label key={c} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value={c} id={`cat-${c.slice(0, 20)}`} className="mt-1" />
                      <span className="text-sm leading-snug">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide text-[#2E75B6] mb-3">
                  Special Categories (not eligible for high scoring awards)
                </h4>
                <div className="space-y-2">
                  {SPECIAL.map((c) => (
                    <label key={c} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value={c} id={`cat-${c}`} />
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3 — Division &amp; level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <p className="text-sm text-gray-600 mb-3">Age division — duo, trio, and group ages are to be averaged.</p>
              <RadioGroup value={ageDivision} onValueChange={setAgeDivision} className="space-y-2">
                {AGE_DIVISIONS.map((d) => (
                  <label key={d} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value={d} />
                    <span className="text-sm">{d}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div>
              <h4 className="font-bold mb-3">Ability level</h4>
              <RadioGroup value={abilityLevel} onValueChange={setAbilityLevel} className="space-y-2">
                {ABILITY_LEVELS.map((d) => (
                  <label key={d} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value={d} className="mt-1" />
                    <span className="text-sm leading-snug">{d}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div>
              <h4 className="font-bold mb-3">Group size &amp; time limits</h4>
              <RadioGroup
                value={groupSize}
                onValueChange={(v) => {
                  setGroupSize(v);
                  syncParticipantsToGroupSize(v);
                }}
                className="space-y-2"
              >
                {GROUP_SIZES.map((d) => (
                  <label key={d} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value={d} className="mt-1" />
                    <span className="text-sm leading-snug">{d}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4 — Entry fees &amp; payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="font-bold text-[#1F4E78]">Fee calculation</p>
              <p className="text-sm text-gray-700 mt-2">{feeBreakdown || 'Select group size in step 3.'}</p>
              <p className="text-2xl font-black text-[#2E75B6] mt-2">${totalFee.toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-2">
                Solo $100 · Duo $80 per person · Trio $70 per person · Groups $60 per person
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3">Payment method</h4>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                {PAYMENT_METHODS.map((p) => (
                  <label key={p} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value={p} />
                    <span className="text-sm">{p}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="text-sm text-gray-700 bg-gray-50 border rounded-lg p-4">
              Make checks payable to <strong>Topaz Productions</strong>. Mail all entries to{' '}
              <strong>TOPAZ 2.0, PO BOX 131, BANKS OR 97106</strong>. All entries must be postmarked by the closing
              date.
            </div>

            {needsParticipantTable(groupSize) && (
              <div>
                <h4 className="font-bold mb-2">Participants</h4>
                <p className="text-sm text-gray-600 mb-4">Add each contestant&apos;s name, age, and signature confirmation.</p>
                <div className="space-y-4">
                  {participants.map((p, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">Participant {i + 1}</span>
                        {participants.length > minParticipants(groupSize) ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => setParticipants((prev) => prev.filter((_, j) => j !== i))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : null}
                      </div>
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={p.name}
                          onChange={(e) =>
                            setParticipants((prev) =>
                              prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input
                          value={p.age}
                          onChange={(e) =>
                            setParticipants((prev) =>
                              prev.map((x, j) => (j === i ? { ...x, age: e.target.value } : x))
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={p.signature_confirmed}
                          onCheckedChange={(v) =>
                            setParticipants((prev) =>
                              prev.map((x, j) =>
                                j === i ? { ...x, signature_confirmed: v === true } : x
                              )
                            )
                          }
                        />
                        Parent or teacher signature confirmed
                      </label>
                    </div>
                  ))}
                </div>
                {(() => {
                  const cap = maxParticipants(groupSize);
                  if (cap != null && participants.length >= cap) return null;
                  return (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => setParticipants((prev) => [...prev, emptyParticipant()])}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add participant
                    </Button>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5 — Review &amp; submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div className="grid sm:grid-cols-2 gap-3 border rounded-lg p-4 bg-gray-50">
              <div><span className="text-gray-500">Contestant</span><br /><strong>{contestantName}</strong></div>
              <div><span className="text-gray-500">Age</span><br /><strong>{age}</strong></div>
              <div><span className="text-gray-500">Studio</span><br /><strong>{studioName}</strong></div>
              <div><span className="text-gray-500">Teacher</span><br /><strong>{teacherName}</strong></div>
              <div className="sm:col-span-2"><span className="text-gray-500">Routine</span><br /><strong>{routineName}</strong></div>
              <div><span className="text-gray-500">Phone</span><br /><strong>{phone}</strong></div>
              <div><span className="text-gray-500">Email</span><br /><strong>{email}</strong></div>
              <div className="sm:col-span-2"><span className="text-gray-500">Years of training</span><br /><strong>{yearsTraining}</strong></div>
              <div className="sm:col-span-2"><span className="text-gray-500">Category</span><br /><strong>{category}</strong></div>
              <div><span className="text-gray-500">Age division</span><br /><strong>{ageDivision}</strong></div>
              <div><span className="text-gray-500">Ability</span><br /><strong>{abilityLevel}</strong></div>
              <div className="sm:col-span-2"><span className="text-gray-500">Group size</span><br /><strong>{groupSize}</strong></div>
              <div><span className="text-gray-500">Total fee</span><br /><strong>${totalFee.toFixed(2)}</strong></div>
              <div><span className="text-gray-500">Payment</span><br /><strong>{paymentMethod}</strong></div>
            </div>

            {needsParticipantTable(groupSize) && participants.length > 0 ? (
              <div>
                <h4 className="font-bold mb-2">Participants</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {participants.map((p, i) => (
                    <li key={i}>
                      {p.name}, age {p.age}
                      {p.signature_confirmed ? ' — signature confirmed' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-gray-800">
              <p className="font-semibold text-amber-900 mb-2">Disclaimer</p>
              <p className="leading-relaxed">
                TOPAZ, its owners, workers, or anyone associated with its organization will not be held responsible for
                the lost or damage of any property, whether the result of accident or other causes, and in addition
                assumes no responsibility for any loss, damage, or injury sustained by any contestant, parent, teacher
                or spectator, during the time of the competition.
              </p>
            </div>

            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 text-gray-800">
              <p className="font-semibold text-[#1F4E78] mb-2">Music reminder</p>
              <p className="leading-relaxed">
                Each competition number requires a separate USB. Turn in music to the front desk one hour prior to
                competition time. TOPAZ is not responsible for damaged or lost USBs.
              </p>
            </div>

            <label className="flex items-start gap-3">
              <Checkbox checked={disclaimerAccepted} onCheckedChange={(v) => setDisclaimerAccepted(v === true)} />
              <span>I have read and agree to the disclaimer above.</span>
            </label>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={back} disabled={step === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        {step < 5 ? (
          <Button type="button" className="bg-[#2E75B6] hover:bg-[#1F4E78]" onClick={next}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button type="button" className="bg-[#2E75B6] hover:bg-[#1F4E78]" disabled={submitting} onClick={submit}>
            {submitting ? 'Submitting…' : 'Submit registration'}
          </Button>
        )}
      </div>
    </div>
  );
}
