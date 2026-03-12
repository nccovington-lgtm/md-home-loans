export default function LoanOptions() {
  return (
    <section id="loan-options" className="py-24 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-label text-teal mb-3">Loan Options</p>
          <h2 className="font-serif text-2xl sm:text-4xl text-white mb-4">Choose the Right Loan for You</h2>
          <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
            Fixed-rate stability or ARM flexibility — both with no PMI and no penalty for your career stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          {/* Fixed Rate */}
          <div className="bg-white/5 border border-white/10 border-l-4 p-5 sm:p-8" style={{ borderRadius: "2px", borderLeftColor: "#2E7D6B" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-teal/20 flex items-center justify-center flex-shrink-0" style={{ borderRadius: "2px" }}>
                <span className="text-teal font-bold text-sm">F</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg sm:text-xl">Fixed Rate</h3>
                <p className="text-white/50 text-xs section-label mt-0.5">Consistent payment, every month</p>
              </div>
            </div>

            <div className="space-y-2">
              {["15-Year Fixed", "20-Year Fixed", "25-Year Fixed", "30-Year Fixed"].map((term) => (
                <div
                  key={term}
                  className="flex items-center justify-between bg-white/5 border border-white/8 px-4 py-3 hover:bg-white/10 transition-colors"
                  style={{ borderRadius: "2px" }}
                >
                  <span className="text-white text-sm font-medium">{term}</span>
                  <span className="section-label text-teal">Available</span>
                </div>
              ))}
            </div>

            <p className="text-white/40 text-sm mt-5 leading-relaxed">
              Ideal if you plan to stay long-term and want predictable payments from day one.
            </p>
          </div>

          {/* ARM */}
          <div className="bg-white/5 border border-white/10 border-l-4 p-5 sm:p-8" style={{ borderRadius: "2px", borderLeftColor: "#C9A84C" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-gold/20 flex items-center justify-center flex-shrink-0" style={{ borderRadius: "2px" }}>
                <span className="text-gold font-bold text-sm">A</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg sm:text-xl">Adjustable Rate (ARM)</h3>
                <p className="text-white/50 text-xs section-label mt-0.5">Lower initial rate, shorter horizons</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { term: "5/6 ARM", desc: "Fixed 5 yrs, adjusts every 6 months" },
                { term: "7/6 ARM", desc: "Fixed 7 yrs, adjusts every 6 months" },
                { term: "10/6 ARM", desc: "Fixed 10 yrs, adjusts every 6 months" },
              ].map(({ term, desc }) => (
                <div
                  key={term}
                  className="bg-white/5 border border-white/8 px-4 py-3 hover:bg-white/10 transition-colors"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white text-sm font-medium">{term}</span>
                    <span className="section-label text-gold">Available</span>
                  </div>
                  <p className="text-white/40 text-xs">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 border border-gold/20 bg-gold/5 px-4 py-3" style={{ borderRadius: "2px" }}>
              <p className="text-gold/80 text-xs sm:text-sm leading-relaxed">
                <span className="font-semibold text-gold">ARM Details —</span> All ARMs are fully amortizing 30-year loans. Indexed to 30-day avg SOFR, 3.50% margin/floor. Assumable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
