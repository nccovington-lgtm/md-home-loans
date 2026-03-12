const rows = [
  {
    label: "Student Loans (Deferment/IBR)",
    conventional: "Counted as ~1% of balance/month",
    bsm: "Excluded from DTI entirely",
  },
  {
    label: "Example: $300K in loans",
    conventional: "+$3,000/mo phantom payment",
    bsm: "$0 impact on qualification",
  },
  {
    label: "Residency Income",
    conventional: "Often disqualifying",
    bsm: "Accepted as qualifying income",
  },
  {
    label: "Outcome",
    conventional: "Smaller loan or denial",
    bsm: "Qualify for significantly more",
  },
];

export default function StudentLoans() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left: content */}
          <div className="lg:pt-2">
            <p className="section-label text-teal mb-3">Student Loan Advantage</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-navy mb-6">
              In Residency? Your Student Loans{" "}
              <span className="text-teal italic">Won&apos;t Count Against You.</span>
            </h2>
            <p className="text-muted text-base leading-relaxed mb-5">
              Conventional loans include deferred student loan balances in your DTI calculation — often adding $1,000–$3,000/month in phantom payments. Not here.
            </p>
            <p className="text-muted text-base leading-relaxed">
              If you&apos;re currently in a <strong className="text-navy">residency or medical fellowship</strong>, student loans in <strong className="text-navy">deferment or IBR</strong> plans can be excluded from your debt-to-income ratio entirely — dramatically improving your qualification.
            </p>
          </div>

          {/* Right: clinical comparison table */}
          <div className="overflow-hidden border border-border" style={{ borderRadius: "2px" }}>
            {/* Table header */}
            <div className="grid grid-cols-3">
              <div className="bg-background border-b border-border px-3 py-3">
                <span className="section-label text-muted">Factor</span>
              </div>
              <div className="bg-red-50 border-b border-l border-border px-3 py-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="section-label text-red-700">Standard Lending</span>
              </div>
              <div className="bg-teal/10 border-b border-l border-border px-3 py-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-teal flex-shrink-0" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2}>
                  <rect x="5" y="1" width="4" height="12" />
                  <rect x="1" y="5" width="12" height="4" />
                </svg>
                <span className="section-label text-teal">Best Suited</span>
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 ${i < rows.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className={`px-3 py-3.5 ${i % 2 === 0 ? "bg-background" : "bg-white"}`}>
                  <span className="text-navy text-xs font-semibold leading-snug">{row.label}</span>
                </div>
                <div className={`px-3 py-3.5 border-l border-border ${i % 2 === 0 ? "bg-red-50/50" : "bg-white"}`}>
                  <span className="text-red-700 text-xs leading-snug">{row.conventional}</span>
                </div>
                <div className={`px-3 py-3.5 border-l border-border ${i % 2 === 0 ? "bg-teal/5" : "bg-white"}`}>
                  <span className="text-teal text-xs font-medium leading-snug">{row.bsm}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
