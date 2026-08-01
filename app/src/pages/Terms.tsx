import LegalDocumentPage, { LegalSection } from '@/components/LegalDocumentPage';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <LegalDocumentPage title="Terms of Service" updated="July 31, 2026">
      <LegalSection title="Agreement">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of dancetopaz.com and related
          services operated by TOPAZ 2.0 LLC (&quot;TOPAZ 2.0,&quot; &quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;), including competition information, online registration, mailing list signup,
          and merchandise purchases. By using the site or submitting a registration or order, you agree
          to these Terms.
        </p>
      </LegalSection>

      <LegalSection title="Who may use the site">
        <p>
          You must be able to form a binding contract under applicable law. If you register a dancer who
          is a minor, you represent that you are a parent, guardian, or authorized studio representative
          with authority to agree to these Terms on their behalf.
        </p>
      </LegalSection>

      <LegalSection title="Competition registration">
        <p>
          Registration is subject to event-specific deadlines, fees, categories, and rules published on
          this website (including the{' '}
          <Link to="/rules" className="font-medium text-[#2E75B6] hover:underline">
            Rules
          </Link>{' '}
          and{' '}
          <Link to="/schedule" className="font-medium text-[#2E75B6] hover:underline">
            Events
          </Link>{' '}
          pages). Submitting a form does not guarantee acceptance until fees are received and TOPAZ 2.0
          confirms the entry as required for that event.
        </p>
        <p>
          TOPAZ 2.0 reserves the right to cancel a competition or adjust scheduling when necessary (for
          example due to insufficient entries or circumstances beyond our control). Refund and
          cancellation policies for a given event are described in the event materials and rules then in
          effect.
        </p>
      </LegalSection>

      <LegalSection title="Payments">
        <p>
          Fees for registration and merchandise must be paid by the methods we accept (such as cash,
          check, credit card, or Zelle, as listed for each flow). You are responsible for providing
          accurate payment and contact information. Unpaid or incomplete registrations may be held or
          cancelled.
        </p>
      </LegalSection>

      <LegalSection title="Shop orders">
        <p>
          Product descriptions, pricing, and availability may change. We may cancel or refuse an order
          if an item is unavailable, pricing is incorrect, or we suspect fraud or misuse. Shipping
          timelines are estimates unless otherwise stated.
        </p>
      </LegalSection>

      <LegalSection title="Media and promotional use">
        <p>
          By registering for or attending a TOPAZ 2.0 competition, you consent to photo and video
          recording of performances and related event activities by TOPAZ 2.0 LLC and authorize
          reasonable use of that media for promotional and archival purposes, as further described in
          registration materials.
        </p>
      </LegalSection>

      <LegalSection title="Assumption of risk and limitation of liability">
        <p>
          Dance competitions involve physical activity and inherent risks. To the fullest extent
          permitted by law, TOPAZ 2.0, its owners, workers, and anyone associated with its organization
          are not responsible for loss or damage to property, whether from accident or other causes, and
          assume no responsibility for injury sustained by any contestant, parent, teacher, or spectator
          during the competition.
        </p>
        <p>
          The website and services are provided &quot;as is.&quot; To the fullest extent permitted by
          law, TOPAZ 2.0 disclaims warranties not expressly stated in writing, and our total liability
          arising from your use of the site or services will not exceed the fees you paid to us for the
          specific registration or order giving rise to the claim.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          You agree not to misuse the site, attempt unauthorized access, interfere with other users, or
          submit false or misleading registration or order information. We may suspend access or cancel
          submissions that violate these Terms.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          Site content, branding, logos, and materials are owned by TOPAZ 2.0 LLC or its licensors. You
          may not copy or reuse them for commercial purposes without our prior written permission.
        </p>
      </LegalSection>

      <LegalSection title="Privacy">
        <p>
          Our collection and use of personal information is described in our{' '}
          <Link to="/privacy" className="font-medium text-[#2E75B6] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these Terms from time to time. The &quot;Last updated&quot; date at the top of
          this page will change when we do. Continued use of the site after updates constitutes
          acceptance of the revised Terms.
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
