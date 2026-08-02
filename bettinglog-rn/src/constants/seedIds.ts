// Fixed UUIDs for seeded reference rows.
//
// These are the SINGLE SOURCE OF TRUTH: the exact same UUIDs are inserted by
// supabase/migrations/0002_seed.sql. Because they are hard-coded (not random),
// every environment - your dev machine, a teammate's, production - ends up with
// identical IDs, so the app can reference the PGSI instrument reliably.
//
// Do NOT change these once data exists; they are how rows are matched.

export const SEED_IDS = {
  // Dev/demo login user (created by supabase/dev-seed-user.sql).
  // Email: demo@bettinglog.app  ·  Password: Demo123456
  demoUser: 'd0000000-0000-4000-8000-000000000001',

  // The PGSI questionnaire (the primary validated instrument).
  pgsiInstrument: 'a0000000-0000-4000-8000-000000000001',

  // PGSI's 9 items, in order.
  pgsiItems: [
    'a0000000-0000-4000-8000-000000000011',
    'a0000000-0000-4000-8000-000000000012',
    'a0000000-0000-4000-8000-000000000013',
    'a0000000-0000-4000-8000-000000000014',
    'a0000000-0000-4000-8000-000000000015',
    'a0000000-0000-4000-8000-000000000016',
    'a0000000-0000-4000-8000-000000000017',
    'a0000000-0000-4000-8000-000000000018',
    'a0000000-0000-4000-8000-000000000019',
  ],

  // Preset gambling apps (same order as constants/gamblingApps.ts).
  gamblingApps: {
    bingoPlus: 'b0000000-0000-4000-8000-000000000001',
    arenaPlus: 'b0000000-0000-4000-8000-000000000002',
    philWin: 'b0000000-0000-4000-8000-000000000003',
    okada: 'b0000000-0000-4000-8000-000000000004',
    mwPlay888: 'b0000000-0000-4000-8000-000000000005',
    eSabong: 'b0000000-0000-4000-8000-000000000006',
    lotto: 'b0000000-0000-4000-8000-000000000007',
    sportsBetting: 'b0000000-0000-4000-8000-000000000008',
    onlinePoker: 'b0000000-0000-4000-8000-000000000009',
  },
} as const;
