# BettingLog - System Test Cases

**Purpose.** Black-box system/functional test cases for BettingLog, for the
system-testing chapter. Each tester runs the steps on the release build and
fills **Actual Result** + **Status** (Pass/Fail) + **Remarks**.

**Environment:** Android release build (`npx expo run:android --variant release`),
Supabase project active, device online unless a case says otherwise.

**Legend:** Status = Pass / Fail / Blocked. Priority = High / Med / Low.

---

## 1. Authentication

### TC-01 - Sign up with email
- **Priority:** High
- **Precondition:** App installed; user logged out; email not already registered.
- **Test data:** first=`Juan`, last=`Cruz`, email=`tester01@example.com`, password=`Test@1234`
- **Steps:** 1) Open app -> Login. 2) Switch to Sign up. 3) Enter first/last/email/password. 4) Tap Sign up.
- **Expected:** Account created; routed to `onboarding/problem` (new user). No error.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-02 - Sign up with weak/invalid input
- **Priority:** Med
- **Precondition:** Logged out, on Sign up.
- **Test data:** email=`notanemail`, password=`123`
- **Steps:** Enter invalid email + short password; tap Sign up.
- **Expected:** Validation blocks submit / shows a clear error; no account created.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-03 - Log in with correct credentials
- **Priority:** High
- **Precondition:** Registered account (TC-01); logged out.
- **Test data:** `tester01@example.com` / `Test@1234`
- **Steps:** Enter email + password; tap Log in.
- **Expected:** Signed in; returning user lands on Home `(tabs)/home`.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-04 - Log in with wrong password
- **Priority:** High
- **Precondition:** Registered account; logged out.
- **Test data:** `tester01@example.com` / `WrongPass1`
- **Steps:** Enter email + wrong password; tap Log in.
- **Expected:** Message "Wrong email or password."; stays on Login.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-05 - Session persists after relaunch
- **Priority:** High
- **Precondition:** Logged in.
- **Steps:** Force-close the app; reopen it.
- **Expected:** App restores session and opens Home without asking to log in again.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-06 - Forgot / reset password
- **Priority:** Med
- **Precondition:** Registered account; logged out.
- **Steps:** Login -> Forgot password -> enter email -> open reset link from email -> set new password -> log in with it.
- **Expected:** Reset email received; new password works; old one rejected.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-07 - Log out
- **Priority:** High
- **Precondition:** Logged in.
- **Steps:** Settings -> Log Out. Then force-close and reopen.
- **Expected:** Returns to Login; reopening does NOT auto-sign-in (session cleared).
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

---

## 2. Onboarding

### TC-08 - Complete onboarding flow
- **Priority:** High
- **Precondition:** First sign-in (new account).
- **Steps:** Walk through problem (1) -> about-you: birthdate + gender (2) -> gambling-apps (3) -> protect: detection consent (4) -> baseline PGSI (5).
- **Expected:** Steps advance 1..5, progress shown; on finish lands on Home; entered data saved (name/demographics on Profile, PGSI baseline recorded).
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-09 - Skip an optional onboarding step
- **Priority:** Low
- **Precondition:** In onboarding.
- **Steps:** On a skippable step, tap Continue without entering data.
- **Expected:** Proceeds without error; no partial/invalid data saved.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

---

## 3. Daily check-in & streak

### TC-10 - Log a bet-free day
- **Priority:** High
- **Precondition:** Logged in, on Home.
- **Steps:** Pick a mood -> tap "Bet-free" for today's check-in.
- **Expected:** Check-in saved; streak increments; confirmation shown.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-11 - Log a gambled day
- **Priority:** High
- **Precondition:** Logged in.
- **Steps:** Pick a mood -> tap "I gambled".
- **Expected:** Saved; streak resets/handled per rules; supportive (non-judgmental) message.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

---

## 4. Diary

### TC-12 - Write a diary note
- **Priority:** High
- **Precondition:** Logged in, Diary tab.
- **Test data:** mood + text "Felt the urge but went for a walk."
- **Steps:** Compose a note (mood + text); save.
- **Expected:** Note appears under TODAY in the feed; a node is added to the Journey Map.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-13 - Journey Map scroll with many entries
- **Priority:** Med
- **Precondition:** Account with 100+ logged days (or seeded data).
- **Steps:** Open Diary; scroll the Journey Map; use the jump-rail.
- **Expected:** Scrolls smoothly, no crash, jump-rail navigates; day-detail card opens.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

---

## 5. Assessments

### TC-14 - Complete PGSI
- **Priority:** High
- **Precondition:** Logged in.
- **Steps:** Open assessment (PGSI, 9 items); answer all; submit.
- **Expected:** "N of 9 answered" progress fills; score + risk band shown; result stored and reflected on Profile gambling risk.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-15 - Submit before answering all items
- **Priority:** Med
- **Precondition:** In PGSI or K10 with some items blank.
- **Steps:** Try to submit with unanswered items.
- **Expected:** Submit disabled until all answered; no partial save.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-16 - K10 weekly check-in, severe score alerts
- **Priority:** High
- **Precondition:** Logged in.
- **Test data:** Answer all K10 items with the highest option (total >= 30).
- **Steps:** Open weekly check-in; answer all; submit.
- **Expected:** Score/band shown; a "severe" total fires the immediate alert and shows a "Start a consultation" prompt.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

---

## 6. Learn, Profile, Settings

### TC-17 - Learn feed reflects chosen gambling apps
- **Priority:** Med
- **Precondition:** Selected specific apps in onboarding/Settings.
- **Steps:** Open Learn; use search + category filter.
- **Expected:** Content is focused on the chosen gambling type; search/filter work.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-18 - Edit profile saves
- **Priority:** High
- **Precondition:** Logged in.
- **Test data:** change display/first name to `Juan P.`, set bio.
- **Steps:** Settings -> Edit Profile; change fields; Save; return to Profile/Home.
- **Expected:** Changes persist; Home greeting uses the first name.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-19 - Set a monthly spending limit
- **Priority:** Med
- **Precondition:** Logged in.
- **Test data:** limit = ₱2,000
- **Steps:** Settings -> Spending Limit; enter amount; save.
- **Expected:** Limit saved; Profile budget ring reflects it (₱, opportunity-cost framing).
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-20 - My Plan add / delete steps
- **Priority:** Med
- **Precondition:** Logged in, Profile.
- **Steps:** Add a plan step; select and delete a step; clear.
- **Expected:** Steps add/select/delete correctly; list persists after reload.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

---

## 7. Monitoring (dev build only, opt-in)

### TC-21 - Gambling app open triggers nudge
- **Priority:** Med
- **Precondition:** Background Monitoring enabled (Usage Access granted); dev build.
- **Steps:** Open a watched gambling app (or Settings -> Developer -> "Send test nudge").
- **Expected:** A supportive nudge fires; Home bell lists "Gambling app opened".
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

---

## 8. Offline & sync

### TC-22 - View app while offline
- **Priority:** High
- **Precondition:** Logged in with existing data; then enable Airplane mode.
- **Steps:** Reopen/navigate Home, Diary, Profile offline.
- **Expected:** App is viewable from cache; no crash; no fake "logged out".
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

### TC-23 - Offline write then auto-sync
- **Priority:** High
- **Precondition:** Airplane mode on; logged in.
- **Steps:** 1) Log a diary note + a check-in while offline. 2) Confirm they appear locally. 3) Turn internet back on; reopen the app.
- **Expected:** Writes are queued offline and applied locally; on reconnect they sync to Supabase automatically (no duplicates, no data loss).
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

---

## 9. Account deletion

### TC-24 - Delete account (two-step confirm)
- **Priority:** High
- **Precondition:** Logged in (use a throwaway account).
- **Steps:** Settings -> Delete Account; confirm both dialogs.
- **Expected:** Two confirmations required; account + data removed; returned to Login; cannot log back in with those credentials.
- **Actual:** ____  •  **Status:** ____  •  **Remarks:** ____

---

## Summary

| Total | Pass | Fail | Blocked |
|---|---|---|---|
| 24 | | | |

Tester: ____________  •  Device / OS: ____________  •  Build/version: ____________  •  Date: ____________
