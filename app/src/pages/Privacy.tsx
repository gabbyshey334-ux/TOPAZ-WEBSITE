import LegalDocumentPage, { LegalSection } from '@/components/LegalDocumentPage';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <LegalDocumentPage title="Privacy Policy" updated="July 31, 2026">
      <LegalSection title="Who we are">
        <p>
          TOPAZ 2.0 LLC (&quot;TOPAZ 2.0,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the
          dancetopaz.com website and related competition registration and shop services. This Privacy Policy
          explains how we collect, use, and share information when you visit our site, register for a
          competition, join our mailing list, or purchase merchandise.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>Depending on how you use the site, we may collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-gray-800">Contact details</strong> — name, email address, phone number,
            mailing address, and studio affiliation.
          </li>
          <li>
            <strong className="text-gray-800">Registration details</strong> — dancer information, ages,
            routine and category selections, teacher/choreographer names, and payment-related notes you
            provide.
          </li>
          <li>
            <strong className="text-gray-800">Shop and order information</strong> — items ordered, shipping
            details, and order status. Payment card data is processed by our payment providers; we do not
            store full card numbers on our servers.
          </li>
          <li>
            <strong className="text-gray-800">Messages</strong> — content you send through contact or
            support forms.
          </li>
          <li>
            <strong className="text-gray-800">Technical data</strong> — IP address, browser type, device
            information, and pages visited (including via analytics tools such as Google Analytics, when
            enabled).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>We use personal information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Process competition registrations and communicate about events, schedules, and fees.</li>
          <li>Fulfill shop orders and respond to customer questions.</li>
          <li>Send competition news and updates when you join our mailing list (you may unsubscribe anytime).</li>
          <li>Operate, secure, and improve the website.</li>
          <li>Comply with legal obligations and protect the rights and safety of TOPAZ 2.0, dancers, and studios.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Sharing of information">
        <p>
          We do not sell your personal information. We may share information with service providers who
          help us run the site (for example hosting, email delivery, databases, analytics, and payment
          processors), and with competition operations tools such as our scoring system when needed to
          run an event. We may also disclose information if required by law or to protect our rights.
        </p>
      </LegalSection>

      <LegalSection title="Photos, video, and media">
        <p>
          By registering for or attending a TOPAZ 2.0 event, you (or a parent/guardian for a minor)
          acknowledge that performances and event activities may be photographed or recorded. TOPAZ 2.0
          LLC may use such media for promotional and archival purposes, consistent with our registration
          terms and event rules.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Our competitions serve dancers of many ages. Account and registration information for minors
          should be submitted by a parent, guardian, or authorized studio representative. We do not
          knowingly collect personal information directly from children under 13 without appropriate
          adult involvement.
        </p>
      </LegalSection>

      <LegalSection title="Data retention and security">
        <p>
          We retain information as long as needed for competition operations, record-keeping, and legal
          requirements. We use reasonable administrative and technical safeguards, but no method of
          transmission or storage is completely secure.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You may request access to or correction of your contact information, ask us to remove you from
          marketing emails, or raise privacy questions by contacting us. Event and registration records
          may need to be retained for operational or legal reasons even after a marketing opt-out.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          TOPAZ 2.0 LLC
          <br />
          PO BOX 131, Banks, OR 97106
          <br />
          Email:{' '}
          <a href="mailto:topaz2.0@yahoo.com" className="font-medium text-[#2E75B6] hover:underline">
            topaz2.0@yahoo.com
          </a>
          <br />
          Or use our{' '}
          <Link to="/contact" className="font-medium text-[#2E75B6] hover:underline">
            Contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
