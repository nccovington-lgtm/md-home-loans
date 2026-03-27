import { NextRequest, NextResponse } from "next/server";

const OWNER = "nccovington-lgtm";
const REPO = "md-home-loans";
const FILE_PATH = "src/data/rates.ts";

interface RateEntry {
  product: string;
  rate: string;
}

interface DownTier {
  label: string;
  ltvRange: string;
  isFeatured: boolean;
  rates: RateEntry[];
}

interface FicoTier {
  minFico: number;
  adj: number;
}

interface RatesPayload {
  lastUpdated: string;
  fees: {
    originationUnder1p5m: number;
    originationOver1p5m: number;
    underwriting: number;
  };
  ficoTiers: FicoTier[];
  minFicoRequired: number;
  conformingLimit: number;
  tiers: DownTier[];
}

function generateRatesTs(r: RatesPayload): string {
  const ficoLines = r.ficoTiers
    .map((t) => `    { minFico: ${t.minFico}, adj: ${t.adj.toFixed(3)} },`)
    .join("\n");

  const tierBlocks = r.tiers
    .map((tier) => {
      const rateLines = tier.rates
        .map((rate) => `        { product: "${rate.product}", rate: "${rate.rate}" },`)
        .join("\n");
      return `    {
      label: "${tier.label}",
      ltvRange: "${tier.ltvRange}",
      isFeatured: ${tier.isFeatured},
      rates: [
${rateLines}
      ],
    }`;
    })
    .join(",\n");

  return `// ─────────────────────────────────────────────────────────────────────────────
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
  lastUpdated: "${r.lastUpdated}",

  fees: {
    originationUnder1p5m: ${r.fees.originationUnder1p5m},   // ${(r.fees.originationUnder1p5m * 100).toFixed(3)}% — loans ≤ $1,500,000
    originationOver1p5m:  ${r.fees.originationOver1p5m}, // ${(r.fees.originationOver1p5m * 100).toFixed(3)}% — loans > $1,500,000
    underwriting: ${r.fees.underwriting},           // flat fee, all loan amounts
  },

  // ── FICO ADJUSTMENTS ─────────────────────────────────────────────────────
  // Added to base rates (which assume 760+ FICO).
  // Derived from the Titan MD FICO/CLTV price adjustment grid.
  // Sorted descending by minFico — first match wins.
  ficoTiers: [
${ficoLines}
  ] as FicoTier[],

  minFicoRequired: ${r.minFicoRequired},

  // FHFA baseline conforming loan limit — update each November when FHFA announces new limit
  // 2026 limit announced Nov 2025: $832,750 (up from $806,500 in 2025)
  conformingLimit: ${r.conformingLimit},

  // ── RATE TIERS ──────────────────────────────────────────────────────────────
  // Base rates for 760+ FICO, 30-day lock.
  // ────────────────────────────────────────────────────────────────────────────
  tiers: [
${tierBlocks}
  ] as DownTier[],
};
`;
}

export async function POST(req: NextRequest) {
  const { password, rates } = (await req.json()) as { password: string; rates: RatesPayload };

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD env var not set" }, { status: 500 });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN env var not set" }, { status: 500 });
  }

  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  // Get current file SHA
  const getRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    { headers: ghHeaders }
  );
  if (!getRes.ok) {
    const errText = await getRes.text();
    return NextResponse.json({ error: `GitHub GET failed: ${errText}` }, { status: 500 });
  }
  const { sha } = await getRes.json();

  const newContent = generateRatesTs(rates);
  const encoded = Buffer.from(newContent).toString("base64");

  // Commit updated file
  const putRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Update rates — ${rates.lastUpdated}`,
        content: encoded,
        sha,
      }),
    }
  );

  if (!putRes.ok) {
    const errText = await putRes.text();
    return NextResponse.json({ error: `GitHub commit failed: ${errText}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
