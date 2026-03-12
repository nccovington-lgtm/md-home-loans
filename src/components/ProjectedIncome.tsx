export default function ProjectedIncome() {
  return (
    <section className="py-24 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: offer letter card */}
          <div className="bg-white/5 border border-white/10 border-l-4 p-5 sm:p-8 relative overflow-hidden" style={{ borderRadius: "2px", borderLeftColor: "#C9A84C" }}>
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
              <svg className="w-48 h-48" viewBox="0 0 24 24" fill="white">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
              </svg>
            </div>
            <div className="relative">
              <p className="section-label text-gold mb-4">Offer Letter Program</p>
              <h3 className="font-serif text-white text-xl sm:text-2xl mb-4">
                Got an Offer Letter? You Can Close Now.
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                You don&apos;t have to wait until your first paycheck. We accept projected income from a signed employment offer — even if you haven&apos;t started yet.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: "Start date up to 150 days after closing",
                    sub: "One of the most flexible windows in the industry",
                  },
                  {
                    title: "Guaranteed or minimum salary required",
                    sub: "Contract must clearly state a fixed or minimum compensation",
                  },
                  {
                    title: "Allowed contingencies: license & standard admin",
                    sub: "Receipt of medical license, background check, drug test only",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-5 h-5 flex-shrink-0 mt-0.5 bg-teal/20 flex items-center justify-center" style={{ borderRadius: "2px" }}>
                      <svg className="w-3 h-3 text-teal" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-white/50 text-xs mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div>
            <p className="section-label text-teal mb-4">Starting Your First Job?</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-white mb-6">
              Close Before You Even Start Working.{" "}
              <span className="text-gold italic">Only Here.</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-5">
              Most loan programs want two years of work history. We built this for the moment you transition — from training to attending, from student to professional.
            </p>
            <p className="text-white/60 text-base leading-relaxed">
              Whether you&apos;re finishing fellowship, starting a private practice, or joining a Texas hospital system — if you have the offer letter, we have the loan.
            </p>

            <div className="mt-8 border border-gold/20 bg-gold/5 px-5 py-4" style={{ borderRadius: "2px" }}>
              <p className="section-label text-gold mb-1">Reserve Requirement Note</p>
              <p className="text-white/50 text-sm leading-relaxed">
                When using projected income, reserve requirements apply. We&apos;ll walk you through exactly what&apos;s needed during your consultation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
