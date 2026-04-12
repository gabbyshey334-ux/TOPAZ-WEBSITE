import { useState } from 'react';
import { User, Mail, Phone, Tag, MessageSquare, Send, Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // Insert into Supabase — column name is 'name', not 'fullName'
    const { data: inserted, error: insertErr } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        subject: formData.subject || null,
        message: formData.message.trim(),
      })
      .select('id')
      .single();

    if (insertErr) {
      setSubmitError('Something went wrong sending your message. Please try again or email us directly at topaz2.0@yahoo.com.');
      setIsSubmitting(false);
      return;
    }

    // Fire notification email — non-blocking; insert already succeeded
    void (async () => {
      try {
        await supabase.functions.invoke('send-contact-notification', {
          body: {
            submissionId: inserted?.id,
            name: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim() || null,
            subject: formData.subject || null,
            message: formData.message.trim(),
          },
        });
      } catch (err) {
        console.warn('[ContactForm] send-contact-notification failed (non-fatal):', err);
      }
    })();

    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
    }, 5000);
  };

  const subjectOptions = [
    { value: '', label: 'Select a subject' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'registration', label: 'Registration Question' },
    { value: 'judging', label: 'Judging Information' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'other', label: 'Other' },
  ];

  if (isSuccess) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-12 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h3 className="font-display font-black text-2xl text-[#0a0a0a] mb-4 uppercase tracking-tight">
          Message Sent!
        </h3>
        <p className="text-gray-500 text-lg font-medium leading-relaxed">
          Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Full Name */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
            Full Name
          </label>
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full pl-14 pr-6 py-4 bg-white border rounded-2xl text-base transition-all font-medium ${
                errors.fullName
                  ? 'border-red-300 focus:border-red-500 ring-4 ring-red-50'
                  : 'border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm'
              } focus:outline-none`}
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={`w-full pl-14 pr-6 py-4 bg-white border rounded-2xl text-base transition-all font-medium ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 ring-4 ring-red-50'
                  : 'border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm'
              } focus:outline-none`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Phone */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
            Phone Number
          </label>
          <div className="relative group">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 000-0000"
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-base transition-all font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm"
            />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
            Inquiry Type
          </label>
          <div className="relative group">
            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full pl-14 pr-12 py-4 bg-white border rounded-2xl text-base appearance-none transition-all font-medium ${
                errors.subject
                  ? 'border-red-300 focus:border-red-500 ring-4 ring-red-50'
                  : 'border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm'
              } focus:outline-none cursor-pointer`}
            >
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          {errors.subject && (
            <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.subject}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
          Your Message
        </label>
        <div className="relative group">
          <MessageSquare className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us how we can help..."
            rows={6}
            className={`w-full pl-14 pr-6 py-5 bg-white border rounded-[2rem] text-base resize-none transition-all font-medium ${
              errors.message
                ? 'border-red-300 focus:border-red-500 ring-4 ring-red-50'
                : 'border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm'
            } focus:outline-none`}
          />
        </div>
        {errors.message && (
          <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.message}</p>
        )}
      </div>

      {/* Inline submit error */}
      {submitError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{submitError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary !py-5 text-lg shadow-2xl shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Transmitting...
          </>
        ) : (
          <>
            Send Message
            <Send className="w-5 h-5 ml-2" />
          </>
        )}
      </button>
    </form>
  );
};

// Helper for the dropdown icon
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default ContactForm;
