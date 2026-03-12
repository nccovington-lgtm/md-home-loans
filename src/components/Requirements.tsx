const requirements = [
  "Primary residence only (1-unit property)",
  "Owner-occupied within 60 days of closing",
  "Purchase or rate/term refinance only — no cash-out",
  "No secondary financing / no private mortgage insurance",
  "Escrow/impound accounts required",
  "Valid U.S. Social Security Number required",
  "U.S. Citizens, Permanent & Non-Permanent Resident Aliens eligible (H1B, L1, E1, etc.)",
  "Available in Texas only",
];

export default function Requirements() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="section-label text-teal mb-3">Requirements</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-navy mb-4">Program Requirements Snapshot</h2>
          <p className="text-muted text-base sm:text-lg">
            We believe in full transparency. Here&apos;s what&apos;s required to qualify.
          </p>
        </div>

        <div className="bg-card border border-border overflow-hidden" style={{ borderRadius: "2px" }}>
          {requirements.map((req, i) => (
            <div
              key={req}
              className={`flex items-start gap-3 px-4 sm:px-6 py-4 ${i < requirements.length - 1 ? "border-b border-border" : ""} ${i % 2 === 0 ? "bg-card" : "bg-background/50"}`}
            >
              <div className="w-5 h-5 flex-shrink-0 mt-0.5 bg-teal/10 flex items-center justify-center" style={{ borderRadius: "2px" }}>
                <svg className="w-3 h-3 text-teal" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-text text-sm leading-relaxed">{req}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
