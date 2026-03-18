"use client";

import { useState, FormEvent } from "react";
import emailjs from "@emailjs/browser";

const designations = [
  "MD – Medical Doctor",
  "DO – Doctor of Osteopathy",
  "DDS / DMD – Dental Surgery",
  "PharmD – Doctor of Pharmacy",
  "DVM / VMD – Veterinary Medicine",
  "DPM – Doctor of Podiatric Medicine",
  "CRNA – Certified Registered Nurse Anesthetist",
  "Resident / Fellow / Intern",
  "Other",
];

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "w-full border border-border px-4 py-3 text-text placeholder-muted/60 text-sm focus:border-teal focus:ring-0 transition bg-white";
const labelClass = "block section-label text-muted mb-1.5";

export interface PricerSnapshot {
  purchasePrice: string;
  downPayment: string;
  loanAmount: string;
  creditScore: string;
  product: string;
  rate: string;
  apr: string;
  monthlyPayment: string;
  originationFee: string;
  originationLabel: string;
  totalFees: string;
}

export default function PricingLeadForm({ pricer }: { pricer: PricerSnapshot }) {
  const [status, setStatus] = useState<Status>("idle");
  const [phone, setPhone] = useState("");

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const pricerBlock = [
      "=== PRICER TOOL DATA ===",
      `Purchase Price:   ${pricer.purchasePrice}`,
      `Down Payment:     ${pricer.downPayment}`,
      `Loan Amount:      ${pricer.loanAmount}`,
      `Credit Score:     ${pricer.creditScore}`,
      `Product:          ${pricer.product}`,
      `Rate:             ${pricer.rate}`,
      `APR:              ${pricer.apr}`,
      `Monthly P&I:      ${pricer.monthlyPayment}/mo`,
      `${pricer.originationLabel}: ${pricer.originationFee}`,
      `Underwriting Fee: $1,630`,
      `Total Lender Fees: ${pricer.totalFees}`,
    ].join("\n");

    const clientNote = (data.message as string)?.trim();
    const fullMessage = clientNote
      ? `${pricerBlock}\n\nClient notes:\n${clientNote}`
      : pricerBlock;

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          first_name: data.first_name,
          last_name: data.last_name,
          from_email: data.email,
          phone: data.phone,
          designation: data.designation,
          loan_amount: pricer.loanAmount,
          real_estate_agent: data.real_estate_agent || "Not specified",
          message: fullMessage,
        },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
      );
      setStatus("success");
      form.reset();
      setPhone("");
    } catch (err: unknown) {
      const e = err as { text?: string; status?: number; message?: string };
      console.error("EmailJS error:", e?.status, e?.text, e?.message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white p-6 sm:p-10 text-center" style={{ borderRadius: "3px" }}>
        {/* Icon */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 bg-teal/10 rounded-full" />
          <div className="absolute inset-2 bg-teal/20 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>

        <h3 className="font-serif text-navy text-2xl sm:text-3xl mb-3">You&apos;re All Set</h3>
        <p className="text-muted text-sm sm:text-base max-w-sm mx-auto leading-relaxed mb-8">
          We&apos;ve received your information and a mortgage specialist will reach out within one business day.
        </p>

        {/* Divider with what's next */}
        <div className="border-t border-border pt-6">
          <p className="section-label text-muted mb-4">What happens next</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-left">
            {[
              { step: "01", text: "We review your details" },
              { step: "02", text: "A specialist reaches out" },
              { step: "03", text: "We lock your rate" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 bg-background px-4 py-3 flex-1" style={{ borderRadius: "2px" }}>
                <span className="font-bold text-teal text-sm tabular-nums">{item.step}</span>
                <span className="text-text text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border p-5 sm:p-8 shadow-sm space-y-5"
      style={{ borderRadius: "2px" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className={labelClass} htmlFor="p_first_name">First Name <span className="text-red-400">*</span></label>
          <input id="p_first_name" name="first_name" type="text" required placeholder="Jane" className={inputClass} style={{ borderRadius: "2px" }} />
        </div>
        <div>
          <label className={labelClass} htmlFor="p_last_name">Last Name <span className="text-red-400">*</span></label>
          <input id="p_last_name" name="last_name" type="text" required placeholder="Smith" className={inputClass} style={{ borderRadius: "2px" }} />
        </div>
        <div>
          <label className={labelClass} htmlFor="p_email">Email Address <span className="text-red-400">*</span></label>
          <input id="p_email" name="email" type="email" required placeholder="jane@email.com" className={inputClass} style={{ borderRadius: "2px" }} />
        </div>
        <div>
          <label className={labelClass} htmlFor="p_phone">Phone Number <span className="text-red-400">*</span></label>
          <input
            id="p_phone" name="phone" type="tel" required
            placeholder="(555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            className={inputClass}
            style={{ borderRadius: "2px" }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="p_designation">Medical Designation <span className="text-red-400">*</span></label>
          <select id="p_designation" name="designation" required className={inputClass} style={{ borderRadius: "2px" }}>
            <option value="">Select designation</option>
            {designations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="p_agent">Working with a Real Estate Agent?</label>
          <select id="p_agent" name="real_estate_agent" className={inputClass} style={{ borderRadius: "2px" }}>
            <option value="">Select an option</option>
            <option>Yes</option>
            <option>No</option>
            <option>Not yet, but looking for one</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="p_message">Anything else we should know? (optional)</label>
        <textarea
          id="p_message" name="message" rows={3}
          placeholder="E.g., currently in fellowship, starting new job in 3 months..."
          className={inputClass}
          style={{ borderRadius: "2px", resize: "none" }}
        />
      </div>

      {status === "error" && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3" style={{ borderRadius: "2px" }}>
          Something went wrong. Please try again or contact us directly.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-3 border-y border-border">
        {[
          { icon: "🔒", text: "Secure & Private" },
          { icon: "✓", text: "No Hard Credit Pull" },
          { icon: "⏱", text: "Response in 1 Business Day" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-1.5">
            <span className="text-xs">{item.icon}</span>
            <span className="section-label text-muted">{item.text}</span>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-teal hover:bg-teal-light disabled:opacity-60 text-white font-semibold py-4 text-xs tracking-widest uppercase transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed"
        style={{ borderRadius: "3px" }}
      >
        {status === "sending" ? "Sending..." : "Request My Consultation →"}
      </button>

      <p className="text-muted text-xs text-center">
        By submitting, you agree to be contacted by a mortgage specialist. We do not sell your information.
      </p>
    </form>
  );
}
