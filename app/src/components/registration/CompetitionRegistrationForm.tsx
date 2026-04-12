import { useMemo, useState, useRef } from 'react';
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
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  Music,
  Usb,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Competition schedule ─────────────────────────────────────────────────────
const COMPETITION_DATE = new Date('2026-08-22T00:00:00');
const REGISTRATION_OPEN = new Date('2026-04-01T00:00:00');
const REGISTRATION_CLOSE = new Date('2026-07-30T00:00:00'); // exclusive — closes midnight July 30

// ─── Static option lists ──────────────────────────────────────────────────────
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

const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/aac',
  'audio/x-m4a',
  'audio/m4a',
  'audio/ogg',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

/** Computes age in whole years as of a given reference date from a DOB string (YYYY-MM-DD). */
function ageAsOf(dob: string, referenceDate: Date): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const m = referenceDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birth.getDate())) age--;
  return age;
}

function isMajor(dob: string): boolean {
  return ageAsOf(dob, COMPETITION_DATE) >= 18;
}

// ─── Registration closed banner ───────────────────────────────────────────────
function RegistrationClosedBanner({ before }: { before?: boolean }) {
  return (
    <div className="max-w-xl mx-auto text-center py-12 px-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="font-display font-black text-2xl text-gray-900 mb-3">
        {before ? 'Registration Not Yet Open' : 'Registration Is Now Closed'}
      </h2>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {before
          ? 'Online registration opens April 1, 2026. Please check back then.'
          : 'The registration deadline was July 30, 2026 at 12:00 AM. No late registrations are accepted.'}
      </p>
      <p className="text-sm text-gray-500">
        Questions?{' '}
        <a href="mailto:topaz2.0@yahoo.com" className="text-[#2E75B6] font-semibold">
          topaz2.0@yahoo.com
        </a>
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CompetitionRegistrationForm() {
  const now = new Date();
  const isBeforeOpen = now < REGISTRATION_OPEN;
  const isAfterClose = now >= REGISTRATION_CLOSE;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    contestant_name: string;
    category: string;
    group_size: string;
    total_fee: number;
    email: string;
    song_title: string;
    artist_name: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 1: Personal info ────────────────────────────────────────────────
  const [contestantName, setContestantName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [studioName, setStudioName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [routineName, setRoutineName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [yearsTraining, setYearsTraining] = useState('');
  const [parentGuardianName, setParentGuardianName] = useState('');
  const [soloSignatureConfirmed, setSoloSignatureConfirmed] = useState(false);
  // Address fields (optional)
  const [soloistAddress, setSoloistAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [studioAddress, setStudioAddress] = useState('');
  const [studioCity, setStudioCity] = useState('');
  const [studioState, setStudioState] = useState('');
  const [studioZip, setStudioZip] = useState('');

  // ── Step 2: Category ─────────────────────────────────────────────────────
  const [category, setCategory] = useState('');

  // ── Step 3: Division, level, group, song, music ──────────────────────────
  const [ageDivision, setAgeDivision] = useState('');
  const [abilityLevel, setAbilityLevel] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [musicDeliveryMethod, setMusicDeliveryMethod] = useState<'usb' | 'upload'>('usb');
  const [musicFile, setMusicFile] = useState<File | null>(null);

  // ── Step 4: Payment + participants ───────────────────────────────────────
  const [participants, setParticipants] = useState<RegistrationParticipant[]>([emptyParticipant()]);
  const [paymentMethod, setPaymentMethod] = useState('');

  // ── Step 5: Disclaimer ───────────────────────────────────────────────────
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // ── Derived values ───────────────────────────────────────────────────────
  const computedAge = useMemo(() => {
    if (!dateOfBirth) return '';
    const age = ageAsOf(dateOfBirth, COMPETITION_DATE);
    return age > 0 ? String(age) : '';
  }, [dateOfBirth]);

  const dancerIsMinor = useMemo(() => {
    if (!dateOfBirth) return false;
    return !isMajor(dateOfBirth);
  }, [dateOfBirth]);

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
    if (groupSize.startsWith('Solo')) return 'Solo entry: $100';
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

  // ── Validation ───────────────────────────────────────────────────────────
  function validateStep(s: number): string | null {
    if (s === 1) {
      if (!contestantName.trim()) return 'Contestant name is required.';
      if (!dateOfBirth) return 'Date of birth is required.';
      const age = ageAsOf(dateOfBirth, COMPETITION_DATE);
      if (age < 0 || age > 120) return 'Please enter a valid date of birth.';
      if (!studioName.trim()) return 'Studio name is required.';
      if (!teacherName.trim()) return 'Teacher / instructor name is required.';
      if (!routineName.trim()) return 'Routine name is required.';
      if (!phone.trim()) return 'Phone number is required.';
      if (!email.trim() || !email.includes('@')) return 'A valid email address is required.';
      if (!yearsTraining.trim()) return 'Years of training is required.';
      if (dancerIsMinor) {
        if (!parentGuardianName.trim()) return 'Parent or guardian name is required for dancers under 18.';
        if (groupSize.startsWith('Solo') && !soloSignatureConfirmed) {
          return 'Parent or teacher signature confirmation is required for dancers under 18.';
        }
      }
    }
    if (s === 2 && !category) return 'Select one category.';
    if (s === 3) {
      if (!ageDivision) return 'Select an age division.';
      if (!abilityLevel) return 'Select an ability level.';
      if (!groupSize) return 'Select group size.';
      if (!songTitle.trim()) return 'Song title is required.';
      if (!artistName.trim()) return 'Artist / composer name is required.';
      if (musicDeliveryMethod === 'upload' && !musicFile) {
        return 'Please select a music file to upload, or choose "Bring USB" instead.';
      }
      if (musicDeliveryMethod === 'upload' && musicFile) {
        if (!ACCEPTED_AUDIO_TYPES.includes(musicFile.type) && !musicFile.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
          return 'Music file must be an audio file (MP3, WAV, M4A, AAC, or OGG).';
        }
        if (musicFile.size > 52428800) return 'Music file must be 50 MB or smaller.';
      }
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
          if (!p.signature_confirmed) return `Participant ${i + 1}: parent or teacher signature confirmation is required.`;
        }
      }
    }
    if (s === 5 && !disclaimerAccepted) return 'You must read and agree to the disclaimer before submitting.';
    return null;
  }

  function next() {
    const err = validateStep(step);
    setError(err);
    if (err) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStep((x) => Math.min(5, x + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    setError(null);
    setStep((x) => Math.max(1, x - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit() {
    const err = validateStep(5);
    setError(err);
    if (err) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    setUploadProgress(0);

    const n = needsParticipantTable(groupSize)
      ? Math.max(minParticipants(groupSize), participants.length)
      : 1;
    const max = maxParticipants(groupSize);
    if (max != null && n > max) {
      setError(`This entry type allows at most ${max} participants.`);
      setSubmitting(false);
      return;
    }
    const fee = computeFee(groupSize, n);

    // ── Upload music file if provided ──────────────────────────────────────
    let musicFileUrl: string | null = null;
    if (musicDeliveryMethod === 'upload' && musicFile) {
      setUploadProgress(10);
      const sanitized = contestantName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const ext = musicFile.name.split('.').pop() ?? 'mp3';
      const path = `${Date.now()}_${sanitized}.${ext}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('music-uploads')
        .upload(path, musicFile, { contentType: musicFile.type, upsert: false });
      if (uploadErr) {
        setError(`Music upload failed: ${uploadErr.message}. Please try again or choose "Bring USB" instead.`);
        setSubmitting(false);
        setUploadProgress(0);
        return;
      }
      musicFileUrl = uploadData?.path ?? path;
      setUploadProgress(50);
    }

    // ── Build row ──────────────────────────────────────────────────────────
    const row = {
      status: 'pending',
      contestant_name: contestantName.trim(),
      age: computedAge || String(ageAsOf(dateOfBirth, COMPETITION_DATE)),
      date_of_birth: dateOfBirth || null,
      studio_name: studioName.trim(),
      teacher_name: teacherName.trim(),
      routine_name: routineName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      years_of_training: yearsTraining.trim(),
      parent_guardian_name: parentGuardianName.trim() || null,
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
      song_title: songTitle.trim() || null,
      artist_name: artistName.trim() || null,
      music_delivery_method: musicDeliveryMethod,
      music_file_url: musicFileUrl,
      contestant_count: n,
      total_fee: fee,
      payment_method: paymentMethod,
      participants_json: needsParticipantTable(groupSize) ? participants : null,
      disclaimer_accepted: true,
    };

    setUploadProgress(60);
    const { data: insData, error: insErr } = await supabase
      .from('registrations')
      .insert(row)
      .select('id')
      .single();
    if (insErr) {
      setError(`Registration failed: ${insErr.message}. Your information has not been lost — please try again.`);
      setSubmitting(false);
      setUploadProgress(0);
      return;
    }
    setUploadProgress(80);

    const registrationId: string | undefined = insData?.id;

    // ── Fire confirmation email (non-blocking) ─────────────────────────────
    void (async () => {
      try {
        await supabase.functions.invoke('send-registration-confirmation', {
          body: {
            to: row.email,
            contestant_name: row.contestant_name,
            studio_name: row.studio_name,
            teacher_name: row.teacher_name,
            routine_name: row.routine_name,
            category: row.category,
            group_size: row.group_size,
            song_title: row.song_title,
            artist_name: row.artist_name,
            music_delivery_method: row.music_delivery_method,
            total_fee: fee,
          },
        });
      } catch {
        // Email failure does not block the registration
      }
    })();

    // ── Sync to scoring app in background (non-blocking) ───────────────────
    if (registrationId) {
      void (async () => {
        try {
          await supabase.functions.invoke('sync-to-scoring-app', {
            body: { registrationId },
          });
        } catch {
          // Sync failure does not affect the visitor experience
        }
      })();
    }

    setUploadProgress(100);
    setSubmitting(false);
    setSuccess({
      contestant_name: contestantName.trim(),
      category,
      group_size: groupSize,
      total_fee: fee,
      email: row.email,
      song_title: songTitle.trim(),
      artist_name: artistName.trim(),
    });
  }

  // ── Early returns ─────────────────────────────────────────────────────────
  if (isBeforeOpen) return <RegistrationClosedBanner before />;
  if (isAfterClose) return <RegistrationClosedBanner />;

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto border-emerald-200 bg-emerald-50/80 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-emerald-900 text-xl">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            Registration Received!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-emerald-900">
          <p className="text-lg">
            Thank you, <strong>{success.contestant_name}</strong>! Your registration for{' '}
            <strong>The Return of TOPAZ 2.0</strong> has been submitted.
          </p>

          <div className="bg-white rounded-xl border border-emerald-200 p-5 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wide">Category</span>
              <p className="font-bold text-gray-900 mt-1">{success.category}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wide">Entry Type</span>
              <p className="font-bold text-gray-900 mt-1">{success.group_size}</p>
            </div>
            {success.song_title && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 text-xs uppercase tracking-wide">Song</span>
                <p className="font-bold text-gray-900 mt-1">
                  {success.song_title}{success.artist_name ? ` — ${success.artist_name}` : ''}
                </p>
              </div>
            )}
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wide">Total Entry Fee</span>
              <p className="font-black text-2xl text-[#2E75B6] mt-1">${success.total_fee.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wide">Confirmation Sent To</span>
              <p className="font-bold text-gray-900 mt-1 break-all">{success.email}</p>
            </div>
          </div>

          <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-4 text-sm">
            <p className="font-bold text-emerald-900 mb-1">What happens next?</p>
            <ul className="space-y-2 text-emerald-800">
              <li>• Check your email for a confirmation summary</li>
              <li>• Competition date: <strong>August 22, 2026</strong></li>
              <li>• Location: <strong>Seaside Convention Center, 415 1st Ave, Seaside, OR 97138</strong></li>
              <li>• Questions? <a href="mailto:topaz2.0@yahoo.com" className="underline font-semibold">topaz2.0@yahoo.com</a> or 971-299-4401</li>
            </ul>
          </div>

          <Button asChild variant="outline" className="border-emerald-700 text-emerald-900">
            <Link to="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        {['Info', 'Category', 'Division', 'Payment', 'Review'].map((label, i) => {
          const n = i + 1;
          return (
            <div key={n} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs',
                    step === n
                      ? 'bg-[#2E75B6] text-white'
                      : step > n
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                </span>
                <span className="hidden sm:block text-[10px] mt-1 font-medium">{label}</span>
              </div>
              {n < 5 ? <span className="hidden sm:inline w-8 h-px bg-gray-300 mb-4" /> : null}
            </div>
          );
        })}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* ── STEP 1 — Personal information ────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 — Dancer &amp; Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {/* Contestant name */}
            <div className="sm:col-span-2">
              <Label>Dancer's full name *</Label>
              <Input
                value={contestantName}
                onChange={(e) => setContestantName(e.target.value)}
                placeholder="First and last name"
                className="mt-1"
              />
            </div>

            {/* Date of birth */}
            <div>
              <Label>Date of birth *</Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
              {dateOfBirth && computedAge && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Age on competition day:{' '}
                  <strong className="text-gray-800">{computedAge}</strong>
                  {dancerIsMinor && (
                    <span className="ml-2 text-amber-700 font-semibold">
                      · Under 18 — parent/guardian required
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Studio name */}
            <div>
              <Label>Studio name *</Label>
              <Input value={studioName} onChange={(e) => setStudioName(e.target.value)} className="mt-1" />
            </div>

            {/* Teacher name */}
            <div>
              <Label>Teacher / instructor name *</Label>
              <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="mt-1" />
            </div>

            {/* Routine name */}
            <div className="sm:col-span-2">
              <Label>Name of routine *</Label>
              <Input
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="E.g. Shadow Dance"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">For duo/trio/group entries, list all names on back of form.</p>
            </div>

            {/* Parent / guardian — shown when minor */}
            {dancerIsMinor && (
              <>
                <div className="sm:col-span-2 p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-4">
                  <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    This dancer is under 18 — parent or guardian information required
                  </p>
                  <div>
                    <Label>Parent or guardian full name *</Label>
                    <Input
                      value={parentGuardianName}
                      onChange={(e) => setParentGuardianName(e.target.value)}
                      placeholder="Full legal name"
                      className="mt-1"
                    />
                  </div>
                  {/* Signature confirmation for solo minor — group entries handle this per-participant in Step 4 */}
                  {(!groupSize || groupSize.startsWith('Solo')) && (
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        checked={soloSignatureConfirmed}
                        onCheckedChange={(v) => setSoloSignatureConfirmed(v === true)}
                        className="mt-0.5"
                      />
                      <span className="text-sm text-amber-900">
                        I confirm that a parent or teacher signature has been obtained for this minor contestant, and I
                        agree to the competition rules on their behalf.
                      </span>
                    </label>
                  )}
                </div>
              </>
            )}

            {/* Phone */}
            <div>
              <Label>Phone *</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(503) 555-0100"
                className="mt-1"
              />
            </div>

            {/* Email */}
            <div>
              <Label>Email address *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Confirmation email will be sent here.</p>
            </div>

            {/* Years of training */}
            <div className="sm:col-span-2">
              <Label>Years of training *</Label>
              <Input
                value={yearsTraining}
                onChange={(e) => setYearsTraining(e.target.value)}
                placeholder="E.g. 3"
                className="mt-1"
              />
            </div>

            {/* Optional address */}
            <div className="sm:col-span-2 pt-2">
              <p className="text-sm font-semibold text-gray-700 mb-1">Address (optional)</p>
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                Mailing address is only required for certain competitions. Leave blank if not applicable.
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label>Street address</Label>
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
              <Label>Studio street address</Label>
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

      {/* ── STEP 2 — Category selection ──────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2 — Category Selection</CardTitle>
            <p className="text-sm text-gray-600 font-normal">Select 1 category per entry form.</p>
          </CardHeader>
          <CardContent>
            <RadioGroup value={category} onValueChange={setCategory} className="space-y-8">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide text-[#2E75B6] mb-3">Performing Arts</h4>
                <div className="space-y-2">
                  {PERFORMING.map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-blue-50"
                    >
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
                    <label
                      key={c}
                      className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-blue-50"
                    >
                      <RadioGroupItem value={c} id={`cat-${c.slice(0, 20)}`} className="mt-1" />
                      <span className="text-sm leading-snug">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide text-[#2E75B6] mb-3">
                  Special Categories
                  <span className="ml-2 text-xs font-normal text-gray-500 normal-case">(not eligible for high-scoring awards)</span>
                </h4>
                <div className="space-y-2">
                  {SPECIAL.map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-blue-50"
                    >
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

      {/* ── STEP 3 — Division, level, group size + music ─────────────────── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3 — Division, Level &amp; Music</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Age division */}
            <div>
              <p className="font-bold mb-1">Age division *</p>
              <p className="text-sm text-gray-500 mb-3">Duo, trio, and group ages are averaged.</p>
              <RadioGroup value={ageDivision} onValueChange={setAgeDivision} className="space-y-2">
                {AGE_DIVISIONS.map((d) => (
                  <label
                    key={d}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-blue-50"
                  >
                    <RadioGroupItem value={d} />
                    <span className="text-sm">{d}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Ability level */}
            <div>
              <p className="font-bold mb-3">Ability level *</p>
              <RadioGroup value={abilityLevel} onValueChange={setAbilityLevel} className="space-y-2">
                {ABILITY_LEVELS.map((d) => (
                  <label
                    key={d}
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-blue-50"
                  >
                    <RadioGroupItem value={d} className="mt-1" />
                    <span className="text-sm leading-snug">{d}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Group size */}
            <div>
              <p className="font-bold mb-3">Entry type &amp; time limits *</p>
              <RadioGroup
                value={groupSize}
                onValueChange={(v) => {
                  setGroupSize(v);
                  syncParticipantsToGroupSize(v);
                  // Re-check solo signature if switching away from solo
                  if (!v.startsWith('Solo')) setSoloSignatureConfirmed(false);
                }}
                className="space-y-2"
              >
                {GROUP_SIZES.map((d) => (
                  <label
                    key={d}
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-blue-50"
                  >
                    <RadioGroupItem value={d} className="mt-1" />
                    <span className="text-sm leading-snug">{d}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="font-bold text-[#1F4E78] mb-4">Performance Music</h4>

              {/* Song title */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label>Song title *</Label>
                  <Input
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="E.g. Bohemian Rhapsody"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Artist / composer *</Label>
                  <Input
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="E.g. Queen"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Music delivery */}
              <div>
                <Label className="mb-3 block">How will you deliver your music? *</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* USB option */}
                  <label
                    className={cn(
                      'flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all',
                      musicDeliveryMethod === 'usb'
                        ? 'border-[#2E75B6] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="music-delivery"
                      value="usb"
                      checked={musicDeliveryMethod === 'usb'}
                      onChange={() => {
                        setMusicDeliveryMethod('usb');
                        setMusicFile(null);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        <Usb className="w-4 h-4" />
                        Bring USB on competition day
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Turn in USB to front desk at least 1 hour before your performance. Each entry needs a separate
                        USB. TOPAZ is not responsible for lost/damaged USBs.
                      </p>
                    </div>
                  </label>

                  {/* Upload option */}
                  <label
                    className={cn(
                      'flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all',
                      musicDeliveryMethod === 'upload'
                        ? 'border-[#2E75B6] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="music-delivery"
                      value="upload"
                      checked={musicDeliveryMethod === 'upload'}
                      onChange={() => setMusicDeliveryMethod('upload')}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        <Upload className="w-4 h-4" />
                        Upload file digitally
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload your music file now (MP3, WAV, M4A — max 50 MB). File will be securely stored.
                      </p>
                    </div>
                  </label>
                </div>

                {/* File picker — shown only when upload selected */}
                {musicDeliveryMethod === 'upload' && (
                  <div className="mt-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/x-m4a,audio/m4a,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg"
                      className="sr-only"
                      onChange={(e) => setMusicFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-[#2E75B6] rounded-xl w-full text-left hover:bg-blue-50 transition-colors"
                    >
                      <Music className="w-5 h-5 text-[#2E75B6] flex-shrink-0" />
                      {musicFile ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{musicFile.name}</p>
                          <p className="text-xs text-gray-500">{(musicFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <span className="text-sm text-[#2E75B6] font-medium">Click to select music file…</span>
                      )}
                    </button>
                    {musicFile && (
                      <button
                        type="button"
                        onClick={() => setMusicFile(null)}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Remove file
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 4 — Entry fees, payment &amp; participants ───────────────── */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4 — Entry Fees &amp; Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fee display */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
              <p className="font-bold text-[#1F4E78] text-sm uppercase tracking-wide">Entry fee calculation</p>
              <p className="text-sm text-gray-700 mt-2">{feeBreakdown || 'Select entry type in step 3.'}</p>
              <p className="text-3xl font-black text-[#2E75B6] mt-2">${totalFee.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">
                Solo $100 · Duo $80/person · Trio $70/person · Group/Production $60/person
              </p>
            </div>

            {/* Payment method */}
            <div>
              <h4 className="font-bold mb-3">Payment method *</h4>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                {PAYMENT_METHODS.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-blue-50"
                  >
                    <RadioGroupItem value={p} />
                    <span className="text-sm">{p}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Mailing info */}
            <div className="text-sm text-gray-700 bg-gray-50 border rounded-xl p-4">
              Make checks payable to <strong>Topaz Productions</strong>. Mail all entries to{' '}
              <strong>TOPAZ 2.0, PO BOX 131, BANKS OR 97106</strong>. All entries must be postmarked by the closing
              date.
            </div>

            {/* Participants (Duo/Trio/Group/Production) */}
            {needsParticipantTable(groupSize) && (
              <div>
                <h4 className="font-bold mb-1">Participants</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Add each contestant's name, age, and signature confirmation.
                </p>
                <div className="space-y-4">
                  {participants.map((p, i) => (
                    <div key={i} className="border rounded-xl p-4 space-y-3 bg-white shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Participant {i + 1}
                        </span>
                        {participants.length > minParticipants(groupSize) ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setParticipants((prev) => prev.filter((_, j) => j !== i))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : null}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label>Full name *</Label>
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
                          <Label>Age *</Label>
                          <Input
                            value={p.age}
                            onChange={(e) =>
                              setParticipants((prev) =>
                                prev.map((x, j) => (j === i ? { ...x, age: e.target.value } : x))
                              )
                            }
                            placeholder="Age as of Aug 22, 2026"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <Checkbox
                          checked={p.signature_confirmed}
                          onCheckedChange={(v) =>
                            setParticipants((prev) =>
                              prev.map((x, j) => (j === i ? { ...x, signature_confirmed: v === true } : x))
                            )
                          }
                          className="mt-0.5"
                        />
                        <span className="text-sm text-gray-700">
                          Parent or teacher signature confirmed for this participant
                        </span>
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

      {/* ── STEP 5 — Review &amp; submit ──────────────────────────────────── */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5 — Review &amp; Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {/* Summary grid */}
            <div className="grid sm:grid-cols-2 gap-3 border rounded-xl p-4 bg-gray-50">
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Dancer</span>
                <p className="font-bold text-gray-900 mt-0.5">{contestantName}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Date of Birth</span>
                <p className="font-bold text-gray-900 mt-0.5">
                  {dateOfBirth} <span className="font-normal text-gray-500">(age {computedAge})</span>
                </p>
              </div>
              {parentGuardianName && (
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Parent / Guardian</span>
                  <p className="font-bold text-gray-900 mt-0.5">{parentGuardianName}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Studio</span>
                <p className="font-bold text-gray-900 mt-0.5">{studioName}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Teacher</span>
                <p className="font-bold text-gray-900 mt-0.5">{teacherName}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 text-xs uppercase tracking-wide">Routine</span>
                <p className="font-bold text-gray-900 mt-0.5">{routineName}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Phone</span>
                <p className="font-bold text-gray-900 mt-0.5">{phone}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Email</span>
                <p className="font-bold text-gray-900 mt-0.5 break-all">{email}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 text-xs uppercase tracking-wide">Category</span>
                <p className="font-bold text-gray-900 mt-0.5">{category}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Age Division</span>
                <p className="font-bold text-gray-900 mt-0.5">{ageDivision}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Ability Level</span>
                <p className="font-bold text-gray-900 mt-0.5">{abilityLevel}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500 text-xs uppercase tracking-wide">Entry Type</span>
                <p className="font-bold text-gray-900 mt-0.5">{groupSize}</p>
              </div>
              {songTitle && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500 text-xs uppercase tracking-wide">Song</span>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {songTitle}{artistName ? ` — ${artistName}` : ''}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Music Delivery</span>
                <p className="font-bold text-gray-900 mt-0.5 capitalize">
                  {musicDeliveryMethod === 'upload'
                    ? `Digital upload${musicFile ? ` (${musicFile.name})` : ''}`
                    : 'USB on competition day'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Entry Fee</span>
                <p className="font-black text-[#2E75B6] text-xl mt-0.5">${totalFee.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wide">Payment</span>
                <p className="font-bold text-gray-900 mt-0.5">{paymentMethod}</p>
              </div>
            </div>

            {/* Participants list */}
            {needsParticipantTable(groupSize) && participants.length > 0 ? (
              <div>
                <h4 className="font-bold mb-2">Participants ({participants.length})</h4>
                <ul className="space-y-1 text-sm">
                  {participants.map((p, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#2E75B6] text-white text-xs flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span>
                        <strong>{p.name}</strong>, age {p.age}
                        {p.signature_confirmed ? (
                          <span className="ml-2 text-emerald-600 text-xs">✓ signature confirmed</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Disclaimer */}
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-5">
              <p className="font-bold text-amber-900 mb-3 text-base">Disclaimer &amp; Liability Waiver</p>
              <div className="text-gray-800 text-sm leading-relaxed space-y-3">
                <p>
                  TOPAZ, its owners, workers, or anyone associated with its organization will not be held responsible
                  for the lost or damage of any property, whether the result of accident or other causes, and in
                  addition assumes no responsibility for any loss, damage, or injury sustained by any contestant,
                  parent, teacher, or spectator during the time of the competition.
                </p>
                <p>
                  By submitting this registration, you consent to photo and video recording of the performance by TOPAZ
                  2.0 LLC and authorize its use for promotional purposes.
                </p>
                <p>
                  You confirm that all information provided is accurate and that you have read and agree to all
                  competition rules as outlined in the official registration materials.
                </p>
              </div>
            </div>

            {/* Music reminder */}
            {musicDeliveryMethod === 'usb' && (
              <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                <p className="font-semibold text-[#1F4E78] mb-1">Music USB Reminder</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Each competition number requires a separate USB. Turn in your music USB to the front desk at least{' '}
                  <strong>one hour</strong> before your competition time. TOPAZ 2.0 is not responsible for damaged or
                  lost USBs.
                </p>
              </div>
            )}

            {/* Agreement checkbox */}
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 hover:border-[#2E75B6] transition-colors has-[:checked]:border-[#2E75B6] has-[:checked]:bg-blue-50">
              <Checkbox
                checked={disclaimerAccepted}
                onCheckedChange={(v) => setDisclaimerAccepted(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm font-medium text-gray-800">
                I have read and agree to the disclaimer and liability waiver above. I understand all competition rules
                and confirm that the information I have provided is accurate.
              </span>
            </label>

            {/* Upload progress indicator */}
            {submitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{uploadProgress < 50 ? 'Uploading music file…' : 'Saving registration…'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2E75B6] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Navigation buttons ────────────────────────────────────────────── */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={back} disabled={step === 1 || submitting}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        {step < 5 ? (
          <Button type="button" className="bg-[#2E75B6] hover:bg-[#1F4E78]" onClick={next}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            className="bg-[#2E75B6] hover:bg-[#1F4E78] min-w-[180px]"
            disabled={submitting || !disclaimerAccepted}
            onClick={submit}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </span>
            ) : (
              'Submit Registration'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
