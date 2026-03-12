export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #112540 0%, #1B3A5C 55%, #1f4a3a 100%)" }}
    >
      {/* ECG / heartbeat watermark */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points="0,100 120,100 150,100 180,20 210,180 240,60 270,140 300,100 420,100 450,100 480,30 510,170 540,50 570,150 600,100 720,100 750,100 780,20 810,180 840,60 870,140 900,100 1020,100 1050,100 1080,30 1110,170 1140,50 1170,150 1200,100 1440,100"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-28 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-teal/50 text-teal bg-teal/10 mb-8 px-4 py-1.5" style={{ borderRadius: "2px" }}>
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <rect x="4" y="0" width="4" height="12" />
            <rect x="0" y="4" width="12" height="4" />
          </svg>
          <span className="section-label text-teal">Texas Physician Mortgage Program</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
          Up to 100% Financing.
          <br />
          <span className="text-gold italic">No PMI.</span> Built for Doctors.
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Texas doctors deserve better. Purchase up to{" "}
          <span className="text-white font-medium">$2,000,000</span> with as little as{" "}
          <span className="text-white font-medium">0% down</span> — even during residency. No mortgage insurance. No compromise.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#contact"
            className="bg-teal hover:bg-teal-light text-white font-semibold px-8 py-3.5 text-xs tracking-widest uppercase transition-all duration-200 hover:shadow-lg"
            style={{ borderRadius: "3px" }}
          >
            See If I Qualify
          </a>
          <a
            href="#why-different"
            className="border border-white/30 hover:border-white/60 text-white/80 hover:text-white font-medium px-8 py-3.5 text-xs tracking-widest uppercase transition-all duration-200"
            style={{ borderRadius: "3px" }}
          >
            Learn More
          </a>
        </div>

        {/* Credential stat cards */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { value: "$2M", label: "Max Loan Amount" },
            { value: "0%", label: "Down Payment" },
            { value: "0%", label: "Mortgage Insurance" },
            { value: "50%", label: "Max DTI Ratio" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border-l-2 border-teal p-4 text-left"
              style={{ borderRadius: "2px" }}
            >
              <div className="font-serif text-2xl sm:text-3xl text-gold font-bold">{stat.value}</div>
              <div className="section-label text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
