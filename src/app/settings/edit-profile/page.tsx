"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BackHeader from "../components/BackHeader";

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "13px 14px",
          borderRadius: "12px",
          border: "1.5px solid var(--color-border)",
          background: "var(--color-bg)",
          fontSize: "15px",
          color: "var(--color-text)",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
          fontFamily: "inherit",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--color-secondary)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
      />
      {hint && <p style={{ margin: "5px 0 0 2px", fontSize: "12px", color: "var(--color-text-muted)" }}>{hint}</p>}
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "Juan dela Cruz",
    username: "juandc",
    email: "juan@email.com",
    bio: "",
    phone: "",
  });

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 1200);
  };

  return (
    <div className="app-shell" style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "32px" }}>
        <BackHeader title="Edit Profile" subtitle="Update your personal info" />

        <div style={{ padding: "28px 24px" }}>

          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
            <div style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: avatar ? "transparent" : "linear-gradient(135deg, #a8d8f0 0%, #8ecfc4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              marginBottom: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            }}>
              {avatar ? (
                <Image
                  src={avatar}
                  alt="avatar"
                  width={90}
                  height={90}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  unoptimized
                />
              ) : (
                "👤"
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                background: "var(--color-secondary)",
                color: "white",
                border: "none",
                borderRadius: "20px",
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Change Photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
          </div>

          {/* Form */}
          <div style={{
            background: "var(--color-bg-card)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            marginBottom: "20px",
          }}>
            <Field label="Full Name" value={form.name} onChange={set("name")} placeholder="Your full name" />
            <Field label="Username" value={form.username} onChange={set("username")} placeholder="@username" hint="Used to identify you in the app" />
            <Field label="Email" value={form.email} onChange={set("email")} type="email" placeholder="your@email.com" />
            <Field label="Phone" value={form.phone} onChange={set("phone")} type="tel" placeholder="+63 9XX XXX XXXX" />

            <div>
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--color-text-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => set("bio")(e.target.value)}
                placeholder="A short bio about yourself..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--color-border)",
                  background: "var(--color-bg)",
                  fontSize: "15px",
                  color: "var(--color-text)",
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  marginBottom: 0,
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-secondary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>
          </div>

          {/* Save */}
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
                Saved!
              </>
            ) : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}