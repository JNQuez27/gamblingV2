"use client";

import { useState } from "react";
import BackHeader from "../components/BackHeader";

type Account = {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  email?: string;
  color: string;
};

const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function ConnectedAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "google",
      name: "Google",
      icon: <GoogleIcon />,
      connected: true,
      email: "juan@gmail.com",
      color: "#f8f9ff",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <FacebookIcon />,
      connected: false,
      color: "#f0f4ff",
    },
  ]);

  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null);

  const toggle = (id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;

    if (account.connected) {
      setConfirmDisconnect(id);
    } else {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, connected: true, email: `user@${id}.com` } : a
        )
      );
    }
  };

  const disconnect = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, connected: false, email: undefined } : a))
    );
    setConfirmDisconnect(null);
  };

  return (
    <div className="app-shell" style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "32px" }}>
        <BackHeader title="Connected Accounts" subtitle="Manage your linked accounts" />

        <div style={{ padding: "28px 24px" }}>

          {/* Info banner */}
          <div style={{
            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            borderRadius: "14px",
            padding: "14px 16px",
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>🔗</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#15803d", lineHeight: "1.5" }}>
              Linking accounts lets you sign in quickly and securely without a password.
            </p>
          </div>

          <div style={{
            background: "var(--color-bg-card)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            marginBottom: "24px",
          }}>
            {accounts.map((account, i) => (
              <div
                key={account.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px",
                  borderBottom: i < accounts.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: account.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid var(--color-border)",
                }}>
                  {account.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--color-text)" }}>
                    {account.name}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: account.connected ? "#16a34a" : "var(--color-text-muted)" }}>
                    {account.connected ? account.email ?? "Connected" : "Not connected"}
                  </p>
                </div>

                <button
                  onClick={() => toggle(account.id)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "20px",
                    border: account.connected ? "1.5px solid #fca5a5" : "1.5px solid var(--color-secondary)",
                    background: account.connected ? "#fef2f2" : "var(--color-secondary)",
                    color: account.connected ? "#dc2626" : "white",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {account.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--color-text-muted)", lineHeight: "1.6" }}>
            Disconnecting an account won&apos;t delete your data. You can always reconnect later.
          </p>
        </div>
      </div>

      {/* Confirm disconnect modal */}
      {confirmDisconnect && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "flex-end",
          zIndex: 100,
        }}>
          <div style={{
            background: "var(--color-bg-card)",
            borderRadius: "24px 24px 0 0",
            padding: "28px 24px 40px",
            width: "100%",
            boxSizing: "border-box",
          }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>⚠️</div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 8px" }}>
                Disconnect {accounts.find((a) => a.id === confirmDisconnect)?.name}?
              </h2>
              <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.5" }}>
                You&apos;ll need to use your email and password to sign in.
              </p>
            </div>
            <button
              onClick={() => disconnect(confirmDisconnect)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "#dc2626",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              Yes, Disconnect
            </button>
            <button
              onClick={() => setConfirmDisconnect(null)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "var(--color-bg)",
                color: "var(--color-text-muted)",
                fontSize: "15px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}