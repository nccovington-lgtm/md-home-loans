// ─────────────────────────────────────────────────────────────────────────────
// PHYSICIAN MORTGAGE RATE CONFIGURATION
//
// HOW TO UPDATE:
//   1. Get your new rate sheet from Orion Lending
//   2. Drop the PDF into the Claude Code chat
//   3. Tell Claude: "Update rates — 30-day lock, 760+ FICO, 30-day lock"
//   4. Claude will update the rate values below and set lastUpdated
//
// Base rates are for 760+ FICO. FICO adjustments below handle lower scores.
// ─────────────────────────────────────────────────────────────────────────────

export interface RateEntry {
  product: string;
  rate: string; // e.g. "7.250%" — base rate for 760+ FICO
}

export interface DownTier {
  label: string;       // e.g. "0% Down"
  ltvRange: string;    // e.g. "Up to 100% LTV"
  isFeatured: boolean;
  rates: RateEntry[];
}

export interface FicoTier {
  minFico: number;  // inclusive lower bound
  adj: number;      // rate adjustment in % points added to base rate (e.g. 0.125 = +0.125%)
}

export const ratesConfig = {
  // ← Update this date every time rates change
  lastUpdated: "March 26, 2026",

  fees: {
    originationUnder1p5m: 0.01,   // 1.000% — loans ≤ $1,500,000
    originationOver1p5m:  0.0075, // 0.750% — loans > $1,500,000
    underwriting: 1630,           // flat fee, all loan amounts
  },

  // ── FICO ADJUSTMENTS ─────────────────────────────────────────────────────
  // Added to base rates (which assume 760+ FICO).
  // Derived from the Titan MD FICO/CLTV price adjustment grid.
  // Sorted descending by minFico — first match wins.
  ficoTiers: [
    { minFico: 760, adj: 0.000 },
    { minFico: 740, adj: 0.125 },
    { minFico: 720, adj: 0.250 },
    { minFico: 700, adj: 0.375 },
    { minFico: 680, adj: 0.500 },
  ] as FicoTier[],

  minFicoRequired: 680,

  // FHFA baseline conforming loan limit — update each November when FHFA announces new limit
  // 2026 limit announced Nov 2025: $832,750 (up from $806,500 in 2025)
  conformingLimit: 832_750,

  // ── RATE TIERS ──────────────────────────────────────────────────────────────
  // Base rates for 760+ FICO, 30-day lock.
  // PLACEHOLDER — confirm with your own margin calculations before sharing.
  // ────────────────────────────────────────────────────────────────────────────
  tiers: [
    {
      label: "0% Down",
      ltvRange: "Up to 100% LTV",
      isFeatured: true,
      rates: [
        { product: "30-Year Fixed", rate: "7.625" },
        { product: "15-Year Fixed", rate: "7.250" },
        { product: "7/6 ARM",       rate: "7.000" },
        { product: "5/6 ARM",       rate: "7.000" },
      ],
    },
    {
      label: "5% Down",
      ltvRange: "95% LTV",
      isFeatured: false,
      rates: [
        { product: "30-Year Fixed", rate: "7.500" },
        { product: "15-Year Fixed", rate: "7.125" },
        { product: "7/6 ARM",       rate: "6.875" },
        { product: "5/6 ARM",       rate: "6.875" },
      ],
    },
    {
      label: "10% Down",
      ltvRange: "90% LTV",
      isFeatured: false,
      rates: [
        { product: "30-Year Fixed", rate: "7.375" },
        { product: "15-Year Fixed", rate: "7.000" },
        { product: "7/6 ARM",       rate: "6.750" },
        { product: "5/6 ARM",       rate: "6.750" },
      ],
    },
  ] as DownTier[],
};
