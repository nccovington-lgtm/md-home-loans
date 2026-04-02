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

// ── Constants ─────────────────────────────────────────────────────────────────

const PRODUCT_MAP: Record<string, string> = {
  JF30: "30-Year Fixed",
  JF15: "15-Year Fixed",
  "JA7/6": "7/6 ARM",
  "JA5/6": "5/6 ARM",
  "JA10/6": "10/6 ARM",
};

const PRODUCTS_IN_ORDER = ["30-Year Fixed", "15-Year Fixed", "7/6 ARM", "5/6 ARM"];

// ── Excel Parser ──────────────────────────────────────────────────────────────

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

      const strCells = row.map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
      const hasRate = strCells.some((c) => c.includes("rate"));
      const has30Day = strCells.some((c) => c.includes("30"));

      if (hasRate && has30Day && !inTable) {
        rateCol = strCells.findIndex((c) => c.includes("rate"));
        lock30Col = strCells.findIndex((c) => c.includes("30"));
        inTable = true;
        continue;
      }

      if (inTable && rateCol >= 0 && lock30Col >= 0) {
        const rateVal = row[rateCol];
        const lock30Val = row[lock30Col];

        if (rateVal === null || rateVal === undefined || rateVal === "") {
          inTable = false;
          continue;
        }

        const rateNum = typeof rateVal === "number" ? rateVal : parseFloat(String(rateVal));
        const priceNum = typeof lock30Val === "number" ? lock30Val : parseFloat(String(lock30Val));

        if (isNaN(rateNum) || isNaN(priceNum)) continue;

        const existing = detected[currentProduct];
        const existingPrice = existing ? parseFloat(existing.split("|")[1]) : Infinity;

        if (Math.abs(priceNum) < Math.abs(existingPrice)) {
          detected[currentProduct] = `${rateNum}|${priceNum}`;
        }
      }
    }
  }

  if (Object.keys(detected).length === 0) {
    errors.push("Could not detect Titan MD rate tables. Make sure you uploaded the Orion Non-Agency rate sheet.");
  }

  return { detected: toCleanRates(detected), errors };
}

// ── PDF Parser ────────────────────────────────────────────────────────────────

interface TextItem {
  text: string;
  x: number;
  y: number;
}

async function parsePDF(file: File): Promise<{ detected: Record<string, string>; errors: string[] }> {
  // Dynamic import to keep pdfjs out of initial bundle
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  // Find the Titan MD page(s)
  const titanPages: number[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const fullText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .toLowerCase();
    if (fullText.includes("titan md") || fullText.includes("titanmd")) {
      titanPages.push(p);
    }
  }

  if (titanPages.length === 0) {
    return {
      detected: {},
      errors: ['Could not find "Titan MD" in this PDF. Make sure you uploaded the Orion Non-Agency rate sheet.'],
    };
  }

  const detected: Record<string, string> = {};

  for (const pageNum of titanPages) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Extract positioned text items
    const items: TextItem[] = content.items
      .filter((item) => "str" in item && (item as { str: string }).str.trim())
      .map((item) => {
        const i = item as { str: string; transform: number[] };
        return { text: i.str.trim(), x: i.transform[4], y: i.transform[5] };
      })
      .filter((i) => i.text.length > 0);

    // Group into rows by y-coordinate (within 3pt tolerance)
    const rows: TextItem[][] = [];
    for (const item of items) {
      const existing = rows.find((row) => Math.abs(row[0].y - item.y) < 3);
      if (existing) {
        existing.push(item);
        existing.sort((a, b) => a.x - b.x);
      } else {
        rows.push([item]);
      }
    }
    // Sort rows top-to-bottom (higher y = higher on page in PDF coords)
    rows.sort((a, b) => b[0].y - a[0].y);

    // Walk rows to find product tables
    let currentProduct: string | null = null;
    let lock30ColX = -1;
    let rateColX = -1;
    let inTable = false;

    for (const row of rows) {
      const rowText = row.map((i) => i.text).join(" ").toUpperCase();

      // Check for product code
      for (const [code, name] of Object.entries(PRODUCT_MAP)) {
        if (rowText.includes(code.toUpperCase())) {
          currentProduct = name;
          inTable = false;
          lock30ColX = -1;
          rateColX = -1;
          break;
        }
      }

      if (!currentProduct) continue;

      // Check for header row
      const hasRate = row.some((i) => i.text.toLowerCase() === "rate");
      const has30 = row.some((i) => i.text.includes("30"));

      if (hasRate && has30 && !inTable) {
        const rateItem = row.find((i) => i.text.toLowerCase() === "rate");
        const lock30Item = row.find((i) => i.text.includes("30"));
        if (rateItem) rateColX = rateItem.x;
        if (lock30Item) lock30ColX = lock30Item.x;
        inTable = true;
        continue;
      }

      if (inTable && rateColX >= 0 && lock30ColX >= 0) {
        // Find cells near the rate and 30-day columns (within 20pt)
        const rateCell = row.find((i) => Math.abs(i.x - rateColX) < 20);
        const lock30Cell = row.find((i) => Math.abs(i.x - lock30ColX) < 20);

        if (!rateCell) {
          inTable = false;
          continue;
        }

        const rateNum = parseFloat(rateCell.text);
        const priceNum = lock30Cell ? parseFloat(lock30Cell.text) : NaN;

        if (isNaN(rateNum)) {
          inTable = false;
          continue;
        }

        if (!isNaN(priceNum)) {
          const existing = detected[currentProduct];
          const existingPrice = existing ? parseFloat(existing.split("|")[1]) : Infinity;
          if (Math.abs(priceNum) < Math.abs(existingPrice)) {
            detected[currentProduct] = `${rateNum}|${priceNum}`;
          }
        }
      }
    }
  }

  if (Object.keys(detected).length === 0) {
    return {
      detected: {},
      errors: [
        "Found the Titan MD section but could not parse rate tables. The PDF layout may be different than expected — try uploading an Excel version instead.",
      ],
    };
  }

  return { detected: toCleanRates(detected), errors: [] };
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function toCleanRates(raw: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [product, val] of Object.entries(raw)) {
    const rateNum = parseFloat(val.split("|")[0]);
    result[product] = (Math.round(rateNum * 8) / 8).toFixed(3);
  }
  return result;
}

function buildRatesFromDetected(detected: Record<string, string>, existing: RatesData): RatesData {
  const today = new Date();
  const lastUpdated = today.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const baseRates = PRODUCTS_IN_ORDER.map((product) => ({
    product,
    rate: detected[product] ?? existing.tiers[0].rates.find((r) => r.product === product)?.rate ?? "0.000",
  }));

  const tiers: DownTier[] = [
    { label: "0% Down", ltvRange: "Up to 100% LTV", isFeatured: true, rates: baseRates },
    {
      label: "5% Down", ltvRange: "95% LTV", isFeatured: false,
      rates: baseRates.map((r) => ({ ...r, rate: (parseFloat(r.rate) - 0.125).toFixed(3) })),
    },
    {
      label: "10% Down", ltvRange: "90% LTV", isFeatured: false,
      rates: baseRates.map((r) => ({ ...r, rate: (parseFloat(r.rate) - 0.25).toFixed(3) })),
    },
  ];

  return { ...existing, lastUpdated, tiers };
}

async function parseFile(file: File): Promise<{ detected: Record<string, string>; errors: string[] }> {
  if (file.name.endsWith(".pdf")) return parsePDF(file);
  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) return parseExcel(file);
  return { detected: {}, errors: ["Unsupported file type. Upload a PDF or Excel file."] };
}

// ── Login Step ────────────────────────────────────────────────────────────────

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
    if (res.ok) { onLogin(pw); } else { setError("Incorrect password."); }
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

// ── Upload Step ───────────────────────────────────────────────────────────────

function UploadStep({
  onRates,
  onManual,
}: {
  onRates: (data: RatesData) => void;
  onManual: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setParsing(true);
      setErrors([]);
      setParseStatus(file.name.endsWith(".pdf") ? "Reading PDF and searching for Titan MD section…" : "Parsing rate sheet…");
      const { detected, errors: parseErrors } = await parseFile(file);
      setParsing(false);
      setParseStatus("");
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
            className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
              dragging ? "border-teal bg-teal/5" : "border-border hover:border-navy/40"
            }`}
            style={{ borderRadius: "3px" }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div className="text-4xl mb-4">{parsing ? "⏳" : "📄"}</div>
            {parsing ? (
              <>
                <p className="text-text font-medium">{parseStatus}</p>
                <p className="text-muted text-sm mt-1">This may take a few seconds for large PDFs…</p>
              </>
            ) : (
              <>
                <p className="text-text font-medium mb-1">Drop rate sheet here</p>
                <p className="text-muted text-sm">Orion Non-Agency rate sheet — full PDF or Excel</p>
                <p className="text-muted text-xs mt-1">Automatically finds the Titan MD section</p>
                <p className="text-muted text-xs mt-3">.pdf · .xlsx · .xls</p>
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

// ── Edit Step ─────────────────────────────────────────────────────────────────

function RateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 border border-border px-2 py-1.5 text-sm text-right tabular-nums font-mono focus:outline-none focus:border-navy"
        style={{ borderRadius: "2px" }}
      />
      <span className="text-muted text-sm">%</span>
    </div>
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

  function setRate(tierIdx: number, rateIdx: number, val: string) {
    const newTiers = rates.tiers.map((t, ti) => ({
      ...t,
      rates: t.rates.map((r, ri) =>
        ti === tierIdx && ri === rateIdx ? { ...r, rate: val } : r
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
      setMessage("Published. Vercel will redeploy in ~30 seconds.");
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
          <span className="text-white/60 text-sm">Review & Publish</span>
        </div>
        <div className="flex items-center gap-3">
          {status === "success" && <span className="text-teal text-sm font-medium">{message}</span>}
          {status === "error" && <span className="text-red-400 text-sm">{message}</span>}
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
          <p className="text-muted text-xs mb-5">Base rates for 760+ FICO, 30-day lock. Verify against your rate sheet before publishing.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted font-medium pb-2 pr-4">Product</th>
                  {rates.tiers.map((t) => (
                    <th key={t.label} className="text-right text-muted font-medium pb-2 px-3">{t.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PRODUCTS_IN_ORDER.map((product) => (
                  <tr key={product}>
                    <td className="py-3 pr-4 text-text font-medium whitespace-nowrap">{product}</td>
                    {rates.tiers.map((tier, tierIdx) => {
                      const rateIdx = tier.rates.findIndex((r) => r.product === product);
                      return (
                        <td key={tier.label} className="py-3 px-3 text-right">
                          {rateIdx >= 0
                            ? <RateInput value={tier.rates[rateIdx].rate} onChange={(v) => setRate(tierIdx, rateIdx, v)} />
                            : <span className="text-muted">—</span>
                          }
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
            {[
              { label: "Origination — Loans ≤ $1,500,000", sub: "e.g. 0.01 = 1.000%", key: "originationUnder1p5m" as const, pct: true },
              { label: "Origination — Loans > $1,500,000", sub: "e.g. 0.0075 = 0.750%", key: "originationOver1p5m" as const, pct: true },
              { label: "Underwriting Fee", sub: "Flat dollar amount", key: "underwriting" as const, pct: false },
            ].map(({ label, sub, key, pct }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-text text-sm font-medium">{label}</p>
                  <p className="text-muted text-xs">{sub}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!pct && <span className="text-muted text-sm">$</span>}
                  <input
                    type="number"
                    step={pct ? "0.0001" : "1"}
                    value={rates.fees[key]}
                    onChange={(e) => setFee(key, e.target.value)}
                    className="w-28 border border-border px-3 py-2 text-sm text-right tabular-nums font-mono focus:outline-none focus:border-navy"
                    style={{ borderRadius: "2px" }}
                  />
                  {pct && (
                    <span className="text-muted text-xs w-20">
                      = {(rates.fees[key] as number * 100).toFixed(3)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [step, setStep] = useState<"login" | "upload" | "edit">("login");
  const [password, setPassword] = useState("");
  const [rates, setRates] = useState<RatesData>(ratesConfig as unknown as RatesData);

  if (step === "login") {
    return <LoginStep onLogin={(pw) => { setPassword(pw); setStep("upload"); }} />;
  }
  if (step === "upload") {
    return (
      <UploadStep
        onRates={(data) => { setRates(data); setStep("edit"); }}
        onManual={() => setStep("edit")}
      />
    );
  }
  return <EditStep rates={rates} password={password} onChange={setRates} />;
}
