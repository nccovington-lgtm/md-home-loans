"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Teal top stripe */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-teal z-50" />

      <nav
        className={`fixed top-1 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white/97 backdrop-blur-md shadow-sm border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              {/* Medical cross icon */}
              <div className="w-7 h-7 flex-shrink-0">
                <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="2" width="8" height="24" rx="1" fill="#2E7D6B" />
                  <rect x="2" y="10" width="24" height="8" rx="1" fill="#2E7D6B" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="section-label text-teal">Powered By</span>
                <span className={`font-bold text-base md:text-lg tracking-tight transition-colors duration-300 ${scrolled ? "text-navy" : "text-white"}`}>
                  Best Suited Mortgage
                </span>
              </div>
            </div>

            {/* CTA */}
            <a
              href="#contact"
              className="bg-teal hover:bg-teal-light text-white font-semibold px-5 py-2.5 text-xs tracking-widest uppercase transition-all duration-200 hover:shadow-md"
              style={{ borderRadius: "3px" }}
            >
              Get Pre-Approved
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
