"use client";

import { useState, useCallback, useRef } from "react";
import { ratesConfig } from "@/data/rates";

// ── Types ────────────────────────────────────────────────────────────────────

interface RateEntry { product: string; rate: string }
interface DownTier { label: string; ltvRange: string; isFeatured: boolean; rates: RateEntry[] }
interface FicoTier { minFico: number; adj: number }

interface RatesData {
  lastUpdated: string;
  fees: { originationUnder1p5m: number; originationOver1p5m: number; underwriting: number };
  ficoTiers: FicoTier[];
  minFicoRequired: number;
  conformingLimit: number;
  tiers: DownTier[];
}

// ── Excel Parser ─────────────────────────────────────────────────────────────

const PRODUCT_MAP: Record<string, string> = {
  JF30: "30-Year Fixed",
  JF15: "15-Year Fixed",
  "JA7/6": "7/6 ARM",
  "JA5/6": "5/6 ARM",
  "JA10/6": "10/6 ARM",
};

const PRODUCTS_IN_ORDER = ["30-Year Fixed", "15-Year Fixed", "7/6 ARM", "5/6 ARM"];

async function parseExcel(file: File): Promise<{ detected: Record<string, string>; errors: string[] }> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const detected: Record<string, string> = {};
  const errors: string[] = [];

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: true,
    });

    let currentProduct: string | null = null;
    let lock30Col = -1;
    let rateCol = -1;
    let inTable = false;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      // Check for product identifier row
      for (const cell of row) {
        if (typeof cell === "string") {
          const upper = cell.trim().toUpperCase();
          for (const [code, name] of Object.entries(PRODUCT_MAP)) {
            if (upper.includes(code.toUpperCase())) {
              currentProduct = name;
              inTable = false;
              lock30Col = -1;
              rateCol = -1;
              break;
            }
          }
        }
      }

      if (!currentProduct) continue;

      // Check for header row (contains "Rate" and some lock period)
      const strCells = row.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
      const hasRate = strCells.some((c) => c.includes("rate"));
      const has30Day = strCells.some((c) => c.includes("30"));

      if (hasRate && has30Day && !inTable) {
        rateCol = strCells.findIndex((c) => c.includes("rate"));
        lock30Col = strCells.findIndex((c) => c.includes("30"));
        inTable = true;
        continue;
      }

      // Parse data rows
      if (inTable && rateCol >= 0 && lock30Col >= 0) {
        const rateVal = row[rateCol];
        const lock30Val = row[lock30Col];

        if (rateVal === null || rateVal === undefined || rateVal === "") {
          // blank row — end of this table
          inTable = false;
          continue;
        }

        const rateNum = typeof rateVal === "number" ? rateVal : parseFloat(String(rateVal));
        const priceNum = typeof lock30Val === "number" ? lock30Val : parseFloat(String(lock30Val));

        if (isNaN(rateNum) || isNaN(priceNum)) continue;

        // Track row with price closest to 0 (par)
        const existing = detected[currentProduct];
        const existingPrice = existing
          ? parseFloat(existing.split("|")[1])
          : Infinity;

        if (Math.abs(priceNum) < Math.abs(existingPrice)) {
          detected[currentProduct] = `${rateNum}|${priceNum}`;
        }
      }
    }
  }

  // Convert to clean rate strings
  const result: Record<string, string> = {};
  for (const [product, raw] of Object.entries(detected)) {
    const rateNum = parseFloat(raw.split("|")[0]);
    // Round to nearest 0.125
    const rounded = Math.round(rateNum * 8) / 8;
    result[product] = rounded.toFixed(3);
  }

  if (Object.keys(result).length === 0) {
    errors.push("Could not detect Titan MD rate tables. Check that you uploaded the correct Orion Non-Agency rate sheet.");
  }

  return { detected: result, errors };
}

// ── Build RatesData from detected par rates ───────────────────────────────────

function buildRatesFromDetected(detected: Record<string, string>, existing: RatesData): RatesData {
  // detected gives us par rates (0% down / highest LTV tier)
  // Lower LTV tiers get -0.125% per tier
  const today = new Date();
  const lastUpdated = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const baseRates = PRODUCTS_IN_ORDER.map((product) => ({
    product,
    rate: detected[product] ?? existing.tiers[0].rates.find((r) => r.product === product)?.rate ?? "0.000",
  }));

  const tiers: DownTier[] = [
    {
      label: "0% Down",
      ltvRange: "Up to 100% LTV",
      isFeatured: true,
      rates: baseRates,
    },
    {
      label: "5% Down",
      ltvRange: "95% LTV",
      isFeatured: false,
      rates: baseRates.map((r) => ({ ...r, rate: (parseFloat(r.rate) - 0.125).toFixed(3) })),
    },
    {
      label: "10% Down",
      ltvRange: "90% LTV",
      isFeatured: false,
      rates: baseRates.map((r) => ({ ...r, rate: (parseFloat(r.rate) - 0.25).toFixed(3) })),
    },
  ];

  return { ...existing, lastUpdated, tiers };
}

// ── Step components ───────────────────────────────────────────────────────────

function LoginStep({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) {
      onLogin(pw);
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-teal text-xs font-semibold tracking-widest uppercase mb-2">Rate Admin</p>
          <h1 className="text-white font-serif text-2xl">Best Suited Mortgage</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 space-y-4" style={{ borderRadius: "3px" }}>
          <div>
            <label className="text-text text-sm font-medium block mb-1.5">Admin Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full border border-border px-4 py-3 text-text text-sm focus:outline-none focus:border-navy"
              style={{ borderRadius: "2px" }}
              autoFocus
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-white font-semibold py-3 text-sm tracking-widest uppercase hover:bg-navy/80 transition-colors disabled:opacity-50"
            style={{ borderRadius: "2px" }}
          >
            {loading ? "Checking…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

function UploadStep({
  onRates,
  onManual,
}: {
  onRates: (data: RatesData) => void;
  onManual: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setErrors(["Please upload an Excel file (.xlsx or .xls)"]);
        return;
      }
      setParsing(true);
      setErrors([]);
      const { detected, errors: parseErrors } = await parseExcel(file);
      setParsing(false);
      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        return;
      }
      const data = buildRatesFromDetected(detected, ratesConfig as RatesData);
      onRates(data);
    },
    [onRates]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-navy px-6 py-4 flex items-center gap-3">
        <span className="text-teal text-xs font-semibold tracking-widest uppercase">Rate Admin</span>
        <span className="text-white/30">·</span>
        <span className="text-white/60 text-sm">Upload Rate Sheet</span>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg space-y-4">
          <div
            className={`border-2 border-dashed rounded p-12 text-center cursor-pointer transition-colors ${
              dragging ? "border-teal bg-teal/5" : "border-border hover:border-navy/40"
            }`}
            style={{ borderRadius: "3px" }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div className="text-4xl mb-4">📊</div>
            {parsing ? (
              <p className="text-text font-medium">Parsing rate sheet…</p>
            ) : (
              <>
                <p className="text-text font-medium mb-1">Drop Excel file here</p>
                <p className="text-muted text-sm">Orion Non-Agency rate sheet, Page 10 (Titan MD)</p>
                <p className="text-muted text-xs mt-3">.xlsx or .xls</p>
              </>
            )}
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm" style={{ borderRadius: "2px" }}>
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}

          <div className="text-center">
            <button onClick={onManual} className="text-muted text-sm underline hover:text-text">
              Enter rates manually instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-28 border border-border px-2 py-1.5 text-sm text-right tabular-nums font-mono focus:outline-none focus:border-navy"
      style={{ borderRadius: "2px" }}
      placeholder="0.000"
    />
  );
}

function EditStep({
  rates,
  password,
  onChange,
}: {
  rates: RatesData;
  password: string;
  onChange: (r: RatesData) => void;
}) {
  const [status, setStatus] = useState<"idle" | "publishing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function setRate(tierIdx: number, prodIdx: number, val: string) {
    const newTiers = rates.tiers.map((t, ti) => ({
      ...t,
      rates: t.rates.map((r, ri) =>
        ti === tierIdx && ri === prodIdx ? { ...r, rate: val } : r
      ),
    }));
    onChange({ ...rates, tiers: newTiers });
  }

  function setFee(key: keyof RatesData["fees"], val: string) {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    onChange({ ...rates, fees: { ...rates.fees, [key]: num } });
  }

  async function publish() {
    setStatus("publishing");
    setMessage("");
    const res = await fetch("/api/admin/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, rates }),
    });
    if (res.ok) {
      setStatus("success");
      setMessage("Rates published. Vercel will redeploy in ~30 seconds.");
    } else {
      const { error } = await res.json();
      setStatus("error");
      setMessage(error ?? "Unknown error");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-navy px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-teal text-xs font-semibold tracking-widest uppercase">Rate Admin</span>
          <span className="text-white/30">·</span>
          <span className="text-white/60 text-sm">Edit & Publish</span>
        </div>
        <div className="flex items-center gap-3">
          {status === "success" && (
            <span className="text-teal text-sm font-medium">{message}</span>
          )}
          {status === "error" && (
            <span className="text-red-400 text-sm">{message}</span>
          )}
          <button
            onClick={publish}
            disabled={status === "publishing" || status === "success"}
            className="bg-teal hover:bg-teal-light text-white font-semibold px-5 py-2 text-xs tracking-widest uppercase transition-colors disabled:opacity-50"
            style={{ borderRadius: "2px" }}
          >
            {status === "publishing" ? "Publishing…" : status === "success" ? "Published ✓" : "Publish to Site"}
          </button>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">

        {/* Date */}
        <div className="bg-white border border-border p-6" style={{ borderRadius: "3px" }}>
          <h2 className="text-text font-semibold text-sm mb-4 uppercase tracking-wide">Rate Date</h2>
          <div className="flex items-center gap-3">
            <label className="text-muted text-sm w-32">Rates as of</label>
            <input
              type="text"
              value={rates.lastUpdated}
              onChange={(e) => onChange({ ...rates, lastUpdated: e.target.value })}
              className="border border-border px-3 py-2 text-sm text-text focus:outline-none focus:border-navy w-56"
              style={{ borderRadius: "2px" }}
              placeholder="March 26, 2026"
            />
          </div>
        </div>

        {/* Rate Tiers */}
        <div className="bg-white border border-border p-6" style={{ borderRadius: "3px" }}>
          <h2 className="text-text font-semibold text-sm mb-1 uppercase tracking-wide">Rate Tiers</h2>
          <p className="text-muted text-xs mb-5">Base rates for 760+ FICO, 30-day lock.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted font-medium pb-2 pr-4">Product</th>
                  {rates.tiers.map((t) => (
                    <th key={t.label} className="text-right text-muted font-medium pb-2 px-3">
                      {t.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PRODUCTS_IN_ORDER.map((product, prodIdx) => (
                  <tr key={product}>
                    <td className="py-3 pr-4 text-text font-medium whitespace-nowrap">{product}</td>
                    {rates.tiers.map((tier, tierIdx) => {
                      const rateIdx = tier.rates.findIndex((r) => r.product === product);
                      return (
                        <td key={tier.label} className="py-3 px-3 text-right">
                          {rateIdx >= 0 ? (
                            <div className="flex items-center justify-end gap-1">
                              <RateInput
                                value={tier.rates[rateIdx].rate}
                                onChange={(v) => setRate(tierIdx, rateIdx, v)}
                              />
                              <span className="text-muted text-sm">%</span>
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fees */}
        <div className="bg-white border border-border p-6" style={{ borderRadius: "3px" }}>
          <h2 className="text-text font-semibold text-sm mb-5 uppercase tracking-wide">Lender Fees</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-text text-sm font-medium">Origination — Loans ≤ $1,500,000</p>
                <p className="text-muted text-xs">As a decimal (e.g. 0.01 = 1.000%)</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={rates.fees.originationUnder1p5m}
                  onChange={(e) => setFee("originationUnder1p5m", e.target.value)}
                  className="w-24 border border-border px-3 py-2 text-sm text-right tabular-nums font-mono focus:outline-none focus:border-navy"
                  style={{ borderRadius: "2px" }}
                />
                <span className="text-muted text-xs w-20">
                  = {(rates.fees.originationUnder1p5m * 100).toFixed(3)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-text text-sm font-medium">Origination — Loans &gt; $1,500,000</p>
                <p className="text-muted text-xs">As a decimal (e.g. 0.0075 = 0.750%)</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={rates.fees.originationOver1p5m}
                  onChange={(e) => setFee("originationOver1p5m", e.target.value)}
                  className="w-24 border border-border px-3 py-2 text-sm text-right tabular-nums font-mono focus:outline-none focus:border-navy"
                  style={{ borderRadius: "2px" }}
                />
                <span className="text-muted text-xs w-20">
                  = {(rates.fees.originationOver1p5m * 100).toFixed(3)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-text text-sm font-medium">Underwriting Fee</p>
                <p className="text-muted text-xs">Flat dollar amount</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted text-sm">$</span>
                <input
                  type="number"
                  step="1"
                  value={rates.fees.underwriting}
                  onChange={(e) => setFee("underwriting", e.target.value)}
                  className="w-24 border border-border px-3 py-2 text-sm text-right tabular-nums font-mono focus:outline-none focus:border-navy"
                  style={{ borderRadius: "2px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Publish footer CTA */}
        <div className="flex justify-end pb-8">
          <button
            onClick={publish}
            disabled={status === "publishing" || status === "success"}
            className="bg-teal hover:bg-teal-light text-white font-semibold px-8 py-3 text-sm tracking-widest uppercase transition-colors disabled:opacity-50"
            style={{ borderRadius: "3px" }}
          >
            {status === "publishing" ? "Publishing…" : status === "success" ? "Published ✓" : "Publish to Site"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [step, setStep] = useState<"login" | "upload" | "edit">("login");
  const [password, setPassword] = useState("");
  const [rates, setRates] = useState<RatesData>(ratesConfig as unknown as RatesData);

  if (step === "login") {
    return (
      <LoginStep
        onLogin={(pw) => {
          setPassword(pw);
          setStep("upload");
        }}
      />
    );
  }

  if (step === "upload") {
    return (
      <UploadStep
        onRates={(data) => { setRates(data); setStep("edit"); }}
        onManual={() => setStep("edit")}
      />
    );
  }

  return (
    <EditStep
      rates={rates}
      password={password}
      onChange={setRates}
    />
  );
}
