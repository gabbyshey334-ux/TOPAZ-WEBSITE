import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const PERFORMING_ARTS = [
  'TAP',
  'BALLET',
  'JAZZ',
  'LYRICAL/CONTEMPORARY',
  'VOCAL',
  'ACTING',
  'HIP HOP',
] as const;

const VARIETY_ARTS = [
  'VARIETY A (Song & Dance/Character/Combination)',
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

type GroupKey = 'solo' | 'duo' | 'trio' | 'small' | 'large' | 'production';

const GROUP_CONFIG: Record<
  GroupKey,
  { label: string; min: number; max: number }
> = {
  solo: { label: 'Solo (2½ min limit)', min: 1, max: 1 },
  duo: { label: 'Duo (2½ min limit)', min: 2, max: 2 },
  trio: { label: 'Trio (3 min limit)', min: 3, max: 3 },
  small: { label: 'Small Group 4–10 (3 min limit)', min: 4, max: 10 },
  large: { label: 'Large Group 11 or more (3½ min limit)', min: 11, max: 99 },
  production: { label: 'Production 10 or more (8 min limit)', min: 10, max: 99 },
};

const DISCLAIMER = `By submitting this registration, the undersigned acknowledges and agrees that participation in TOPAZ 2.0 events involves inherent risks including but not limited to physical injury, and releases Topaz Productions, TOPAZ 2.0, its staff, volunteers, venues, and sponsors from liability to the fullest extent permitted by law, except for gross negligence or willful misconduct.

The undersigned grants permission for photographs, video, and other media captured during the event to be used for promotional, educational, and archival purposes without compensation.

The undersigned confirms that all information provided is accurate, that they have authority to register the participant(s), and that they will comply with all competition rules, deadlines, payment requirements, and instructions provided by TOPAZ 2.0.

If the participant is a minor, the parent or legal guardian signing below attests that they have read and agree to this disclaimer on behalf of the minor.`;

type ParticipantRow = { name: string; age: string; signatureConfirmed: boolean };

function computeFee(groupKey: GroupKey, contestantCount: number): number {
  const n = Math.max(1, contestantCount);
  switch (groupKey) {
    case 'solo':
      return 100;
    case 'duo':
      return 80 * n;
    case 'trio':
      return 70 * n;
    default:
      return 60 * n;
  }
}

export default function RegistrationLiveForm() {
  const [category, setCategory] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [contestantName, setContestantName] = useState('');
  const [age, setAge] = useState('');
  const [studioName, setStudioName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [routineName, setRoutineName] = useState('');
  const [soloistAddress, setSoloistAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [yearsTraining, setYearsTraining] = useState('');
  const [studioAddress, setStudioAddress] = useState('');
  const [studioCity, setStudioCity] = useState('');
  const [studioState, setStudioState] = useState('');
  const [studioZip, setStudioZip] = useState('');

  const [ageDivision, setAgeDivision] = useState<string>(AGE_DIVISIONS[0]);
  const [abilityLevel, setAbilityLevel] = useState<string>(ABILITY_LEVELS[0]);
  const [groupKey, setGroupKey] = useState<GroupKey>('solo');
  const [groupCount, setGroupCount] = useState(4);

  const [paymentMethod, setPaymentMethod] = useState<'Check' | 'Money Order'>('Check');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const [participants, setParticipants] = useState<ParticipantRow[]>([]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const contestantCount = useMemo(() => {
    const cfg = GROUP_CONFIG[groupKey];
    if (groupKey === 'solo' || groupKey === 'duo' || groupKey === 'trio') {
      return cfg.max;
    }
    return Math.min(cfg.max, Math.max(cfg.min, groupCount));
  }, [groupKey, groupCount]);

  const totalFee = useMemo(() => computeFee(groupKey, contestantCount), [groupKey, contestantCount]);

  const needsParticipantGrid = groupKey !== 'solo';

  useEffect(() => {
    if (needsParticipantGrid) {
      const count = contestantCount;
      setParticipants((prev) => {
        const next = prev.slice(0, count);
        while (next.length < count) {
          next.push({ name: '', age: '', signatureConfirmed: false });
        }
        return next;
      });
    } else {
      setParticipants([]);
    }
  }, [groupKey, contestantCount, needsParticipantGrid]);

  function selectCategory(cat: string) {
    setCategory(cat);
    setCategoryError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setCategoryError(null);

    if (!category) {
      setCategoryError('Please select exactly one category.');
      return;
    }

    if (!disclaimerAccepted) {
      setSubmitError('You must read and agree to the disclaimer to submit.');
      return;
    }

    if (!isSupabaseConfigured) {
      setSubmitError('Registration is unavailable: Supabase is not configured.');
      return;
    }

    if (needsParticipantGrid) {
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (!p.name.trim() || !p.age.trim()) {
          setSubmitError(`Please complete name and age for participant ${i + 1}.`);
          return;
        }
        if (!p.signatureConfirmed) {
          setSubmitError(`Please confirm parent or teacher signature for participant ${i + 1}.`);
          return;
        }
      }
    }

    const groupSizeLabel = GROUP_CONFIG[groupKey].label;

    setBusy(true);
    const row = {
      contestant_name: contestantName.trim(),
      age: parseInt(age, 10),
      studio_name: studioName.trim(),
      teacher_name: teacherName.trim(),
      routine_name: routineName.trim(),
      soloist_address: soloistAddress.trim() || null,
      city: city.trim() || null,
      state: stateVal.trim() || null,
      zip: zip.trim() || null,
      phone: phone.trim(),
      email: email.trim(),
      years_of_training: parseInt(yearsTraining, 10),
      studio_address: studioAddress.trim() || null,
      studio_city: studioCity.trim() || null,
      studio_state: studioState.trim() || null,
      studio_zip: studioZip.trim() || null,
      category,
      age_division: ageDivision,
      ability_level: abilityLevel,
      group_size: groupSizeLabel,
      payment_method: paymentMethod,
      status: 'pending',
      participants_json: participants,
      contestant_count: contestantCount,
      total_fee: totalFee,
      disclaimer_accepted: true,
    };

    const { data, error } = await supabase.from('registrations').insert(row).select('id').single();

    if (error) {
      setBusy(false);
      setSubmitError(error.message);
      return;
    }

    try {
      await supabase.functions.invoke('send-registration-confirmation', {
        body: { registration_id: data.id },
      });
    } catch {
      /* email is best-effort */
    }

    setBusy(false);
    setSubmitOk(true);
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        Online registration is not available until Supabase environment variables are configured. You can still use the
        downloadable PDF on this page.
      </div>
    );
  }

  if (submitOk) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center text-green-900">
        <h3 className="text-xl font-bold mb-2">Registration received</h3>
        <p className="text-sm leading-relaxed">
          Thank you! Your entry has been submitted. A confirmation email will be sent to the address you provided (if
          email delivery is configured). Please mail your payment to TOPAZ 2.0, PO BOX 131, BANKS OR 97106.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-12 max-w-4xl mx-auto">
      {/* Personal info */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="font-display text-2xl font-black text-gray-900 uppercase tracking-tight">Personal info</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Solo contestant name" required>
            <Input value={contestantName} onChange={(e) => setContestantName(e.target.value)} required />
          </Field>
          <Field label="Age as of competition date" required>
            <Input
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </Field>
          <Field label="Studio name" required>
            <Input value={studioName} onChange={(e) => setStudioName(e.target.value)} required />
          </Field>
          <Field label="Teacher name" required>
            <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} required />
          </Field>
          <Field label="Name of duo/trio/group music or routine" required className="md:col-span-2">
            <Input value={routineName} onChange={(e) => setRoutineName(e.target.value)} required />
          </Field>
          <Field label="Phone" required>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Years of training" required>
            <Input
              type="number"
              min={0}
              max={80}
              value={yearsTraining}
              onChange={(e) => setYearsTraining(e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Student address</span> (optional){' '}
            <span className="text-gray-500">— Address only required for certain competitions.</span>
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Soloist address" optional>
              <Input value={soloistAddress} onChange={(e) => setSoloistAddress(e.target.value)} />
            </Field>
            <Field label="City" optional>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="State" optional>
              <Input value={stateVal} onChange={(e) => setStateVal(e.target.value)} />
            </Field>
            <Field label="ZIP" optional>
              <Input value={zip} onChange={(e) => setZip(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-4">
          <p className="text-sm font-semibold text-gray-800">Studio address (optional)</p>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Studio address" optional className="md:col-span-2">
              <Input value={studioAddress} onChange={(e) => setStudioAddress(e.target.value)} />
            </Field>
            <Field label="Studio city" optional>
              <Input value={studioCity} onChange={(e) => setStudioCity(e.target.value)} />
            </Field>
            <Field label="Studio state" optional>
              <Input value={studioState} onChange={(e) => setStudioState(e.target.value)} />
            </Field>
            <Field label="Studio zip" optional>
              <Input value={studioZip} onChange={(e) => setStudioZip(e.target.value)} />
            </Field>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="font-display text-2xl font-black text-gray-900 uppercase tracking-tight">Category selection</h2>
          <p className="text-sm text-gray-600 mt-2">
            Select <strong>one</strong> category per entry. Group 3 categories are not eligible for high scoring awards.
          </p>
          {categoryError ? <p className="text-sm text-red-600 mt-2">{categoryError}</p> : null}
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#2E75B6] mb-3">Group 1 — Performing Arts</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {PERFORMING_ARTS.map((c) => (
              <label
                key={c}
                className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer text-sm ${
                  category === c ? 'border-[#2E75B6] bg-[#2E75B6]/5' : 'border-gray-200'
                }`}
              >
                <Checkbox
                  checked={category === c}
                  onCheckedChange={(v) => {
                    if (v) selectCategory(c);
                  }}
                  aria-label={c}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#2E75B6] mb-3">Group 2 — Variety Arts</h3>
          <div className="grid gap-2">
            {VARIETY_ARTS.map((c) => (
              <label
                key={c}
                className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer text-sm ${
                  category === c ? 'border-[#2E75B6] bg-[#2E75B6]/5' : 'border-gray-200'
                }`}
              >
                <Checkbox
                  checked={category === c}
                  onCheckedChange={(v) => {
                    if (v) selectCategory(c);
                  }}
                  className="mt-0.5"
                  aria-label={c}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#2E75B6] mb-3">
            Group 3 — Special Categories (not eligible for high scoring awards)
          </h3>
          <div className="grid sm:grid-cols-1 gap-2">
            {SPECIAL.map((c) => (
              <label
                key={c}
                className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer text-sm ${
                  category === c ? 'border-[#2E75B6] bg-[#2E75B6]/5' : 'border-gray-200'
                }`}
              >
                <Checkbox
                  checked={category === c}
                  onCheckedChange={(v) => {
                    if (v) selectCategory(c);
                  }}
                  aria-label={c}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Age division */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="font-display text-2xl font-black text-gray-900 uppercase tracking-tight">Age division</h2>
        <RadioGroup value={ageDivision} onValueChange={setAgeDivision} className="space-y-2">
          {AGE_DIVISIONS.map((d) => (
            <div key={d} className="flex items-center space-x-2">
              <RadioGroupItem value={d} id={`age-${d}`} />
              <Label htmlFor={`age-${d}`} className="font-normal cursor-pointer">
                {d}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </section>

      {/* Ability */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="font-display text-2xl font-black text-gray-900 uppercase tracking-tight">Ability level</h2>
        <RadioGroup value={abilityLevel} onValueChange={setAbilityLevel} className="space-y-2">
          {ABILITY_LEVELS.map((d) => (
            <div key={d} className="flex items-center space-x-2">
              <RadioGroupItem value={d} id={`ab-${d}`} />
              <Label htmlFor={`ab-${d}`} className="font-normal cursor-pointer">
                {d}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </section>

      {/* Group size */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="font-display text-2xl font-black text-gray-900 uppercase tracking-tight">
          Group size & time limits
        </h2>
        <RadioGroup
          value={groupKey}
          onValueChange={(v) => setGroupKey(v as GroupKey)}
          className="space-y-2"
        >
          {(Object.keys(GROUP_CONFIG) as GroupKey[]).map((k) => (
            <div key={k} className="flex items-center space-x-2">
              <RadioGroupItem value={k} id={`g-${k}`} />
              <Label htmlFor={`g-${k}`} className="font-normal cursor-pointer">
                {GROUP_CONFIG[k].label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {groupKey === 'small' || groupKey === 'large' || groupKey === 'production' ? (
          <div className="max-w-xs pt-2">
            <Label htmlFor="gcount">Number of contestants in this entry *</Label>
            <Input
              id="gcount"
              type="number"
              min={GROUP_CONFIG[groupKey].min}
              max={GROUP_CONFIG[groupKey].max}
              value={groupCount}
              onChange={(e) => setGroupCount(parseInt(e.target.value, 10) || GROUP_CONFIG[groupKey].min)}
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be between {GROUP_CONFIG[groupKey].min} and {GROUP_CONFIG[groupKey].max}.
            </p>
          </div>
        ) : null}
      </section>

      {/* Fees */}
      <section className="rounded-2xl border border-gray-200 bg-[#f8fafc] p-6 md:p-8 shadow-sm space-y-3">
        <h2 className="font-display text-2xl font-black text-gray-900 uppercase tracking-tight">Entry fees</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>Solo: $100 per entry</li>
          <li>Duo: $80 per person</li>
          <li>Trio: $70 per person</li>
          <li>Groups (small, large, production): $60 per person</li>
        </ul>
        <div className="rounded-xl border border-[#2E75B6]/30 bg-white p-4 mt-4">
          <p className="text-sm text-gray-600">Based on your current selection:</p>
          <p className="text-2xl font-black text-[#2E75B6] mt-1">
            ${totalFee.toFixed(2)}{' '}
            <span className="text-sm font-semibold text-gray-600">
              ({contestantCount} contestant{contestantCount === 1 ? '' : 's'})
            </span>
          </p>
        </div>
      </section>

      {/* Payment */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="font-display text-2xl font-black text-gray-900 uppercase tracking-tight">Payment method</h2>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(v) => setPaymentMethod(v as 'Check' | 'Money Order')}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Check" id="pay-check" />
            <Label htmlFor="pay-check" className="font-normal cursor-pointer">
              Check
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Money Order" id="pay-mo" />
            <Label htmlFor="pay-mo" className="font-normal cursor-pointer">
              Money Order
            </Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-lg p-4">
          Make checks payable to <strong>Topaz Productions</strong>. Mail all entries to{' '}
          <strong>TOPAZ 2.0, PO BOX 131, BANKS OR 97106</strong>.
        </p>
      </section>

      {/* Participants */}
      {needsParticipantGrid ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
          <h2 className="font-display text-2xl font-black text-gray-900 uppercase tracking-tight">Participant list</h2>
          <p className="text-sm text-gray-600">
            Enter each participant&apos;s name and age. Confirm parent or teacher signature for each row.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name *</TableHead>
                <TableHead>Age *</TableHead>
                <TableHead className="w-[180px]">Signature confirmed *</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <Input
                      value={p.name}
                      onChange={(e) => {
                        const next = [...participants];
                        next[i] = { ...next[i], name: e.target.value };
                        setParticipants(next);
                      }}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={p.age}
                      onChange={(e) => {
                        const next = [...participants];
                        next[i] = { ...next[i], age: e.target.value };
                        setParticipants(next);
                      }}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={p.signatureConfirmed}
                        onCheckedChange={(v) => {
                          const next = [...participants];
                          next[i] = { ...next[i], signatureConfirmed: v === true };
                          setParticipants(next);
                        }}
                      />
                      <span className="text-xs text-gray-600">Parent/teacher</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      ) : null}

      {/* Music */}
      <div className="rounded-xl border border-[#2E75B6]/25 bg-[#2E75B6]/5 p-4 text-sm text-gray-800">
        <strong>Music reminder:</strong> A separate USB must be provided for each competition number, turned in one hour
        before your scheduled competition time.
      </div>

      {/* Disclaimer */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="font-display text-2xl font-black text-gray-900 uppercase tracking-tight">Disclaimer</h2>
        <Textarea readOnly value={DISCLAIMER} className="min-h-[200px] text-sm bg-gray-50" />
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={disclaimerAccepted}
            onCheckedChange={(v) => setDisclaimerAccepted(v === true)}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            I have read and agree to the disclaimer above. <span className="text-red-600">*</span>
          </span>
        </label>
      </section>

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

      <Button
        type="submit"
        disabled={busy}
        className="w-full md:w-auto px-12 py-6 text-base font-bold uppercase tracking-wider bg-[#2E75B6] hover:bg-[#1F4E78]"
      >
        {busy ? 'Submitting…' : 'Submit registration'}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
  required,
  optional,
  className,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-gray-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
        {optional ? <span className="text-gray-400 font-normal"> (optional)</span> : null}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
