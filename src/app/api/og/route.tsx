import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          background: "linear-gradient(160deg, #112540 0%, #1B3A5C 55%, #1f4a3a 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid watermark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* ECG line watermark */}
        <svg
          viewBox="0 0 1200 120"
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "1200px",
            opacity: 0.05,
            transform: "translateY(-50%)",
          }}
        >
          <polyline
            points="0,60 150,60 180,60 210,10 240,110 270,30 300,90 330,60 480,60 510,60 540,10 570,110 600,30 630,90 660,60 810,60 840,60 870,10 900,110 930,30 960,90 990,60 1200,60"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>

        {/* Top: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Medical cross */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="10" y="2" width="8" height="24" rx="1" fill="#2E7D6B" />
            <rect x="2" y="10" width="24" height="8" rx="1" fill="#2E7D6B" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#2E7D6B", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
              Powered By
            </span>
            <span style={{ color: "white", fontSize: "18px", fontFamily: "sans-serif", fontWeight: 700, lineHeight: 1.1 }}>
              Best Suited Mortgage
            </span>
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div style={{ width: "40px", height: "2px", background: "#2E7D6B" }} />
            <span style={{ color: "#2E7D6B", fontSize: "13px", fontFamily: "sans-serif", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
              Texas Physician Mortgage Program
            </span>
          </div>
          <span style={{ color: "white", fontSize: "58px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Up to 100% Financing.
          </span>
          <span style={{ fontSize: "58px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#C9A84C", fontStyle: "italic" }}>No PMI.</span>
            <span style={{ color: "white" }}> Built for Doctors.</span>
          </span>
        </div>

        {/* Bottom: stat cards */}
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { value: "$2M", label: "Max Loan" },
            { value: "0%", label: "Down Payment" },
            { value: "0%", label: "PMI" },
            { value: "50%", label: "Max DTI" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                borderLeft: "3px solid #2E7D6B",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span style={{ color: "#C9A84C", fontSize: "32px", fontWeight: 800, lineHeight: 1 }}>
                {stat.value}
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
