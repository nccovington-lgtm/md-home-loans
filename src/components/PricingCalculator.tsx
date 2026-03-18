"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ratesConfig } from "@/data/rates";
import Footer from "@/components/Footer";
import PricingLeadForm, { type PricerSnapshot } from "@/components/PricingLeadForm";

const DOWN_OPTIONS = [
  { label: "0% Down", pct: 0 },
  { label: "5% Down", pct: 5 },
  { label: "10% Down", pct: 10 },
];

function fmt$(n: number, decimals = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

function parseNum(s: string): number {
  const n = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}


// Bisection method: find monthly rate x such that PV of payments = netLoan
function calcAPR(loanAmount: number, noteRatePct: number, termMonths: number, fees: number): number {
  const r0 = noteRatePct / 100 / 12;
  const pmt = loanAmount * r0 * Math.pow(1 + r0, termMonths) / (Math.pow(1 + r0, termMonths) - 1);
  const net = loanAmount - fees;
  if (net <= 0 || fees <= 0) return noteRatePct;

  let lo = 0.00001, hi = 1.0;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const pv = pmt * (1 - Math.pow(1 + mid, -termMonths)) / mid;
    if (pv > net) lo = mid; else hi = mid;
  }
  return ((lo + hi) / 2) * 12 * 100;
}

function getFicoAdj(fico: number): number {
  const tiers = [...ratesConfig.ficoTiers].sort((a, b) => b.minFico - a.minFico);
  for (const tier of tiers) {
    if (fico >= tier.minFico) return tier.adj;
  }
  return 0;
}

export default function PricingCalculator() {
  const { lastUpdated, fees, tiers, minFicoRequired, conformingLimit } = ratesConfig;

  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setNavVisible(current < lastScrollY.current || current < 60);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [priceInput, setPriceInput] = useState("500,000");
  const [downIndex, setDownIndex] = useState(0);
  const [productIndex, setProductIndex] = useState(0);
  const [ficoInput, setFicoInput] = useState("760");

  const purchasePrice = parseNum(priceInput);
  const ficoScore = parseInt(ficoInput, 10) || 0;
  const downPct = DOWN_OPTIONS[downIndex].pct / 100;
  const downAmount = purchasePrice * downPct;
  const loanAmount = purchasePrice - downAmount;

  const tier = tiers[downIndex];
  const baseRateNum = parseFloat(tier.rates[productIndex].rate);
  const ficoAdj = getFicoAdj(ficoScore);
  const adjustedRate = baseRateNum + ficoAdj;

  const termMonths = tier.rates[productIndex].product.includes("15") ? 180 : 360;
  const monthlyRate = adjustedRate / 100 / 12;

  const monthlyPayment = useMemo(() => {
    if (loanAmount <= 0 || monthlyRate <= 0) return 0;
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }, [loanAmount, monthlyRate, termMonths]);

  const originationPct = loanAmount <= 1_500_000 ? fees.originationUnder1p5m : fees.originationOver1p5m;
  const originationFeeCalc = loanAmount * originationPct;
  const originationFee = loanAmount > 0 && loanAmount < 500_000 ? Math.max(originationFeeCalc, 5_000) : originationFeeCalc;
  const originationIsFlat = loanAmount > 0 && loanAmount < 500_000;
  const totalFees = originationFee + fees.underwriting;

  const aprPct = useMemo(() => {
    if (loanAmount <= 0) return adjustedRate;
    return calcAPR(loanAmount, adjustedRate, termMonths, totalFees);
  }, [loanAmount, adjustedRate, termMonths, totalFees]);

  const pricerSnapshot: PricerSnapshot = {
    purchasePrice: purchasePrice > 0 ? fmt$(purchasePrice) : "Not entered",
    downPayment: `${DOWN_OPTIONS[downIndex].pct}%${purchasePrice > 0 ? ` · ${fmt$(downAmount)}` : ""}`,
    loanAmount: loanAmount > 0 ? fmt$(loanAmount) : "Not entered",
    creditScore: ficoScore > 0 ? String(ficoScore) : "Not entered",
    product: tier.rates[productIndex].product,
    rate: `${adjustedRate.toFixed(3)}%`,
    apr: loanAmount > 0 ? `${aprPct.toFixed(3)}%` : "—",
    monthlyPayment: monthlyPayment > 0 ? fmt$(monthlyPayment, 2) : "—",
    originationFee: loanAmount > 0 ? fmt$(originationFee) : "—",
    originationLabel: originationIsFlat ? "Origination Fee (minimum)" : `Origination Fee (${loanAmount > 1_500_000 ? "0.750%" : "1.000%"})`,
    totalFees: loanAmount > 0 ? fmt$(totalFees) : "—",
  };

  const isOverMax = loanAmount > 2_000_000;
  const ficoTooLow = ficoScore > 0 && ficoScore < minFicoRequired;
  const ficoInvalid = ficoScore > 0 && ficoScore > 850;
  const hasValidLoan = loanAmount > 0 && !isOverMax && !ficoTooLow && !ficoInvalid;
  const showConventionalNote = downIndex > 0 && loanAmount > 0 && loanAmount <= conformingLimit;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (!raw) { setPriceInput(""); return; }
    setPriceInput(parseInt(raw, 10).toLocaleString("en-US"));
  };

  const handleFicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
    setFicoInput(raw);
  };


  return (
    <>
      {/* Teal top stripe */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-teal z-50" />

      {/* Navbar */}
      <nav className={`fixed top-1 left-0 right-0 z-40 bg-navy border-b border-white/10 transition-transform duration-300 ${navVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex-shrink-0">
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="2" width="8" height="24" rx="1" fill="#2E7D6B" />
                  <rect x="2" y="10" width="24" height="8" rx="1" fill="#2E7D6B" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="section-label text-teal">Powered By</span>
                <span className="font-bold text-sm md:text-lg tracking-tight whitespace-nowrap text-white">
                  Best Suited Mortgage
                </span>
              </div>
            </a>
            <a
              href="#contact"
              className="bg-teal hover:bg-teal-light text-white font-semibold px-3 py-2 sm:px-5 sm:py-2.5 text-xs tracking-widest uppercase whitespace-nowrap transition-all duration-200 hover:shadow-md flex-shrink-0"
              style={{ borderRadius: "3px" }}
            >
              Get Pre-Approved
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-17 min-h-screen bg-background">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-navy py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="section-label text-teal mb-3">Physician Mortgage Program</p>
            <h1 className="font-serif text-3xl sm:text-4xl text-white mb-5">
              Rate & Payment Estimator
            </h1>
            <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-gold/10 border border-gold/30 px-4 py-2 max-w-full" style={{ borderRadius: "3px" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse flex-shrink-0" />
              <span className="text-gold text-xs font-semibold tracking-wide uppercase text-center">
                Rates as of {lastUpdated} · Subject to change daily
              </span>
            </div>
          </div>
        </section>

        {/* ── Calculator ───────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

              {/* ── Left: Inputs ─────────────────────────────────────────── */}
              <div className="bg-white border border-border p-6 sm:p-8 space-y-6" style={{ borderRadius: "3px" }}>
                <p className="section-label text-muted">Loan Details</p>

                {/* Purchase Price */}
                <div className="space-y-1.5">
                  <label className="text-text text-sm font-medium">Purchase Price</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-medium text-sm select-none">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={priceInput}
                      onChange={handlePriceChange}
                      placeholder="500,000"
                      className={`w-full pl-7 pr-4 py-3 border text-text font-medium text-base bg-white transition-colors ${isOverMax ? "border-red-400" : "border-border"}`}
                      style={{ borderRadius: "2px" }}
                    />
                  </div>
                  {isOverMax && (
                    <p className="text-red-500 text-xs font-medium">Loan amount exceeds the $2,000,000 program maximum.</p>
                  )}
                </div>

                {/* Credit Score */}
                <div className="space-y-1.5">
                  <label className="text-text text-sm font-medium block">Credit Score</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ficoInput}
                    onChange={handleFicoChange}
                    placeholder="760"
                    className={`block w-full px-4 py-3 border text-text font-medium text-base bg-white transition-colors ${ficoTooLow || ficoInvalid ? "border-red-400" : "border-border"}`}
                    style={{ borderRadius: "2px" }}
                  />
                  {ficoTooLow && (
                    <p className="text-red-500 text-xs font-medium">This program requires a minimum credit score of {minFicoRequired}.</p>
                  )}
                </div>

                {/* Down Payment */}
                <div className="space-y-1.5">
                  <label className="text-text text-sm font-medium">Down Payment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DOWN_OPTIONS.map((opt, i) => (
                      <button
                        key={opt.label}
                        onClick={() => setDownIndex(i)}
                        className={`py-3 px-2 border text-sm font-semibold transition-all duration-150 ${
                          downIndex === i
                            ? "bg-navy text-white border-navy"
                            : "bg-white text-text border-border hover:border-navy/40"
                        }`}
                        style={{ borderRadius: "2px" }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loan Product — 2×2 grid */}
                <div className="space-y-1.5">
                  <label className="text-text text-sm font-medium">Loan Product</label>
                  <div className="grid grid-cols-2 gap-2">
                    {tier.rates.map((r, i) => (
                      <button
                        key={r.product}
                        onClick={() => setProductIndex(i)}
                        className={`flex items-center justify-center px-3 py-3.5 border text-sm font-medium text-center transition-all duration-150 ${
                          productIndex === i
                            ? "bg-navy text-white border-navy"
                            : "bg-white text-text border-border hover:border-navy/40"
                        }`}
                        style={{ borderRadius: "2px" }}
                      >
                        {r.product}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conventional loan note */}
                {showConventionalNote && (
                  <div className="flex gap-2.5 bg-gold/8 border border-gold/25 px-4 py-3" style={{ borderRadius: "2px" }}>
                    <span className="text-gold mt-0.5 flex-shrink-0">⚠</span>
                    <p className="text-gold/90 text-xs leading-relaxed">
                      With {DOWN_OPTIONS[downIndex].pct}% down and a loan under the conforming limit (${conformingLimit.toLocaleString()}), a conventional loan may offer a lower rate. Contact us to compare both options.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Right: Results ───────────────────────────────────────── */}
              <div className="flex flex-col gap-4">

                {/* Rate + Payment */}
                <div className="bg-navy text-white p-6 sm:p-8" style={{ borderRadius: "3px" }}>
                  <p className="section-label text-teal mb-4">Your Estimated Rate</p>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-none tabular-nums">
                      {adjustedRate.toFixed(3)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <p className="text-white/50 text-sm">
                      APR {hasValidLoan ? `${aprPct.toFixed(3)}%` : "—"} · {tier.rates[productIndex].product}
                    </p>
                    <span className="section-label text-teal border border-teal/40 px-2 py-0.5 flex-shrink-0" style={{ borderRadius: "2px" }}>
                      No PMI
                    </span>
                  </div>

                  <div className="border-t border-white/10 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Purchase Price</span>
                      <span className="text-white font-medium tabular-nums">
                        {purchasePrice > 0 ? fmt$(purchasePrice) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Down Payment ({DOWN_OPTIONS[downIndex].pct}%)</span>
                      <span className="text-white font-medium tabular-nums">
                        {purchasePrice > 0 ? fmt$(downAmount) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Loan Amount</span>
                      <span className="text-white font-semibold tabular-nums">
                        {loanAmount > 0 ? fmt$(loanAmount) : "—"}
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm font-medium">Est. Monthly P&I</span>
                        <span className="text-white font-bold text-xl sm:text-2xl tabular-nums">
                          {hasValidLoan ? `${fmt$(monthlyPayment, 2)}/mo` : "—"}
                        </span>
                      </div>
                      <p className="text-white/30 text-xs mt-1">
                        Principal & interest only — excludes taxes, insurance, and HOA.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="bg-white border border-border p-5 sm:p-6" style={{ borderRadius: "3px" }}>
                  <p className="section-label text-muted mb-4">Estimated Lender Fees</p>
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between text-sm gap-4">
                      <span className="text-muted">
                        {originationIsFlat
                          ? "Origination (minimum)"
                          : `Origination (${loanAmount > 1_500_000 ? "0.750%" : "1.000%"})`}
                      </span>
                      <span className="text-text font-semibold tabular-nums shrink-0">
                        {hasValidLoan ? fmt$(originationFee) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Underwriting Fee</span>
                      <span className="text-text font-semibold tabular-nums">$1,630</span>
                    </div>
                    <div className="border-t border-border pt-2.5 flex items-center justify-between">
                      <span className="text-text text-sm font-semibold">Total Lender Fees</span>
                      <span className="text-navy font-bold tabular-nums">
                        {hasValidLoan ? fmt$(totalFees) : "—"}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted/60 text-xs mt-3 leading-relaxed">
                    The origination fee is a one-time charge at closing that covers loan processing and broker compensation. Third-party fees (title, escrow, recording) are not included and vary by transaction.
                  </p>
                </div>

                {/* CTA */}
                <a
                  href="#contact"
                  className="block w-full text-center bg-teal hover:bg-teal-light text-white font-semibold py-4 text-sm tracking-widest uppercase transition-all duration-200 hover:shadow-lg"
                  style={{ borderRadius: "3px" }}
                >
                  Get Pre-Approved →
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ── Disclaimer ───────────────────────────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-border px-6 py-5" style={{ borderRadius: "3px" }}>
              <p className="section-label text-muted mb-3">Disclosures</p>
              <ul className="space-y-1.5 text-xs text-muted leading-relaxed list-disc list-inside">
                <li>Rates assume a <strong className="text-text">30-day rate lock</strong> and a primary residence purchase in Maryland. Rates are subject to change without notice.</li>
                <li>APR reflects the cost of credit expressed as a yearly rate, calculated using the actual loan amount and lender fees shown. Does not include third-party closing costs.</li>
                <li>Monthly payment is principal &amp; interest only and does not include property taxes, homeowners insurance, or HOA dues.</li>
                <li>ARM products are 30-year fully amortizing loans indexed to the 30-day average SOFR with a 3.50% margin and floor. Rate adjusts every 6 months after the initial fixed period.</li>
                <li>A rate is not locked until a formal lock confirmation is issued in writing. All loans subject to credit approval, income verification, and property appraisal. Not a commitment to lend. Equal Housing Broker.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Contact Form ─────────────────────────────────────────────────── */}
        <section id="contact" className="py-12 sm:py-16 bg-navy">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="section-label text-teal mb-3">Get Started</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-white mb-3">Request Your Consultation</h2>
              <p className="text-white/50 text-sm">
                We&apos;ll reach out within one business day with next steps.
              </p>
            </div>
            <PricingLeadForm pricer={pricerSnapshot} />
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
