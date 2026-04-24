import { useNavigate } from "react-router-dom";

const LAST_UPDATED = "April 24, 2025";
const CONTACT_EMAIL = "info@mariabadari.com";
const BRAND = "Maria Badari";
const PLATFORM = "Maria Badari Haute Couture";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="font-serif text-xl text-stone-800 dark:text-stone-100 mb-3 pb-2 border-b border-stone-200 dark:border-stone-700">
      {title}
    </h2>
    <div className="space-y-3 text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
      {children}
    </div>
  </section>
);

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Go back
        </button>

        <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-8 md:p-12">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-[#8f5b6a] font-medium mb-2">Legal</p>
            <h1 className="font-serif text-4xl text-stone-800 dark:text-stone-100 mb-3">Privacy Policy</h1>
            <p className="text-xs text-stone-400 dark:text-stone-500">Last updated: {LAST_UPDATED}</p>
          </div>

          <Section title="1. Who We Are">
            <p>
              <strong className="text-stone-700 dark:text-stone-300">{BRAND}</strong> operates the{" "}
              <strong className="text-stone-700 dark:text-stone-300">{PLATFORM}</strong> platform, a wedding
              dress discovery and customization service. We are the data controller responsible for your
              personal information collected through this website.
            </p>
            <p>
              If you have any questions about this policy or how we handle your data, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#8f5b6a] underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>When you create an account or use our platform, we collect the following personal data:</p>
            <ul className="mt-2 space-y-2">
              {[
                ["First & last name", "To identify you and personalise your experience"],
                ["Email address", "To manage your account and send you relevant communications"],
                ["Phone number", "To allow our team to contact you regarding your dress enquiry"],
                ["Country", "To understand your location and tailor service offerings"],
                ["Date of birth", "To verify eligibility and personalise recommendations"],
                ["Profile picture", "To display on your account profile"],
              ].map(([field, purpose]) => (
                <li key={field} className="flex gap-3">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-[#8f5b6a]/50 shrink-0 translate-y-1" />
                  <span>
                    <strong className="text-stone-700 dark:text-stone-300">{field}</strong> — {purpose}.
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2">
              We also collect usage data (pages visited, session duration) through cookies to improve our
              service, subject to your cookie consent.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use your personal data to:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Create and manage your account on the {PLATFORM} platform</li>
              <li>Connect you with our design team for dress consultations</li>
              <li>Personalise dress recommendations and your Isabella AI consultation</li>
              <li>Send you updates about your orders or enquiries</li>
              <li>Improve our website and service through anonymous analytics (only with your consent)</li>
            </ul>
            <p className="mt-2">
              We do not sell, rent, or share your personal data with third parties for their own marketing
              purposes.
            </p>
          </Section>

          <Section title="4. Legal Basis for Processing">
            <p>We process your personal data on the following legal bases:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>
                <strong className="text-stone-700 dark:text-stone-300">Contract performance</strong> — to
                provide the services you requested when creating an account
              </li>
              <li>
                <strong className="text-stone-700 dark:text-stone-300">Legitimate interests</strong> — to
                improve our platform and prevent fraud
              </li>
              <li>
                <strong className="text-stone-700 dark:text-stone-300">Consent</strong> — for optional
                analytics cookies, which you may withdraw at any time
              </li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain your personal data for as long as your account is active. If you delete your account,
              we will remove your personal data within 30 days, except where we are required to retain it
              by law (e.g. for accounting or legal dispute purposes).
            </p>
            <p>
              Profile pictures stored in our image storage are deleted alongside your account data.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use strictly necessary cookies to keep you logged in and make the site work. With your
              consent, we also use analytics cookies (Google Analytics) to understand how visitors use our
              site. You can change your cookie preferences at any time by clearing your browser cookies and
              revisiting the site.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your jurisdiction, you have the right to:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data ("right to be forgotten")</li>
              <li>Withdraw consent for analytics cookies at any time</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#8f5b6a] underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="8. Data Security">
            <p>
              Your data is stored securely using Supabase (PostgreSQL with row-level security) and is
              transmitted over HTTPS. Profile images are stored in access-controlled cloud storage. We
              apply industry-standard measures to protect your information from unauthorised access.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this policy from time to time. When we do, we will revise the "Last updated"
              date at the top. We encourage you to review this page periodically.
            </p>
          </Section>

          <div className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-700 text-center">
            <p className="text-xs text-stone-400 dark:text-stone-500">
              © {new Date().getFullYear()} {BRAND}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
