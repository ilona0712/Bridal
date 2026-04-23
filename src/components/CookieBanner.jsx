import { createPortal } from "react-dom";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    pointerEvents: "none",
  },
  container: {
    position: "fixed",
    left: "50%",
    bottom: "max(16px, env(safe-area-inset-bottom))",
    transform: "translateX(-50%)",
    width: "min(560px, calc(100% - 32px))",
    zIndex: 10000, 
    pointerEvents: "auto",
    borderRadius: "12px",
    background: "var(--color-accent-primary, #8f5b6a)",
    color: "var(--color-text-inverse, #fff8f6)",
    boxShadow: "0 8px 32px rgba(52, 26, 26, 0.25)",
    padding: "20px 20px 16px",
    fontFamily: "inherit",
  },
  closeButton: {
    position: "absolute",
    top: "12px",
    right: "14px",
    background: "transparent",
    border: "none",
    color: "var(--color-text-inverse, #fff8f6)",
    cursor: "pointer",
    fontSize: "1.25rem",
    lineHeight: 1,
    padding: 0,
  },
  heading: {
    margin: "0 0 10px",
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
    color: "var(--color-text-inverse, #fff8f6)",
    paddingRight: "24px",
  },
  body: {
    margin: "0 0 10px",
    fontSize: "0.88rem",
    lineHeight: 1.55,
    color: "rgba(255, 248, 246, 0.88)",
  },
  policyLine: {
    margin: "0 0 16px",
    fontSize: "0.88rem",
    lineHeight: 1.55,
    color: "rgba(255, 248, 246, 0.88)",
  },
  policyLink: {
    color: "var(--color-text-inverse, #fff8f6)",
    textDecoration: "underline",
  },
  acceptButton: {
    background: "var(--color-text-inverse, #fff8f6)",
    color: "var(--color-accent-primary, #8f5b6a)",
    border: "2px solid var(--color-text-inverse, #fff8f6)",
    borderRadius: "8px",
    padding: "9px 20px",
    fontWeight: 600,
    fontSize: "0.92rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

export default function CookieBanner({ onAcceptAll, onRejectAll, onClose }) {
  const banner = (
    <div style={styles.overlay}>
      <section
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent banner"
        style={styles.container}
      >
        <button
          type="button"
          style={styles.closeButton}
          onClick={onClose ?? onRejectAll}
          aria-label="Close cookie banner"
        >
          ×
        </button>

        <h2 style={styles.heading}>
          This site uses cookies to store information on your computer.
        </h2>

        <p style={styles.body}>
          Some of these cookies are essential to make our site work and others
          help us to improve by giving us some insight into how the site is
          being used.
        </p>

        <p style={styles.policyLine}>
          By using our site you accept the terms of our{" "}
          <a href="/privacy-policy" style={styles.policyLink}>
            Privacy Policy
          </a>
          .
        </p>

        <button type="button" style={styles.acceptButton} onClick={onAcceptAll}>
          I Accept
        </button>
      </section>
    </div>
  );

  return createPortal(banner, document.body);
}