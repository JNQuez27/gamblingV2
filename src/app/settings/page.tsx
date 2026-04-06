"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import BackHeader from "./components/BackHeader";
import SectionHeader from "./components/SectionHeader";
import Toggle from "./components/Toggle";
import SettingsRow from "./components/SettingsRow";
import { defaultToggleSettings, privacyDefaults } from "./data";
import { styles } from "./styles";

export default function SettingsPage() {
  const router = useRouter();
  const [toggles, setToggles] = useState(defaultToggleSettings);

  const [privacy, setPrivacy] = useState(privacyDefaults);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleItem = (key: string) => {
    setToggles((prev) => prev.map((t) => (t.key === key ? { ...t, value: !t.value } : t)));
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="app-shell" style={styles.appShell}>
      <div style={styles.pageContent}>
        <BackHeader title="Settings" subtitle="Manage your preferences" />

        <div style={styles.contentWrap}>

          {/* Account */}
          <SectionHeader>Account</SectionHeader>
          <div style={styles.card}>
            <SettingsRow
              icon="👤"
              label="Edit Profile"
              desc="Name, email, avatar"
              onClick={() => router.push("/settings/edit-profile")}
            />
            <SettingsRow
              icon="🔑"
              label="Change Password"
              desc="Update your security"
              onClick={() => router.push("/settings/change-password")}
            />
            <SettingsRow
              icon="📧"
              label="Connected Accounts"
              desc="Google, Facebook"
              showDivider={false}
              onClick={() => router.push("/settings/connected-accounts")}
            />
          </div>

          {/* Notifications */}
          <SectionHeader>Notifications</SectionHeader>
          <div style={styles.card}>
            {toggles.map((t, i) => (
              <div
                key={t.key}
                style={{
                  ...styles.toggleRow,
                  borderBottom: i < toggles.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <div style={styles.toggleRowContent}>
                  <p style={styles.toggleLabel}>{t.label}</p>
                  <p style={styles.toggleDesc}>{t.desc}</p>
                </div>
                <Toggle value={t.value} onChange={() => toggleItem(t.key)} />
              </div>
            ))}
          </div>

          {/* Privacy */}
          <SectionHeader>Privacy & Security</SectionHeader>
          <div style={styles.card}>
            <div style={{ ...styles.toggleRow, borderBottom: "1px solid var(--color-border)" }}>
              <div style={styles.toggleRowContent}>
                <p style={styles.toggleLabel}>Biometric Lock</p>
                <p style={styles.toggleDesc}>Require Face ID or fingerprint</p>
              </div>
              <Toggle
                value={privacy.biometric}
                onChange={() => setPrivacy((p) => ({ ...p, biometric: !p.biometric }))}
              />
            </div>
            <div style={{ ...styles.toggleRow, borderBottom: "1px solid var(--color-border)" }}>
              <div style={styles.toggleRowContent}>
                <p style={styles.toggleLabel}>Anonymous Analytics</p>
                <p style={styles.toggleDesc}>Help us improve the app</p>
              </div>
              <Toggle
                value={privacy.analytics}
                onChange={() => setPrivacy((p) => ({ ...p, analytics: !p.analytics }))}
              />
            </div>
            <SettingsRow icon="📋" label="Privacy Policy" showDivider={false} onClick={() => {}} />
          </div>

          {/* General */}
          <SectionHeader>General</SectionHeader>
          <div style={styles.card}>
            <SettingsRow icon="🌐" label="Language" desc="English" onClick={() => {}} />
            <SettingsRow icon="🌙" label="Appearance" desc="Light mode" onClick={() => {}} />
            <SettingsRow icon="💾" label="Export Data" desc="Download your diary & logs" onClick={() => {}} />
            <SettingsRow
              icon="❓"
              label="Help & Support"
              desc="FAQs, contact us, send feedback"
              onClick={() => router.push("/settings/help-support")}
            />
            <SettingsRow icon="⭐" label="Rate the App" showDivider={false} onClick={() => {}} />
          </div>

          {/* Danger zone */}
          <SectionHeader>Account Actions</SectionHeader>
          <div style={styles.card}>
            <SettingsRow icon="🚪" label="Log Out" danger onClick={handleLogout} />
            <SettingsRow
              icon="🗑️"
              label="Delete Account"
              desc="This action cannot be undone"
              danger
              showDivider={false}
              onClick={() => setShowDeleteModal(true)}
            />
          </div>

          {/* App version */}
          <p style={styles.versionText}>
            Reflect v1.0.0 • Made with care
          </p>

        </div>
      </div>

      {/* Delete account confirmation modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalSheet}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIcon}>🗑️</div>
              <h2 style={styles.modalTitle}>
                Delete your account?
              </h2>
              <p style={styles.modalText}>
                All your data, streaks, and history will be permanently removed. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                router.push("/login");
              }}
              style={styles.modalPrimaryButton}
            >
              Yes, Delete My Account
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={styles.modalSecondaryButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}