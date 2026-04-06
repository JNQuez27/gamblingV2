"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackHeader from "../components/BackHeader";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 700,
        color: "var(--color-text-muted)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "13px 46px 13px 14px",
            borderRadius: "12px",
            border: "1.5px solid var(--color-border)",
            background: "var(--color-bg)",
            fontSize: "15px",
            color: "var(--color-text)",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-secondary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
        <button
          onClick={() => setVisible((v) => !v)}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function StrengthBar({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "-10px", marginBottom: "18px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1,
            height: "4px",
            borderRadius: "2px",
            background: i <= strength ? colors[strength] : "var(--color-border)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{ margin: 0, fontSize: "12px", color: colors[strength], fontWeight: 600 }}>
        {labels[strength]}
      </p>
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const set = (key: string) => (v: string) => {
    setError("");
    setForm((f) => ({ ...f, [key]: v }));
  };

  const handleSave = () => {
    if (!form.current || !form.newPass || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.newPass !== form.confirm) {
      setError("New passwords don't match.");
      return;
    }
    if (form.newPass.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 1200);
  };

  return (
    <div className="app-shell" style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "32px" }}>
        <BackHeader title="Change Password" subtitle="Keep your account secure" />

        <div style={{ padding: "28px 24px" }}>

          {/* Security tip */}
          <div style={{
            background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            borderRadius: "14px",
            padding: "14px 16px",
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>🔒</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#1d4ed8", lineHeight: "1.5" }}>
              Use a mix of uppercase, numbers, and symbols for a strong password.
            </p>
          </div>

          <div style={{
            background: "var(--color-bg-card)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            marginBottom: "20px",
          }}>
            <PasswordField
              label="Current Password"
              value={form.current}
              onChange={set("current")}
              placeholder="Enter current password"
            />
            <PasswordField
              label="New Password"
              value={form.newPass}
              onChange={set("newPass")}
              placeholder="Enter new password"
            />
            <StrengthBar password={form.newPass} />
            <PasswordField
              label="Confirm New Password"
              value={form.confirm}
              onChange={set("confirm")}
              placeholder="Re-enter new password"
            />

            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "#dc2626",
                marginTop: "-4px",
              }}>
                {error}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "14px",
              background: saved ? "#22c55e" : "var(--color-secondary)",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "background 0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {saved ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Password Updated!
              </>
            ) : "Update Password"}
          </button>

          <button
            onClick={() => {}}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "14px",
              background: "none",
              color: "var(--color-secondary)",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              marginTop: "12px",
            }}
          >
            Forgot current password?
          </button>
        </div>
      </div>
    </div>
  );
}