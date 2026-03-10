import { Link } from 'react-router-dom';
import { Download, FileText, Send } from 'lucide-react';

const registrationPdfUrl = `${import.meta.env.BASE_URL}pdfs/topaz-registration-form.pdf`;

const Registration = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#0a0a0a] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#0a0a0a]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-20">
          <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl text-white mb-4">
            Registration
          </h1>
          <p className="text-white/70 text-lg md:text-xl">Join The Return of TOPAZ 2.0</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Disclaimer */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6 mb-10">
          <p className="text-gray-800 text-center text-base">
            <strong>Note:</strong> Mailing address is only required for certain competitions.
            Please check specific competition requirements before submitting your form.
          </p>
        </div>

        {/* Download Form */}
        <div className="text-center mb-14">
          <a
            href={registrationPdfUrl}
            download="TOPAZ-Registration-Form.pdf"
            className="inline-flex items-center gap-3 btn-primary !px-10 !py-5 text-lg shadow-lg"
          >
            <Download className="w-6 h-6" />
            Download Registration Form (PDF)
          </a>
          <p className="mt-4 text-gray-500 text-sm">
            Download the full form above to complete and submit.
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-8 border-t border-gray-200 pt-10">
          <h2 className="font-display font-bold text-2xl text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#2E75B6]" />
            How to Register
          </h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-600 leading-relaxed">
            <li>Download the registration form using the button above.</li>
            <li>Print and fill out all required sections. Include mailing address only if the competition requires it.</li>
            <li>Submit your completed form and payment by the competition deadline. Check the Schedule page for event-specific deadlines.</li>
            <li>For payment and submission details, contact us at Topaz2.0@yahoo.com or call 971-299-4401.</li>
          </ol>

          <h2 className="font-display font-bold text-2xl text-gray-900 flex items-center gap-2 mt-12">
            <Send className="w-7 h-7 text-[#2E75B6]" />
            Where to Submit
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Mail completed forms and payment to: <strong>Topaz 2.0 LLC, PO BOX 131, BANKS, OR 97106</strong>.
            For electronic submission or questions, email <a href="mailto:Topaz2.0@yahoo.com" className="text-[#2E75B6] hover:underline">Topaz2.0@yahoo.com</a> or call <a href="tel:971-299-4401" className="text-[#2E75B6] hover:underline">971-299-4401</a>.
          </p>

          <div className="pt-8">
            <Link
              to="/schedule"
              className="inline-flex items-center gap-2 text-[#2E75B6] font-bold hover:underline"
            >
              View competition schedule and deadlines
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
