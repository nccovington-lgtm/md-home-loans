const steps = [
  {
    number: "01",
    title: "Check Your Eligibility",
    body: "Verify your designation qualifies — MD, DO, DDS, PharmD, DVM, DPM, CRNA, or a resident/fellow in any of those programs.",
  },
  {
    number: "02",
    title: "Submit Your Documents",
    body: "Share your employment contract or offer letter, medical license, and we'll run your credit and review the full picture.",
  },
  {
    number: "03",
    title: "Close With Confidence",
    body: "Manual underwrite — no automated rejection surprises. We understand your profile and close your loan efficiently.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label text-teal mb-3">The Process</p>
          <h2 className="font-serif text-2xl sm:text-4xl text-navy mb-4">How It Works</h2>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto">
            Three clear steps. No surprises. Done right the first time.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line on desktop */}
              {i < 2 && (
                <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-border" style={{ zIndex: 0 }} />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Number badge */}
                <div
                  className={`w-12 h-12 flex items-center justify-center font-serif text-lg font-bold mb-5 border-2 ${
                    i === 1
                      ? "bg-teal text-white border-teal"
                      : "bg-white text-navy border-border"
                  }`}
                  style={{ borderRadius: "2px" }}
                >
                  {step.number}
                </div>
                <h3 className="font-serif text-navy text-lg sm:text-xl mb-3">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed max-w-xs">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <a
            href="#contact"
            className="inline-block bg-teal hover:bg-teal-light text-white font-semibold px-8 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 hover:shadow-lg"
            style={{ borderRadius: "3px" }}
          >
            Start Step 1 — Check My Eligibility
          </a>
        </div>
      </div>
    </section>
  );
}
