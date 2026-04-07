import CompetitionRegistrationForm from '@/components/registration/CompetitionRegistrationForm';
import { Link } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';

const Registration = () => {
  const registrationPdfUrl = `${import.meta.env.BASE_URL}pdfs/topaz-registration-form.pdf`;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-[#0a0a0a] min-h-[50vh] overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop"
            className="w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <p className="font-mono text-primary font-bold tracking-[0.3em] uppercase mb-4">Season 2026</p>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tighter uppercase mb-6">
            Competition <span className="text-primary italic">Registration</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
            Complete the online entry form below, or download the PDF to register by mail.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={registrationPdfUrl}
              download="TOPAZ-Registration-Form.pdf"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/15 text-sm uppercase tracking-wider"
            >
              <Download className="w-4 h-4" />
              PDF form
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 text-white/80 font-bold text-sm uppercase tracking-wider hover:text-white"
            >
              <FileText className="w-4 h-4" />
              Contact
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <CompetitionRegistrationForm />
      </section>
    </div>
  );
};

export default Registration;
