"use client";

import { useState } from "react";

const faqs = [
  {
    q: "I'm still in residency — can I qualify?",
    a: "Yes. Your current residency income is accepted as qualifying income. You don't need to wait until you become an attending physician to purchase a home.",
  },
  {
    q: "My student loans are deferred — will they count against me?",
    a: "Not if you're in a medical residency or fellowship. Student loans in deferment or IBR plans can be excluded from your debt-to-income ratio, significantly improving your qualification.",
  },
  {
    q: "I have a job offer but haven't started yet. Can I still get a loan?",
    a: "Yes. Projected income from a signed employment offer letter is accepted. Your start date can be up to 150 days after closing. The contract must show a guaranteed or minimum salary.",
  },
  {
    q: "Do I need a down payment?",
    a: "Not necessarily. We offer 100% LTV (zero down) for borrowers with a 680+ credit score up to $1.5M, and 720+ up to $2M. Some scenarios may require a down payment depending on your profile.",
  },
  {
    q: "Is PMI (private mortgage insurance) required?",
    a: "No. This is one of the biggest advantages of this program. No PMI is required regardless of your down payment amount — saving you hundreds of dollars per month.",
  },
  {
    q: "Can I use gift funds for the down payment or closing costs?",
    a: "Yes. Gift funds are accepted from family members or domestic partners. There is no minimum borrower contribution required.",
  },
  {
    q: "What if I'm a 1099 contractor rather than a W-2 employee?",
    a: "1099 income is accepted if you have an executed contract that clearly states a guaranteed or minimum salary for at least 12 months.",
  },
  {
    q: "What is the minimum credit score required?",
    a: "The minimum credit score is 680 for most scenarios. A 720+ score is required to access the maximum $2,000,000 loan amount with 100% financing.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-label text-teal mb-3">FAQ</p>
          <h2 className="font-serif text-2xl sm:text-4xl text-navy mb-4">Frequently Asked Questions</h2>
          <p className="text-muted text-base sm:text-lg">
            The questions every Texas doctor asks before applying.
          </p>
        </div>

        {/* Accordion */}
        <div className="border border-border overflow-hidden" style={{ borderRadius: "2px" }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`${i < faqs.length - 1 ? "border-b border-border" : ""}`}
            >
              <button
                className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left hover:bg-background transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-serif text-navy text-sm sm:text-base pr-4">{faq.q}</span>
                <span
                  className={`flex-shrink-0 w-7 h-7 flex items-center justify-center border border-border transition-all duration-200 ${
                    open === i ? "bg-teal border-teal text-white rotate-45" : "bg-background text-muted"
                  }`}
                  style={{ borderRadius: "2px" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-muted leading-relaxed text-sm sm:text-base border-t border-border/50 pt-3">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-muted text-sm mt-10">
          Don&apos;t see your question?{" "}
          <a href="#contact" className="text-teal hover:text-navy font-medium underline underline-offset-2 transition-colors">
            Ask us directly.
          </a>
        </p>
      </div>
    </section>
  );
}
