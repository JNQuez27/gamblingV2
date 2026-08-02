// Philippine peso reference prices - the single source of truth for every
// opportunity-cost computation in the app (home "what's the bet really worth?",
// math-engine notifications, consultation replies).
//
// Two groups:
//   1. PAGCOR_REFERENCE_BETS - typical stake sizes on PAGCOR-regulated products
//      (PAGCOR = Philippine Amusement and Gaming Corporation, the state
//      regulator). These anchor "how much a session usually costs" so the
//      app never guesses with foreign numbers.
//   2. PH_ALTERNATIVES - everyday goods a stake converts into. Deliberately
//      conservative Metro-Manila-level prices; tweak here, not in screens.

export interface PriceAlternative {
  icon: string;
  one: string;   // singular label
  many: string;  // plural label
  cost: number;  // ₱ per unit
}

// Typical minimum/typical stakes on PAGCOR-licensed products. Used to anchor
// "average session spend" and to translate product names into peso figures.
export const PAGCOR_REFERENCE_BETS = {
  lottoTicket: 20,          // PCSO standard lotto play (₱20 incl. DST)
  eBingoCard: 20,           // PAGCOR e-Bingo / licensed bingo app card
  eGamesMinBet: 50,         // licensed e-Games café / online slot typical spin budget
  eSabongMinBet: 100,       // historical regulated minimum plasada per fight
  casinoTableMin: 300,      // typical minimum on a PAGCOR-operated table
  sportsBetMin: 100,        // licensed sports-betting minimum ticket
  // Conservative "one ordinary gambling session" figure used by the streak
  // savings math (₱X kept per bet-free day).
  averageSessionSpend: 350,
} as const;

// Everyday PH prices a bet converts into. Ordered cheap → expensive so the
// UI can show meaningful counts at any amount.
//
// Sourced (verified Jul 2026) - update alongside the source, not by feel:
//   jeepney  ₱14  - LTFRB traditional-PUJ minimum fare, effective 19 Mar 2026
//   rice     ₱55  - DA Bantay Presyo prevailing well-milled ₱50–56/kg
//                   (PSA avg ₱56.15, Jun 2026); DTI e-Presyo tracks the same basket
//   coffee   ₱140 - Numbeo PH country average, cappuccino ₱138.72
//   data     ₱149 - GOMO 7 GB no-expiry pack (flagship no-expiry offer)
//   meal     ₱250 - Numbeo PH "meal, inexpensive restaurant"
//   gasoline ₱77  - DOE/GasWatch RON91 national avg, Jul 2026 (volatile)
//   bangus   ₱220 - PSA price situationer, medium bangus ₱223/kg (May 2026)
//   eggs     ₱275 - PSA avg ₱9.17/pc × 30-pc tray (May 2026)
//   liempo   ₱380 - DA Bantay Presyo NCR, pork belly ₱379/kg (Jul 2026)
export const PH_ALTERNATIVES: PriceAlternative[] = [
  { icon: '🚌', one: 'jeepney ride', many: 'jeepney rides', cost: 14 },
  { icon: '🍚', one: 'kilo of rice', many: 'kilos of rice', cost: 55 },
  { icon: '⛽', one: 'liter of gasoline', many: 'liters of gasoline', cost: 77 },
  { icon: '☕', one: 'cup of coffee', many: 'cups of coffee', cost: 140 },
  { icon: '📱', one: '7GB no-expiry data pack', many: '7GB no-expiry data packs', cost: 149 },
  { icon: '🐟', one: 'kilo of bangus', many: 'kilos of bangus', cost: 220 },
  { icon: '🍔', one: 'restaurant meal', many: 'restaurant meals', cost: 250 },
  { icon: '🥚', one: 'tray of 30 eggs', many: 'trays of 30 eggs', cost: 275 },
  { icon: '🎬', one: 'movie ticket', many: 'movie tickets', cost: 350 },
  { icon: '🐖', one: 'kilo of pork liempo', many: 'kilos of pork liempo', cost: 380 },
  { icon: '📚', one: 'good book', many: 'good books', cost: 450 },
  { icon: '🛒', one: 'week of groceries', many: 'weeks of groceries', cost: 1500 },
  { icon: '⚡', one: 'month of electricity', many: 'months of electricity', cost: 3000 },
  { icon: '🏠', one: 'month of groceries', many: 'months of groceries', cost: 6000 },
];

// Shared references the math-engine sentences use.
export const REFERENCE_COSTS = {
  monthGroceries: 6000, // ₱ for a month of basic groceries
  jeepneyFare: 14,      // ₱ LTFRB traditional-jeepney minimum fare (Mar 2026)
  riceKilo: 55,         // ₱ per kilo, well-milled (DA/PSA mid-2026)
} as const;
