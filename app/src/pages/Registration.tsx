import { useState } from 'react';
import { 
  Download, 
  FileText, 
  Send, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
  CheckCircle2
} from 'lucide-react';

const Registration = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const registrationPdfUrl = `${import.meta.env.BASE_URL}pdfs/topaz-registration-form.pdf`;

  const faqs = [
    {
      question: 'Can I register on competition day?',
      answer: 'No. All registrations must be received by email before July 22, 2026, 12:00 AM. NO day-of-event registration is accepted. Plan ahead and submit in time.'
    },
    {
      question: 'Can I register multiple entries?',
      answer: 'Yes. Submit a separate registration form for each routine by email to topaz2.0@yahoo.com before the deadline. Fees are per entry or per person as listed in the Entry Fees section and on the official PDF.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept cash, check, credit card, and PayPal. Checks should be made payable to Topaz 2.0 LLC. Include payment details with your email submission.'
    },
    {
      question: 'Can I make changes after submitting?',
      answer: 'Yes, please contact us at topaz2.0@yahoo.com before the registration deadline (July 22, 2026, 12:00 AM) to request changes to your entry.'
    },
    {
      question: 'What if I miss the deadline?',
      answer: 'Registrations are not accepted after the deadline. All entries must be received by email at topaz2.0@yahoo.com before July 22, 2026, 12:00 AM. There are no exceptions and no late or day-of-event registration.'
    },
    {
      question: 'Do I need to register for each category separately?',
      answer: 'Yes, each routine requires a separate registration form. Email all forms to topaz2.0@yahoo.com before the deadline for proper scheduling and judging.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* SECTION 1: HERO */}
      <section className="relative bg-[#0a0a0a] min-h-screen overflow-hidden flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop"
            className="w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="font-mono text-primary font-bold tracking-[0.3em] uppercase mb-6">
            Season 2026
          </p>
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-[8rem] text-white leading-[0.85] tracking-tighter uppercase mb-8">
            Competition <span className="text-primary italic">Registration</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-8" />
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Join The Return of TOPAZ 2.0<br/>
            <span className="text-white/60 text-lg mt-2 block">August 22, 2026 • Seaside Convention Center</span>
          </p>

          <a
            href={registrationPdfUrl}
            download="TOPAZ-Registration-Form.pdf"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#1F4E78] font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-xl text-lg group"
          >
            <Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            Download Registration Form
          </a>
        </div>
      </section>

      {/* SECTION 2: DOWNLOAD FORM SECTION */}
      <section className="py-20 -mt-10 relative z-20">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Featured Download Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center mb-12 border border-gray-100">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <FileText className="w-12 h-12 text-[#2E75B6]" />
            </div>
            
            <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
              Official Registration Form
            </h2>
            
            <p className="text-gray-600 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
              Download, complete, and email this form to topaz2.0@yahoo.com to secure your spot in the competition.
            </p>
            
            <a
              href={registrationPdfUrl}
              download="TOPAZ-Registration-Form.pdf"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#2E75B6] text-white font-bold rounded-xl hover:bg-[#1F4E78] transition-all shadow-lg hover:shadow-xl mb-6 transform hover:-translate-y-1"
            >
              <Download className="w-6 h-6" />
              Download Registration Form (PDF)
            </a>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400 font-medium">
              <span>PDF - 2.3 MB</span>
              <span>•</span>
              <span>Last updated: March 2026</span>
            </div>
          </div>

          {/* SECTION 3: DISCLAIMER BOX */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 lg:p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="bg-amber-100 p-3 rounded-full flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-amber-900 mb-2">Important Notice</h3>
                <p className="text-amber-800 leading-relaxed">
                  Mailing address is only required for certain competitions. 
                  Please check specific competition requirements before submitting.
                </p>
              </div>
            </div>
          </div>

          {/* DEADLINE WARNING BOX */}
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 lg:p-8 mb-16 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-900 mb-2">Registration Deadline — No Exceptions</h3>
                <p className="text-red-800 leading-relaxed mb-4">
                  All registrations must be received by email at <strong>topaz2.0@yahoo.com</strong> before <strong>July 22, 2026, 12:00 AM</strong>. 
                  NO late registration. NO day-of-event registration. Email submissions only. Plan ahead!
                </p>
                <p className="text-red-700 text-sm font-semibold">
                  Registration closes strictly at the deadline. We cannot accept entries after this time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW TO REGISTER */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl text-gray-900 mb-4">
              How to Register
            </h2>
            <p className="text-gray-500 text-lg mb-4">Follow these steps and submit by email before the deadline.</p>
            <p className="text-red-600 font-semibold text-sm max-w-2xl mx-auto">
              You must complete registration before July 22, 2026, 12:00 AM. No registration on competition day.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center group p-6 rounded-3xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Download className="w-10 h-10 text-[#2E75B6]" />
              </div>
              <h3 className="font-display font-bold text-xl mb-4 text-gray-900">1. Download Form</h3>
              <p className="text-gray-600 leading-relaxed">
                Download the registration form above and fill out all required fields for your entry type.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group p-6 rounded-3xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <FileText className="w-10 h-10 text-[#2E75B6]" />
              </div>
              <h3 className="font-display font-bold text-xl mb-4 text-gray-900">2. Prepare Materials</h3>
              <p className="text-gray-600 leading-relaxed">
                Gather high-resolution photos of contestants, your music file (MP3), and payment information.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group p-6 rounded-3xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Send className="w-10 h-10 text-[#2E75B6]" />
              </div>
              <h3 className="font-display font-bold text-xl mb-4 text-gray-900">3. Submit</h3>
              <p className="text-gray-600 leading-relaxed">
                Email your completed form and materials to <span className="text-[#2E75B6] font-semibold">topaz2.0@yahoo.com</span>. This is the only way to submit your registration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: REGISTRATION DETAILS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Left Column: Requirements */}
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[#2E75B6]" />
                </div>
                <h3 className="font-display font-bold text-2xl text-gray-900">What You'll Need</h3>
              </div>
              <ul className="space-y-6">
                {[
                  'Completed registration form',
                  'High-resolution photo of all contestants',
                  'Music selection (MP3, WAV, or CD)',
                  'Payment (check, cash, or credit card)',
                  'Parent/guardian signature (for minors)',
                  'Submit completed form and materials by email to topaz2.0@yahoo.com'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Entry Fees */}
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#2E75B6]" />
                </div>
                <h3 className="font-display font-bold text-2xl text-gray-900">Entry Fees</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Official rates also appear on the registration PDF. Duo, trio, and groups are priced <strong>per person</strong> unless noted; solo is <strong>per entry</strong>.
              </p>
              <ul className="space-y-5">
                {[
                  { label: 'Solo', price: '$100 per entry' },
                  { label: 'Duo', price: '$80 per person', note: '($160 total for 2)' },
                  { label: 'Trio', price: '$70 per person', note: '($210 total for 3)' },
                  { label: 'Small Group (4–10)', price: '$60 per person' },
                  { label: 'Large Group (11+)', price: '$60 per person' },
                  { label: 'Production', price: '$60 per person' },
                ].map((item, i) => (
                  <li key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-gray-800 font-semibold">{item.label}</span>
                      <span className="font-bold text-[#2E75B6] text-right">
                        {item.price}
                        {item.note ? (
                          <span className="block text-sm font-semibold text-gray-600 mt-0.5">{item.note}</span>
                        ) : null}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Sample totals</p>
                <ul className="space-y-2 text-sm text-gray-700 leading-snug">
                  <li>Solo: <strong className="text-[#2E75B6]">$100</strong></li>
                  <li>Duo (2 people): <strong className="text-[#2E75B6]">$160</strong> total ($80 × 2)</li>
                  <li>Trio (3 people): <strong className="text-[#2E75B6]">$210</strong> total ($70 × 3)</li>
                  <li>Small group (5 people): <strong className="text-[#2E75B6]">$300</strong> total ($60 × 5)</li>
                  <li>Large group (12 people): <strong className="text-[#2E75B6]">$720</strong> total ($60 × 12)</li>
                  <li>Production (15 people): <strong className="text-[#2E75B6]">$900</strong> total ($60 × 15)</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: IMPORTANT DATES */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl text-gray-900 mb-4">Important Dates</h2>
            <p className="text-gray-500 text-lg">Mark your calendar for these deadlines</p>
          </div>

          <div className="relative">
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 lg:-translate-x-1/2" />
            
            <div className="space-y-12">
              {[
                { label: 'Registration Opens', date: 'March 1, 2026', status: 'past' },
                { label: 'Registration Closes', date: 'July 22, 2026, 12:00 AM', desc: 'No exceptions. No day-of-event registration.', status: 'future', highlight: true },
                { label: 'Competition Day', date: 'August 22, 2026', status: 'future' }
              ].map((item, i) => (
                <div key={i} className={`relative flex items-center lg:justify-center ${i % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 bg-[#2E75B6]" />
                  
                  <div className={`ml-20 lg:ml-0 lg:w-[45%] ${i % 2 === 0 ? 'lg:text-left' : 'lg:text-right'}`}>
                    <div className={`inline-block p-6 rounded-2xl border ${item.highlight ? 'bg-[#2E75B6] text-white border-[#2E75B6] shadow-xl' : 'bg-white border-gray-100 shadow-md'}`}>
                      <h4 className={`font-bold text-lg mb-1 ${item.highlight ? 'text-white' : 'text-gray-900'}`}>{item.label}</h4>
                      <div className={`flex items-center gap-2 ${item.highlight ? 'text-blue-100' : 'text-[#2E75B6]'} font-semibold`}>
                        <Calendar className="w-4 h-4" />
                        <span>{item.date}</span>
                      </div>
                      {item.desc && (
                        <p className={`text-sm mt-2 ${item.highlight ? 'text-white/80' : 'text-gray-500'}`}>{item.desc}</p>
                      )}
                    </div>
                  </div>
                  <div className="hidden lg:block lg:w-[45%]" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-red-600 font-bold text-sm md:text-base">
              NO registrations accepted after July 22, 2026, 12:00 AM. NO day-of-event registration. Email only.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ ACCORDION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-lg">Common questions about registration</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <span className="text-lg font-bold text-gray-800 pr-8">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${openFaq === index ? 'rotate-180 bg-blue-50 text-[#2E75B6]' : 'text-gray-400'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-8 pb-8 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: CONTACT SUPPORT */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#1F4E78] rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="font-display font-bold text-3xl mb-4">Need Help?</h2>
              <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
                Contact us with any questions about the registration process. We typically respond within 24 hours.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                <a href="mailto:topaz2.0@yahoo.com" className="flex items-center gap-3 hover:text-blue-200 transition-colors bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm hover:bg-white/20">
                  <Mail className="w-5 h-5" />
                  <span className="font-semibold">topaz2.0@yahoo.com</span>
                </a>
                <a href="tel:971-299-4401" className="flex items-center gap-3 hover:text-blue-200 transition-colors bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm hover:bg-white/20">
                  <Phone className="w-5 h-5" />
                  <span className="font-semibold">971-299-4401</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: BOTTOM CTA */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display font-black text-4xl lg:text-5xl mb-6">Ready to Register?</h2>
          <p className="text-xl text-gray-400 mb-10">Join hundreds of dancers at TOPAZ 2.0</p>
          <a
            href={registrationPdfUrl}
            download="TOPAZ-Registration-Form.pdf"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#2E75B6] text-white font-bold rounded-xl hover:bg-[#1F4E78] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <Download className="w-6 h-6" />
            Download Registration Form
          </a>
        </div>
      </section>

    </div>
  );
};

export default Registration;
