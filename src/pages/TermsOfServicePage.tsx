import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import HomeFooter from "../components/home/HomeFooter";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using mariabadari.com (the "Site"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our Site.

We reserve the right to update these terms at any time. Continued use of the Site after changes are posted constitutes your acceptance of the revised terms.`,
  },
  {
    title: "2. Use of the Site",
    content: `You may use our Site for lawful purposes only. You agree not to:

• Use the Site in any way that violates applicable local, national, or international laws or regulations
• Transmit unsolicited or unauthorised advertising or promotional material
• Attempt to gain unauthorised access to any part of the Site or its related systems
• Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Site
• Use the Site to harm, threaten, or harass any person`,
  },
  {
    title: "3. Account Registration",
    content: `To access certain features of the Site, you may be required to create an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain the security of your password and accept responsibility for all activity under your account
• Notify us immediately of any unauthorised use of your account
• Not share your account credentials with any third party

We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: "4. Intellectual Property",
    content: `All content on this Site — including text, images, graphics, logos, and software — is the property of Maria Badari or its content suppliers and is protected by applicable intellectual property laws.

You may not reproduce, distribute, modify, or create derivative works from any content on this Site without our prior written consent. Personal, non-commercial use of the Site does not grant you any ownership rights to its content.`,
  },
  {
    title: "5. Products and Services",
    content: `Maria Badari offers bridal consultancy services and dress customisation through this Site. All descriptions, pricing, and availability are subject to change without notice.

We reserve the right to refuse service, cancel orders, or limit quantities at our sole discretion. Images of dresses and products are for illustrative purposes and actual items may vary slightly in colour or detail.`,
  },
  {
    title: "6. AI-Powered Features",
    content: `Our Site includes an AI-powered bridal consultant feature ("Isabella") designed to help you explore styles and preferences. Please note:

• Recommendations made by Isabella are suggestions only and do not constitute professional fashion or styling advice
• AI responses may not always be accurate or reflect current availability
• Final decisions regarding purchases or appointments remain entirely your own

We are not liable for any decisions made based on AI-generated recommendations.`,
  },
  {
    title: "7. Limitation of Liability",
    content: `To the fullest extent permitted by law, Maria Badari shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or its services.

Our total liability to you for any claim arising from these terms or your use of the Site shall not exceed the amount you paid to us in the 12 months preceding the claim.`,
  },
  {
    title: "8. Third-Party Links",
    content: `Our Site may contain links to third-party websites. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.`,
  },
  {
    title: "9. Governing Law",
    content: `These Terms of Service shall be governed by and construed in accordance with applicable law. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the relevant courts.`,
  },
  {
    title: "10. Contact",
    content: `If you have any questions about these Terms of Service, please contact us at:

**Maria Badari**
Email: legal@mariabadari.com

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

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.scrollbarWidth = "none";
    const style = document.createElement("style");
    style.id = "hide-scrollbar-terms";
    style.textContent = "html::-webkit-scrollbar { display: none; }";
    document.head.appendChild(style);
    return () => {
      document.documentElement.style.scrollbarWidth = "";
      document.getElementById("hide-scrollbar-terms")?.remove();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
    >
      <Header subtitle="Your Dream dress Awaits" />

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
            Legal
          </p>
          <h1 className="text-4xl font-light text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
            Terms of Service
          </h1>
          <div className="w-12 h-px bg-stone-300 dark:bg-stone-700 mb-4" />
          <p className="text-sm text-stone-400 dark:text-stone-500">
            Last updated: April 2026
          </p>
          <p className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed">
            Please read these Terms of Service carefully before using our website.
            By accessing mariabadari.com, you agree to be bound by the terms described below.
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
          transition={{ delay: 1.0 }}
          className="mt-16 p-6 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
        >
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center leading-relaxed">
            These Terms of Service apply to{" "}
            <span className="text-stone-700 dark:text-stone-300 font-medium">mariabadari.com</span>.
            By using our site, you acknowledge that you have read and understood these terms.
          </p>
        </motion.div>
      </main>

      <HomeFooter />
    </motion.div>
  );
}
