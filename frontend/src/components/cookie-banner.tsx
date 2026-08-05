"use client";

import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "manmitra_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Small delay so it slides in after page paint
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop blur overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(9, 14, 12, 0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 9998,
          animation: "fadeIn 0.3s ease",
        }}
        aria-hidden="true"
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="true"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          width: "min(680px, calc(100vw - 2rem))",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(224,242,254,0.88) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(186, 216, 245, 0.7)",
          borderRadius: "1.25rem",
          boxShadow:
            "0 20px 60px -10px rgba(2,132,199,0.25), 0 8px 24px -4px rgba(56,189,248,0.15)",
          padding: "1.5rem 1.75rem",
          animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Icon pill */}
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(2,132,199,0.35)",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>🍪</span>
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
                color: "#0f172a",
                letterSpacing: "-0.01em",
              }}
            >
              We use cookies &amp; collect data
            </h2>
            <p
              style={{
                margin: "0.15rem 0 0",
                fontSize: "0.7rem",
                color: "#64748b",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              ManMitra · Data &amp; Privacy Notice
            </p>
          </div>
        </div>

        {/* Body */}
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            lineHeight: 1.65,
            color: "#334155",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ManMitra uses cookies and similar technologies to enhance your
          experience, remember your preferences, analyse app usage, and provide
          personalised mental-wellness insights. Your data is handled with care
          and never sold to third parties.{" "}
          <a
            href="/privacy"
            style={{
              color: "#0284c7",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Learn more →
          </a>
        </p>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button
            id="cookie-decline-btn"
            onClick={handleDecline}
            style={{
              padding: "0.55rem 1.25rem",
              borderRadius: "0.625rem",
              border: "1px solid rgba(186,216,245,0.9)",
              background: "rgba(255,255,255,0.7)",
              color: "#475569",
              fontSize: "0.875rem",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(224,242,254,0.9)";
              (e.currentTarget as HTMLButtonElement).style.color = "#0284c7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.7)";
              (e.currentTarget as HTMLButtonElement).style.color = "#475569";
            }}
          >
            Decline
          </button>

          <button
            id="cookie-accept-btn"
            onClick={handleAccept}
            style={{
              padding: "0.55rem 1.5rem",
              borderRadius: "0.625rem",
              border: "none",
              background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(2,132,199,0.4)",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 20px rgba(2,132,199,0.55)";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 14px rgba(2,132,199,0.4)";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
            }}
          >
            Accept All Cookies
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(2rem); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
