import { useState } from "react";
import { createPortal } from "react-dom";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2147483647,
    pointerEvents: "none",
  },
  container: {
    position: "fixed",
    left: "50%",
    bottom: "max(16px, env(safe-area-inset-bottom))",
    transform: "translateX(-50%)",
    width: "min(760px, calc(100% - 20px))",
    pointerEvents: "auto",
    borderRadius: "18px",
    border: "1px solid var(--color-border-primary, #e8d8d3)",
    background:
      "linear-gradient(120deg, var(--color-background-primary, #fffaf9) 0%, var(--color-background-secondary, #fff2ee) 100%)",
    color: "var(--color-text-primary, #3c2f2f)",
    boxShadow: "0 24px 60px rgba(52, 26, 26, 0.2)",
    padding: "18px 16px 14px",
    fontFamily: "inherit",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    left: "10px",
    width: "30px",
    height: "30px",
    borderRadius: "999px",
    border: "1px solid var(--color-border-primary, #d8c8c3)",
    background: "var(--color-background-primary, #fff)",
    color: "var(--color-text-primary, #3c2f2f)",
    cursor: "pointer",
    fontSize: "1.1rem",
    lineHeight: 1,
  },
  heading: {
    margin: "0 0 0 34px",
    fontSize: "1.03rem",
    fontWeight: 700,
    letterSpacing: "0.01em",
  },
  description: {
    margin: "9px 0 12px",
    fontSize: "0.92rem",
    lineHeight: 1.5,
    color: "var(--color-text-secondary, #5c4b4b)",
  },
  badges: {
    display: "flex",
    gap: "8px",
    marginBottom: "14px",
  },
  badge: {
    fontSize: "0.72rem",
    fontWeight: 700,
    borderRadius: "999px",
    padding: "4px 10px",
    border: "1px solid var(--color-border-primary, #dcc7c1)",
    color: "var(--color-text-primary, #4a3535)",
    background: "rgba(255, 255, 255, 0.68)",
    backdropFilter: "blur(4px)",
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid var(--color-border-primary, #e4cfc8)",
    background: "rgba(255, 255, 255, 0.62)",
    marginBottom: "10px",
  },
  toggleLabelWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  toggleTitle: {
    fontWeight: 600,
    fontSize: "0.92rem",
    color: "var(--color-text-primary, #18181b)",
  },
  toggleHint: {
    fontSize: "0.8rem",
    color: "var(--color-text-secondary, #644d4d)",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  button: {
    border: "1px solid var(--color-border-primary, #ddc6bf)",
    borderRadius: "10px",
    padding: "10px 12px",
    fontWeight: 600,
    cursor: "pointer",
    background: "rgba(255, 255, 255, 0.72)",
    color: "var(--color-text-primary, #3a2f2f)",
  },
  acceptButton: {
    background: "var(--color-accent-primary, #8f5b6a)",
    color: "var(--color-text-inverse, #fff8f6)",
    border: "1px solid var(--color-accent-primary, #8f5b6a)",
  },
  link: {
    marginTop: "10px",
    display: "inline-block",
    color: "var(--color-link, #2563eb)",
    fontSize: "0.84rem",
    textDecoration: "underline",
  },
};

export default function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onSavePreferences,
  onClose,
}) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  const savePreferences = () => {
    onSavePreferences({
      necessary: true,
      analytics: analyticsEnabled,
    });
  };

  const rejectAll = () => {
    setAnalyticsEnabled(false);
    onRejectAll();
  };

  const banner = (
    <div style={styles.overlay}>
    <section role="dialog" aria-live="polite" aria-label="Cookie consent banner" style={styles.container}>
      <button type="button" style={styles.closeButton} onClick={onClose ?? rejectAll} aria-label="Close cookie banner">
        ×
      </button>
      <h2 style={styles.heading}>Cookie Preferences</h2>
      <p style={styles.description}>
        We use essential cookies for site functionality and optional analytics cookies to improve performance.
      </p>

      <div style={styles.badges}>
        <span style={styles.badge}>GDPR</span>
        <span style={styles.badge}>CCPA</span>
      </div>

      <div style={styles.toggleRow}>
        <div style={styles.toggleLabelWrap}>
          <span style={styles.toggleTitle}>Necessary</span>
          <span style={styles.toggleHint}>Required for security and core functionality</span>
        </div>
        <input type="checkbox" checked disabled aria-label="Necessary cookies enabled" />
      </div>

      <div style={styles.toggleRow}>
        <div style={styles.toggleLabelWrap}>
          <span style={styles.toggleTitle}>Analytics</span>
          <span style={styles.toggleHint}>Helps us understand usage trends</span>
        </div>
        <input
          type="checkbox"
          checked={analyticsEnabled}
          onChange={(event) => setAnalyticsEnabled(event.target.checked)}
          aria-label="Analytics cookies toggle"
        />
      </div>

      <div style={styles.actions}>
        <button type="button" style={{ ...styles.button, ...styles.acceptButton }} onClick={onAcceptAll}>
          Accept all
        </button>
        <button type="button" style={styles.button} onClick={savePreferences}>
          Save preferences
        </button>
        <button type="button" style={styles.button} onClick={rejectAll}>
          Reject all
        </button>
      </div>

      <a href="/privacy-policy" style={styles.link}>
        Read our Privacy Policy
      </a>
    </section>
    </div>
  );

  return createPortal(banner, document.body);
}
