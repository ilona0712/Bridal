import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import HomeFooter from "../components/home/HomeFooter";

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you use our website, we may collect the following types of information:

• **Account information**: When you sign up, we collect your name, email address, date of birth, and dress size to personalise your experience.
• **Usage data**: We collect information about how you interact with our site — pages visited, features used, and time spent — to help us improve our service.
• **Communications**: Messages you send through our Chat with Owner feature are stored to allow ongoing conversations and improve our support.
• **Device information**: We may collect your browser type, operating system, and IP address for security and analytics purposes.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

• Provide, maintain, and improve our services within Lebanon
• Personalise your experience and offer tailored dress recommendations
• Communicate with you about your orders, appointments, and enquiries
• Send you updates and promotional materials (only with your consent)
• Analyse usage patterns to enhance site performance
• Comply with Lebanese legal obligations and protect our rights`,
  },
  {
    title: "3. Cookies",
    content: `Our website uses cookies to store information on your computer. Cookies are small text files placed on your device that help us:

• Keep essential site functions working correctly
• Remember your preferences and settings
• Understand how visitors use our site through analytics

**Essential cookies** are required for the site to function and cannot be disabled. **Analytics cookies** are optional and help us understand usage trends — you can decline these when you first visit our site.

By continuing to use our site after accepting our cookie notice, you consent to the use of cookies as described in this policy.`,
  },
  {
    title: "4. Data Sharing",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your data with:

• **Service providers**: Trusted partners who assist us in operating our website (such as Supabase for authentication and database services), under strict confidentiality agreements.
• **Legal requirements**: If required by Lebanese law or by order of a Lebanese court or competent authority, or to protect our rights, safety, or the safety of others.
• **Business transfers**: In the event of a merger or acquisition, your data may be transferred as part of that transaction.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide you with our services. You may request deletion of your account and associated data at any time by contacting us.

Analytics data is retained in anonymised form for up to 24 months to help us identify long-term trends in site usage.`,
  },
  {
    title: "6. Your Rights",
    content: `As a user based in Lebanon, you have the following rights regarding your personal data:

• **Access**: Request a copy of the personal data we hold about you
• **Correction**: Request that we correct inaccurate or incomplete data
• **Deletion**: Request that we delete your personal data
• **Objection**: Object to our processing of your data for certain purposes
• **Portability**: Request that we transfer your data to another service

Lebanon does not currently have a comprehensive data protection law equivalent to international frameworks; however, we voluntarily uphold the above rights as part of our commitment to your privacy. To exercise any of these rights, please contact us using the details below.`,
  },
  {
    title: "7. Security",
    content: `We take reasonable technical and organisational measures to protect your personal information against unauthorised access, loss, or misuse. These include encrypted data transmission (HTTPS), secure authentication systems, and access controls.

However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`,
  },
  {
    title: "8. Lebanon-Specific Notice",
    content: `This website and its services are operated exclusively for users located in Lebanon. By using this site, you confirm that you are accessing it from within Lebanon.

We process your data in accordance with applicable Lebanese laws, including but not limited to the Lebanese Penal Code provisions relating to privacy, and any relevant regulations issued by Lebanese authorities. We are committed to complying with Lebanese consumer protection principles and handling your data responsibly.

If Lebanese data protection legislation is enacted or updated in the future, we will update this policy accordingly.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or Lebanese legal requirements. When we make significant changes, we will notify you by updating the date at the top of this page or by displaying a notice on our website.

We encourage you to review this policy periodically to stay informed about how we protect your information.`,
  },
  {
    title: "10. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us at:

**Maria Badari**
Email: privacy@mariabadari.com
Location: Lebanon

We aim to respond to all enquiries within 5 business days.`,
  },
];

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className={`mb-1 ${line.startsWith("•") ? "pl-2" : ""}`}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="font-semibold text-stone-800 dark:text-stone-200">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.scrollbarWidth = "none";
    const style = document.createElement("style");
    style.id = "hide-scrollbar-privacy";
    style.textContent = "html::-webkit-scrollbar { display: none; }";
    document.head.appendChild(style);
    return () => {
      document.documentElement.style.scrollbarWidth = "";
      document.getElementById("hide-scrollbar-privacy")?.remove();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
    >
      <Header subtitle="Your Dream Dress Awaits" />

      <main className="max-w-3xl mx-auto px-6 py-16">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors mb-10 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3 font-medium">
            Legal · Lebanon
          </p>
          <h1 className="text-4xl font-light text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <div className="w-12 h-px bg-stone-300 dark:bg-stone-700 mb-4" />
          <p className="text-sm text-stone-400 dark:text-stone-500">
            Last updated: April 2026
          </p>
          <p className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed">
            At Maria Badari, your privacy matters to us. This policy explains what information we collect,
            how we use it, and the choices you have regarding your data. This policy applies exclusively
            to users based in Lebanon.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="border-t border-stone-200 dark:border-stone-800 pt-8"
            >
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200 mb-4 tracking-tight">
                {section.title}
              </h2>
              <div className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed space-y-1">
                {renderContent(section.content)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-16 p-6 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
        >
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center leading-relaxed">
            This Privacy Policy applies to{" "}
            <span className="text-stone-700 dark:text-stone-300 font-medium">mariabadari.com</span>{" "}
            and is intended for users in <span className="text-stone-700 dark:text-stone-300 font-medium">Lebanon</span> only.
            By using our site, you acknowledge that you have read and understood this policy.
          </p>
        </motion.div>
      </main>

      <HomeFooter />
    </motion.div>
  );
}