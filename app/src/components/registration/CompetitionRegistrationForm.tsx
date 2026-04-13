import { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { RegistrationParticipant } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
  Info,
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
      <div className="w-20 h-20 bg-red-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="font-display font-black text-3xl text-[#0a0a0a] mb-4 uppercase tracking-tight">
        {before ? 'Registration Not Yet Open' : 'Registration Is Now Closed'}
      </h2>
      <p className="text-gray-500 mb-8 leading-relaxed font-medium text-lg">
        {before
          ? 'Online registration opens April 1, 2026. Please check back then.'
          : 'The registration deadline was July 30, 2026 at 12:00 AM. No late registrations are accepted.'}
      </p>
      <p className="text-sm font-bold tracking-widest uppercase text-gray-400">
        Questions?{' '}
        <a href="mailto:topaz2.0@yahoo.com" className="text-[#2E75B6] hover:text-[#1F4E78] transition-colors">
          topaz2.0@yahoo.com
        </a>
      </p>
    </div>
  );
}

// ─── Shared UI Components for Premium Feel ─────────────────────────────────────
const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <Input
    {...props}
    className={cn(
      "h-14 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-[#2E75B6] focus:ring-4 focus:ring-[#2E75B6]/10 transition-all px-5 text-base font-medium shadow-sm",
      props.className
    )}
  />
);

const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <Label className={cn("text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1 block", className)}>
    {children}
  </Label>
);

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
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-[#2E75B6] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-lg border border-white/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-display font-black text-3xl uppercase tracking-tight mb-2">Registration Received!</h2>
            <p className="text-white/80 font-medium text-lg">Thank you, {success.contestant_name}</p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Category</p>
              <p className="font-bold text-[#0a0a0a] text-lg">{success.category}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Entry Type</p>
              <p className="font-bold text-[#0a0a0a] text-lg">{success.group_size}</p>
            </div>
            {success.song_title && (
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Song</p>
                <p className="font-bold text-[#0a0a0a] text-lg">
                  {success.song_title}{success.artist_name ? ` — ${success.artist_name}` : ''}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Entry Fee</p>
              <p className="font-black text-3xl text-[#2E75B6]">${success.total_fee.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Confirmation Email</p>
              <p className="font-bold text-[#0a0a0a] text-base truncate">{success.email}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10">
            <h4 className="font-display font-bold text-lg text-[#0a0a0a] mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#2E75B6]" />
              What happens next?
            </h4>
            <ul className="space-y-3 text-gray-600 font-medium">
              <li className="flex gap-3"><span className="text-[#2E75B6]">•</span> Check your email for a full confirmation summary</li>
              <li className="flex gap-3"><span className="text-[#2E75B6]">•</span> Competition date: <strong className="text-[#0a0a0a]">August 22, 2026</strong></li>
              <li className="flex gap-3"><span className="text-[#2E75B6]">•</span> Location: <strong className="text-[#0a0a0a]">Seaside Convention Center, OR</strong></li>
            </ul>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center w-full py-5 bg-white border-2 border-gray-200 text-[#0a0a0a] font-bold rounded-2xl hover:border-[#0a0a0a] hover:bg-gray-50 transition-all uppercase tracking-widest text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const steps = ['Info', 'Category', 'Division', 'Payment', 'Review'];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Premium Step Indicator */}
      <div className="relative pt-6 pb-12">
        <div className="absolute top-10 left-[10%] right-[10%] h-1 bg-gray-100 rounded-full" />
        <div 
          className="absolute top-10 left-[10%] h-1 bg-[#2E75B6] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 80}%` }}
        />
        
        <div className="relative flex justify-between w-full">
          {steps.map((label, i) => {
            const n = i + 1;
            const isActive = step === n;
            const isCompleted = step > n;
            return (
              <div key={n} className="flex flex-col items-center relative z-10 w-1/5">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-sm",
                    isActive 
                      ? "bg-[#2E75B6] text-white scale-110 shadow-md shadow-[#2E75B6]/30 ring-4 ring-[#2E75B6]/10" 
                      : isCompleted 
                        ? "bg-[#0a0a0a] text-white" 
                        : "bg-white border-2 border-gray-100 text-gray-400"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : n}
                </div>
                <span 
                  className={cn(
                    "hidden sm:block absolute top-14 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300",
                    isActive ? "text-[#2E75B6]" : isCompleted ? "text-[#0a0a0a]" : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-4 p-6 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-4">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
          <p className="font-medium text-red-800 leading-relaxed">{error}</p>
        </div>
      ) : null}

      {/* Main Form Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100 p-8 sm:p-12 min-h-[400px]">
        
        {/* ── STEP 1 — Personal information ────────────────────────────────── */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10 pb-6 border-b border-gray-100">
              <h2 className="font-display font-black text-3xl text-[#0a0a0a] uppercase tracking-tight">Dancer & Contact Info</h2>
              <p className="text-gray-500 font-medium mt-2">Please provide the primary contact and dancer details.</p>
            </div>
            
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormLabel>Dancer's full name *</FormLabel>
                <FormInput value={contestantName} onChange={(e) => setContestantName(e.target.value)} placeholder="First and last name" />
              </div>

              <div>
                <FormLabel>Date of birth *</FormLabel>
                <FormInput type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                {dateOfBirth && computedAge && (
                  <p className="text-xs font-bold text-gray-500 mt-3 px-2">
                    Age on competition day: <span className="text-[#2E75B6] text-sm ml-1">{computedAge}</span>
                    {dancerIsMinor && <span className="ml-2 text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase tracking-widest text-[10px]">Under 18 — Parent Req.</span>}
                  </p>
                )}
              </div>

              <div>
                <FormLabel>Years of training *</FormLabel>
                <FormInput value={yearsTraining} onChange={(e) => setYearsTraining(e.target.value)} placeholder="E.g. 3" />
              </div>

              <div>
                <FormLabel>Studio name *</FormLabel>
                <FormInput value={studioName} onChange={(e) => setStudioName(e.target.value)} placeholder="Studio Name" />
              </div>

              <div>
                <FormLabel>Teacher / instructor name *</FormLabel>
                <FormInput value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Teacher Name" />
              </div>

              <div className="sm:col-span-2">
                <FormLabel>Name of routine *</FormLabel>
                <FormInput value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="E.g. Shadow Dance" />
                <p className="text-xs font-medium text-gray-400 mt-2 ml-2">For duo/trio/group entries, you will list additional names in Step 4.</p>
              </div>

              {dancerIsMinor && (
                <div className="sm:col-span-2 bg-[#fafafa] rounded-2xl p-6 sm:p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <h4 className="font-bold text-[#0a0a0a] text-lg uppercase tracking-tight">Parent/Guardian Info Required</h4>
                  </div>
                  <FormLabel>Parent or guardian full name *</FormLabel>
                  <FormInput value={parentGuardianName} onChange={(e) => setParentGuardianName(e.target.value)} placeholder="Full legal name" className="mb-6 bg-white" />
                  
                  {(!groupSize || groupSize.startsWith('Solo')) && (
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <Checkbox checked={soloSignatureConfirmed} onCheckedChange={(v) => setSoloSignatureConfirmed(v === true)} className="mt-1 w-6 h-6 rounded-md data-[state=checked]:bg-[#2E75B6] data-[state=checked]:border-[#2E75B6]" />
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors leading-relaxed">
                        I confirm that a parent or teacher signature has been obtained for this minor contestant, and I agree to the competition rules on their behalf.
                      </span>
                    </label>
                  )}
                </div>
              )}

              <div>
                <FormLabel>Phone *</FormLabel>
                <FormInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" />
              </div>

              <div>
                <FormLabel>Email address *</FormLabel>
                <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>

              <div className="sm:col-span-2 mt-8 mb-4">
                <h4 className="font-display font-black text-xl text-[#0a0a0a] uppercase tracking-tight">Mailing Address <span className="text-gray-400 text-base font-medium normal-case ml-2">(Optional)</span></h4>
              </div>

              <div className="sm:col-span-2">
                <FormLabel>Street address</FormLabel>
                <FormInput value={soloistAddress} onChange={(e) => setSoloistAddress(e.target.value)} />
              </div>
              <div><FormLabel>City</FormLabel><FormInput value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div><FormLabel>State</FormLabel><FormInput value={state} onChange={(e) => setState(e.target.value)} /></div>
              <div><FormLabel>Zip</FormLabel><FormInput value={zip} onChange={(e) => setZip(e.target.value)} /></div>
              <div className="sm:col-span-2">
                <FormLabel>Studio street address</FormLabel>
                <FormInput value={studioAddress} onChange={(e) => setStudioAddress(e.target.value)} />
              </div>
              <div><FormLabel>Studio city</FormLabel><FormInput value={studioCity} onChange={(e) => setStudioCity(e.target.value)} /></div>
              <div><FormLabel>Studio state</FormLabel><FormInput value={studioState} onChange={(e) => setStudioState(e.target.value)} /></div>
              <div><FormLabel>Studio zip</FormLabel><FormInput value={studioZip} onChange={(e) => setStudioZip(e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* ── STEP 2 — Category selection ──────────────────────────────────── */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10 pb-6 border-b border-gray-100">
              <h2 className="font-display font-black text-3xl text-[#0a0a0a] uppercase tracking-tight">Category Selection</h2>
              <p className="text-gray-500 font-medium mt-2">Select one performance category per entry form.</p>
            </div>
            
            <RadioGroup value={category} onValueChange={setCategory} className="space-y-12">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-4">
                  Performing Arts
                  <div className="flex-1 h-px bg-gray-100" />
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {PERFORMING.map((c) => (
                    <label key={c} className="flex items-center gap-4 rounded-2xl border-2 border-gray-100 p-5 cursor-pointer transition-all duration-300 hover:border-gray-200 hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-[#2E75B6]/5 has-[:checked]:shadow-md">
                      <RadioGroupItem value={c} id={`cat-${c}`} className="w-5 h-5" />
                      <span className="font-bold text-[#0a0a0a]">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-4">
                  Variety Arts
                  <div className="flex-1 h-px bg-gray-100" />
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {VARIETY.map((c) => (
                    <label key={c} className="flex items-start gap-4 rounded-2xl border-2 border-gray-100 p-5 cursor-pointer transition-all duration-300 hover:border-gray-200 hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-[#2E75B6]/5 has-[:checked]:shadow-md">
                      <RadioGroupItem value={c} id={`cat-${c.slice(0, 20)}`} className="w-5 h-5 mt-0.5" />
                      <span className="font-bold text-[#0a0a0a] leading-tight">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-4">
                  Special Categories
                  <div className="flex-1 h-px bg-gray-100" />
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {SPECIAL.map((c) => (
                    <label key={c} className="flex items-center gap-4 rounded-2xl border-2 border-gray-100 p-5 cursor-pointer transition-all duration-300 hover:border-gray-200 hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-[#2E75B6]/5 has-[:checked]:shadow-md">
                      <RadioGroupItem value={c} id={`cat-${c}`} className="w-5 h-5" />
                      <span className="font-bold text-[#0a0a0a]">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* ── STEP 3 — Division, level, group size + music ─────────────────── */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10 pb-6 border-b border-gray-100">
              <h2 className="font-display font-black text-3xl text-[#0a0a0a] uppercase tracking-tight">Division & Music</h2>
              <p className="text-gray-500 font-medium mt-2">Set your division details and upload performance audio.</p>
            </div>

            <div className="space-y-12">
              <div className="grid sm:grid-cols-2 gap-10">
                {/* Age division */}
                <div>
                  <FormLabel>Age division *</FormLabel>
                  <p className="text-xs text-gray-400 mb-4 font-medium">Duo, trio, and group ages are averaged.</p>
                  <RadioGroup value={ageDivision} onValueChange={setAgeDivision} className="space-y-3">
                    {AGE_DIVISIONS.map((d) => (
                      <label key={d} className="flex items-center gap-4 rounded-2xl border-2 border-gray-100 p-4 cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-[#2E75B6]/5">
                        <RadioGroupItem value={d} className="w-5 h-5" />
                        <span className="font-bold text-gray-800 text-sm">{d}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Ability level */}
                <div>
                  <FormLabel>Ability level *</FormLabel>
                  <p className="text-xs text-gray-400 mb-4 font-medium">&nbsp;</p>
                  <RadioGroup value={abilityLevel} onValueChange={setAbilityLevel} className="space-y-3">
                    {ABILITY_LEVELS.map((d) => (
                      <label key={d} className="flex items-start gap-4 rounded-2xl border-2 border-gray-100 p-4 cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-[#2E75B6]/5">
                        <RadioGroupItem value={d} className="w-5 h-5 mt-0.5 shrink-0" />
                        <span className="font-bold text-gray-800 text-sm leading-tight">{d}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Group size */}
              <div>
                <FormLabel>Entry type & time limits *</FormLabel>
                <RadioGroup
                  value={groupSize}
                  onValueChange={(v) => {
                    setGroupSize(v);
                    syncParticipantsToGroupSize(v);
                    if (!v.startsWith('Solo')) setSoloSignatureConfirmed(false);
                  }}
                  className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4"
                >
                  {GROUP_SIZES.map((d) => (
                    <label key={d} className="flex items-start gap-4 rounded-2xl border-2 border-gray-100 p-4 cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-[#2E75B6]/5">
                      <RadioGroupItem value={d} className="w-5 h-5 mt-0.5 shrink-0" />
                      <span className="font-bold text-gray-800 text-sm leading-tight">{d}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="pt-10 border-t border-gray-100">
                <h3 className="font-display font-black text-2xl text-[#0a0a0a] uppercase tracking-tight mb-8">Performance Music</h3>
                
                <div className="grid sm:grid-cols-2 gap-8 mb-10">
                  <div>
                    <FormLabel>Song title *</FormLabel>
                    <FormInput value={songTitle} onChange={(e) => setSongTitle(e.target.value)} placeholder="E.g. Bohemian Rhapsody" />
                  </div>
                  <div>
                    <FormLabel>Artist / composer *</FormLabel>
                    <FormInput value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="E.g. Queen" />
                  </div>
                </div>

                <FormLabel>How will you deliver your music? *</FormLabel>
                <div className="grid sm:grid-cols-2 gap-6 mt-4">
                  <label className={cn("flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 p-8 text-center cursor-pointer transition-all duration-300", musicDeliveryMethod === 'usb' ? 'border-[#0a0a0a] bg-[#fafafa] shadow-md' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50')}>
                    <input type="radio" name="music-delivery" value="usb" checked={musicDeliveryMethod === 'usb'} onChange={() => { setMusicDeliveryMethod('usb'); setMusicFile(null); }} className="sr-only" />
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-colors", musicDeliveryMethod === 'usb' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-100 text-gray-500')}>
                      <Usb className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">Bring USB</h4>
                      <p className="text-sm font-medium text-gray-500 mt-2 max-w-[200px] mx-auto">Turn in USB 1 hour before performance.</p>
                    </div>
                  </label>

                  <label className={cn("flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 p-8 text-center cursor-pointer transition-all duration-300", musicDeliveryMethod === 'upload' ? 'border-[#2E75B6] bg-[#2E75B6]/5 shadow-md' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50')}>
                    <input type="radio" name="music-delivery" value="upload" checked={musicDeliveryMethod === 'upload'} onChange={() => setMusicDeliveryMethod('upload')} className="sr-only" />
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-colors", musicDeliveryMethod === 'upload' ? 'bg-[#2E75B6] text-white' : 'bg-gray-100 text-gray-500')}>
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">Digital Upload</h4>
                      <p className="text-sm font-medium text-gray-500 mt-2 max-w-[200px] mx-auto">Upload MP3/WAV securely right now.</p>
                    </div>
                  </label>
                </div>

                {musicDeliveryMethod === 'upload' && (
                  <div className="mt-6 animate-in fade-in slide-in-from-top-4">
                    <input ref={fileInputRef} type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/x-m4a,audio/m4a,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg" className="sr-only" onChange={(e) => setMusicFile(e.target.files?.[0] ?? null)} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-6 px-8 py-6 border-2 border-dashed border-[#2E75B6]/50 rounded-[2rem] w-full text-left hover:bg-[#2E75B6]/5 transition-all group">
                      <div className="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Music className="w-6 h-6 text-[#2E75B6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {musicFile ? (
                          <>
                            <p className="text-lg font-bold text-gray-900 truncate">{musicFile.name}</p>
                            <p className="text-sm font-medium text-gray-500">{(musicFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-bold text-[#2E75B6]">Select music file to upload</p>
                            <p className="text-sm font-medium text-gray-500">Max size 50 MB</p>
                          </>
                        )}
                      </div>
                    </button>
                    {musicFile && (
                      <button type="button" onClick={() => setMusicFile(null)} className="mt-4 text-sm font-bold text-red-500 hover:text-red-700 uppercase tracking-widest ml-4 transition-colors">
                        Remove file
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4 — Entry fees, payment & participants ───────────────── */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10 pb-6 border-b border-gray-100">
              <h2 className="font-display font-black text-3xl text-[#0a0a0a] uppercase tracking-tight">Fees & Participants</h2>
              <p className="text-gray-500 font-medium mt-2">Review your total and list all performers.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-10">
                {/* Fee display */}
                <div className="rounded-[2rem] bg-[#0a0a0a] p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#2E75B6]/20 rounded-full blur-[60px] pointer-events-none" />
                  <p className="font-bold text-[#2E75B6] text-xs uppercase tracking-widest mb-4 relative z-10">Entry fee calculation</p>
                  <p className="text-4xl font-black text-white relative z-10 mb-2">${totalFee.toFixed(2)}</p>
                  <p className="text-sm text-gray-400 font-medium relative z-10">{feeBreakdown || 'Select entry type in step 3.'}</p>
                </div>

                {/* Payment method */}
                <div>
                  <FormLabel>Payment method *</FormLabel>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4 mt-4">
                    {PAYMENT_METHODS.map((p) => (
                      <label key={p} className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 p-4 cursor-pointer transition-all hover:border-gray-200 hover:bg-gray-50 has-[:checked]:border-[#2E75B6] has-[:checked]:bg-[#2E75B6]/5">
                        <RadioGroupItem value={p} className="w-5 h-5" />
                        <span className="font-bold text-gray-800">{p}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="bg-[#fafafa] rounded-2xl p-6 border border-gray-100 flex items-start gap-4">
                  <Info className="w-6 h-6 text-[#2E75B6] shrink-0" />
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">
                    Make checks payable to <strong className="text-gray-900">Topaz Productions</strong>. 
                    Mail entries to <strong className="text-gray-900">PO BOX 131, BANKS OR 97106</strong>.
                  </p>
                </div>
              </div>

              {/* Participants */}
              {needsParticipantTable(groupSize) && (
                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                  <h4 className="font-display font-black text-2xl text-[#0a0a0a] uppercase tracking-tight mb-2">Performers</h4>
                  <p className="text-sm font-medium text-gray-500 mb-8">List each contestant's name, age, and signature confirmation.</p>
                  
                  <div className="space-y-6">
                    {participants.map((p, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#0a0a0a] text-white rounded-full flex items-center justify-center font-black text-sm border-4 border-gray-50 shadow-sm z-10">
                          {i + 1}
                        </div>
                        {participants.length > minParticipants(groupSize) && (
                          <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors" onClick={() => setParticipants((prev) => prev.filter((_, j) => j !== i))}>
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        <div className="grid sm:grid-cols-3 gap-4 pt-2">
                          <div className="sm:col-span-2">
                            <FormLabel className="text-[10px]">Full name *</FormLabel>
                            <FormInput className="h-12 bg-gray-50/50" value={p.name} onChange={(e) => setParticipants(prev => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                          </div>
                          <div>
                            <FormLabel className="text-[10px]">Age *</FormLabel>
                            <FormInput className="h-12 bg-gray-50/50" value={p.age} onChange={(e) => setParticipants(prev => prev.map((x, j) => (j === i ? { ...x, age: e.target.value } : x)))} />
                          </div>
                        </div>
                        <label className="flex items-start gap-3 mt-5 cursor-pointer group">
                          <Checkbox checked={p.signature_confirmed} onCheckedChange={(v) => setParticipants(prev => prev.map((x, j) => (j === i ? { ...x, signature_confirmed: v === true } : x)))} className="mt-0.5 w-5 h-5 rounded data-[state=checked]:bg-[#2E75B6]" />
                          <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 leading-snug">Parent or teacher signature confirmed for this participant</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {(() => {
                    const cap = maxParticipants(groupSize);
                    if (cap != null && participants.length >= cap) return null;
                    return (
                      <button type="button" onClick={() => setParticipants(prev => [...prev, emptyParticipant()])} className="w-full mt-6 py-4 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold uppercase tracking-widest text-sm hover:border-[#2E75B6] hover:text-[#2E75B6] transition-colors bg-white">
                        <Plus className="w-5 h-5" /> Add performer
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 5 — Review & submit ──────────────────────────────────── */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10 pb-6 border-b border-gray-100">
              <h2 className="font-display font-black text-3xl text-[#0a0a0a] uppercase tracking-tight">Final Review</h2>
              <p className="text-gray-500 font-medium mt-2">Verify your information before submitting.</p>
            </div>

            <div className="bg-[#fafafa] rounded-[2rem] p-8 sm:p-12 border border-gray-100 mb-10">
              <div className="grid sm:grid-cols-2 gap-y-8 gap-x-12">
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Dancer</span><p className="font-black text-xl text-[#0a0a0a] mt-1">{contestantName}</p></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Age</span><p className="font-black text-xl text-[#0a0a0a] mt-1">{computedAge}</p></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Studio</span><p className="font-bold text-lg text-gray-800 mt-1">{studioName}</p></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Teacher</span><p className="font-bold text-lg text-gray-800 mt-1">{teacherName}</p></div>
                
                <div className="sm:col-span-2 h-px bg-gray-200 my-2" />
                
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Category</span><p className="font-bold text-lg text-gray-800 mt-1">{category}</p></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Division</span><p className="font-bold text-lg text-gray-800 mt-1">{ageDivision}</p></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Ability</span><p className="font-bold text-lg text-gray-800 mt-1">{abilityLevel}</p></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Entry Type</span><p className="font-bold text-lg text-gray-800 mt-1">{groupSize}</p></div>
                
                <div className="sm:col-span-2 h-px bg-gray-200 my-2" />
                
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Song</span><p className="font-bold text-lg text-gray-800 mt-1">{songTitle} {artistName && <span className="text-gray-500 font-medium">— {artistName}</span>}</p></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Delivery</span><p className="font-bold text-lg text-gray-800 mt-1 capitalize">{musicDeliveryMethod === 'upload' ? 'Digital Upload' : 'USB'}</p></div>
                
                <div className="sm:col-span-2 h-px bg-gray-200 my-2" />
                
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Payment Method</span><p className="font-bold text-lg text-gray-800 mt-1">{paymentMethod}</p></div>
                <div><span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Fee</span><p className="font-black text-3xl text-[#2E75B6] mt-1">${totalFee.toFixed(2)}</p></div>
              </div>

              {needsParticipantTable(groupSize) && participants.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs">Performers</h4>
                  <div className="flex flex-wrap gap-3">
                    {participants.map((p, i) => (
                      <div key={i} className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-800 shadow-sm flex items-center gap-2">
                        <span className="text-[#2E75B6]">{i+1}.</span> {p.name} <span className="text-gray-400 font-medium font-mono text-xs ml-1">({p.age})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-8 shadow-sm">
              <label className="flex items-start gap-5 cursor-pointer group">
                <Checkbox checked={disclaimerAccepted} onCheckedChange={(v) => setDisclaimerAccepted(v === true)} className="mt-1 w-6 h-6 rounded-md data-[state=checked]:bg-[#0a0a0a] data-[state=checked]:border-[#0a0a0a]" />
                <div className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors space-y-3 leading-relaxed">
                  <p className="font-bold text-[#0a0a0a] text-lg mb-4">Disclaimer & Liability Waiver</p>
                  <p>TOPAZ, its owners, workers, or anyone associated with its organization will not be held responsible for the lost or damage of any property, whether the result of accident or other causes, and in addition assumes no responsibility for any loss, damage, or injury sustained by any contestant, parent, teacher, or spectator during the time of the competition.</p>
                  <p>By submitting this registration, you consent to photo and video recording of the performance by TOPAZ 2.0 LLC and authorize its use for promotional purposes.</p>
                  <p>You confirm that all information provided is accurate and that you have read and agree to all competition rules.</p>
                </div>
              </label>
            </div>

            {submitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-8 bg-gray-50 rounded-full p-2 border border-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#2E75B6]/10" style={{ width: `${uploadProgress}%` }} />
                <div className="relative z-10 flex justify-between items-center px-4 text-xs font-bold uppercase tracking-widest text-[#2E75B6]">
                  <span>{uploadProgress < 50 ? 'Uploading media...' : 'Securing entry...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Navigation buttons ────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-6 pt-6">
        <button type="button" onClick={back} disabled={step === 1 || submitting} className="flex items-center gap-2 font-bold text-gray-500 uppercase tracking-widest text-sm hover:text-[#0a0a0a] transition-colors disabled:opacity-30">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        
        {step < 5 ? (
          <button type="button" onClick={next} className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-[#0a0a0a] text-white font-bold rounded-full hover:bg-[#2E75B6] transition-all duration-300 uppercase tracking-widest text-sm shadow-xl hover:shadow-[#2E75B6]/30 hover:-translate-y-1">
            Next Step <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting || !disclaimerAccepted} className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-[#2E75B6] text-white font-black rounded-full hover:bg-[#1F4E78] transition-all duration-300 uppercase tracking-widest text-sm shadow-xl hover:shadow-[#2E75B6]/30 hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:shadow-none">
            {submitting ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
            ) : (
              'Complete Registration'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
