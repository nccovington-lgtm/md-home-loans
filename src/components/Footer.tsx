export default function Footer() {
  return (
    <footer className="bg-navy border-t border-white/10">
      {/* Top teal accent bar */}
      <div className="h-1 bg-teal w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 flex-shrink-0">
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="2" width="8" height="24" rx="1" fill="#2E7D6B" />
                  <rect x="2" y="10" width="24" height="8" rx="1" fill="#2E7D6B" />
                </svg>
              </div>
              <div>
                <p className="section-label text-teal">Powered By</p>
                <p className="text-white font-semibold text-base">Best Suited Mortgage</p>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mt-3">
              Texas&apos;s physician mortgage specialists — helping Texas doctors, residents, and fellows buy homes with the financing they deserve.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="section-label text-teal mb-4">Quick Links</p>
            <ul className="space-y-2 text-sm">
              {[
                { href: "#why-different", label: "Why This Program" },
                { href: "#highlights", label: "Program Highlights" },
                { href: "#loan-options", label: "Loan Options" },
                { href: "#how-it-works", label: "How It Works" },
                { href: "#faq", label: "FAQ" },
                { href: "#contact", label: "Get Pre-Approved" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-white/50 hover:text-gold transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Licensing */}
          <div>
            <p className="section-label text-teal mb-4">Licensing & Compliance</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-white/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: "2px" }}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Equal Housing Broker</p>
                <p className="text-white/40 text-xs">NMLS# 2622691</p>
              </div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-4">
              Best Suited Mortgage is a Licensed Mortgage Broker in the State of Texas. NMLS# 2622691.
            </p>
            <ul className="space-y-2 text-xs">
              {[
                { href: "https://bestsuitedmortgage.com/licensing/", label: "Licensing & Disclosures" },
                { href: "https://bestsuitedmortgage.com/privacy-policy/", label: "Privacy Policy" },
                { href: "https://bestsuitedmortgage.com/terms-of-use/", label: "Terms of Use" },
                { href: "https://www.nmlsconsumeraccess.org/TuringTestPage.aspx?ReturnUrl=/EntityDetails.aspx/COMPANY/2622691", label: "NMLS Consumer Access" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-gold transition-colors"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + disclaimer */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-white/30 text-xs leading-relaxed">
            <strong className="text-white/50">Disclaimer:</strong> This program is offered through Best Suited Mortgage, a Licensed Mortgage Broker in the State of Texas. NMLS# 2622691. Lending guidelines are subject to change without notice. Not all applicants will qualify. All loans are subject to credit approval, income verification, and property appraisal. This program is available in Texas only. This is not a commitment to lend. Equal Housing Broker.
          </p>
          <p className="text-white/20 text-xs mt-3">
            © {new Date().getFullYear()} Best Suited Mortgage. All rights reserved. | Texas Physician Mortgage Program
          </p>
        </div>
      </div>
    </footer>
  );
}
