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

export default function LeadForm() {
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
          loan_amount: data.loan_amount,
          real_estate_agent: data.real_estate_agent || "Not specified",
          message: data.message || "",
        },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
      );
      setStatus("success");
      form.reset();
    } catch (err: unknown) {
      const e = err as { text?: string; status?: number; message?: string };
      console.error("EmailJS error — status:", e?.status, "text:", e?.text, "message:", e?.message, "raw:", err);
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="section-label text-teal mb-3">Get Started Today</p>
          <h2 className="font-serif text-2xl sm:text-4xl text-navy mb-4">Request Your Consultation</h2>
          <p className="text-muted text-base sm:text-lg">
            Fill out the form below and a Texas mortgage specialist will reach out within one business day.
          </p>
        </div>

        {/* Success state */}
        {status === "success" ? (
          <div className="bg-teal/5 border border-teal/30 p-8 sm:p-12 text-center" style={{ borderRadius: "2px" }}>
            <div className="w-12 h-12 bg-teal/10 flex items-center justify-center mx-auto mb-4" style={{ borderRadius: "2px" }}>
              <svg className="w-6 h-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="font-serif text-navy text-2xl mb-2">Consultation Requested</h3>
            <p className="text-muted text-sm">
              We&apos;ve received your information and a Texas specialist will reach out within one business day.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            aria-label="Physician Mortgage Pre-Qualification Form"
            className="bg-card border border-border p-5 sm:p-8 shadow-sm space-y-5"
            style={{ borderRadius: "2px" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className={labelClass} htmlFor="first_name">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="first_name" name="first_name" type="text" required
                  placeholder="Jane"
                  className={inputClass}
                  style={{ borderRadius: "2px" }}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="last_name">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="last_name" name="last_name" type="text" required
                  placeholder="Smith"
                  className={inputClass}
                  style={{ borderRadius: "2px" }}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="email">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="email" name="email" type="email" required
                  placeholder="jane@email.com"
                  className={inputClass}
                  style={{ borderRadius: "2px" }}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="phone">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  id="phone" name="phone" type="tel" required
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className={inputClass}
                  style={{ borderRadius: "2px" }}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="designation">
                  Medical Designation <span className="text-red-400">*</span>
                </label>
                <select
                  id="designation" name="designation" required
                  className={inputClass}
                  style={{ borderRadius: "2px" }}
                >
                  <option value="">Select designation</option>
                  {designations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="loan_amount">
                  Estimated Loan Amount <span className="text-red-400">*</span>
                </label>
                <select
                  id="loan_amount" name="loan_amount" required
                  className={inputClass}
                  style={{ borderRadius: "2px" }}
                >
                  <option value="">Select range</option>
                  <option>Under $500K</option>
                  <option>$500K – $750K</option>
                  <option>$750K – $1M</option>
                  <option>$1M – $1.5M</option>
                  <option>$1.5M – $2M</option>
                  <option>Over $2M</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="real_estate_agent">
                Are you working with a Real Estate Agent?
              </label>
              <select
                id="real_estate_agent" name="real_estate_agent"
                className={inputClass}
                style={{ borderRadius: "2px" }}
              >
                <option value="">Select an option</option>
                <option>Yes</option>
                <option>No</option>
                <option>Not yet, but looking for one</option>
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="message">
                Anything else we should know? (optional)
              </label>
              <textarea
                id="message" name="message" rows={3}
                placeholder="E.g., currently in fellowship, starting new job in 3 months..."
                className={inputClass}
                style={{ borderRadius: "2px", resize: "none" }}
              />
            </div>

            {status === "error" && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3" style={{ borderRadius: "2px" }}>
                Something went wrong. Please try again or email us directly.
              </p>
            )}

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3 border-y border-border">
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
              By submitting, you agree to be contacted by a Texas mortgage specialist. We do not sell your information.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
