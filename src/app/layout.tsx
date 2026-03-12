import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import SchemaMarkup from "@/components/SchemaMarkup";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Texas Physician Mortgage | 0% Down, No PMI, Up to $2M | Best Suited Mortgage",
  description:
    "Texas physician mortgage loans for MDs, DOs, residents & fellows. 100% financing up to $2M, no PMI, student loans excluded in residency. Get pre-approved today.",
  keywords: [
    "physician mortgage Texas",
    "doctor loan Texas",
    "Texas physician home loan",
    "no PMI doctor mortgage Texas",
    "physician mortgage residency Texas",
    "doctor home loan 0 down Texas",
    "medical resident mortgage Texas",
    "physician mortgage 100 percent financing",
    "1099 doctor mortgage Texas",
    "CRNA mortgage loan Texas",
    "dentist mortgage loan Texas",
    "PharmD home loan Texas",
  ],
  openGraph: {
    title: "Texas Physician Mortgage | Built for Doctors | Best Suited Mortgage",
    description:
      "Up to 100% financing, no PMI, $2M max. Built specifically for Texas medical professionals including residents and fellows.",
    type: "website",
    locale: "en_US",
    siteName: "Best Suited Mortgage",
    url: "https://md.bestsuitedmortgage.com",
    images: [{ url: "https://md.bestsuitedmortgage.com/api/og", width: 1200, height: 630, alt: "Texas Physician Mortgage — Best Suited Mortgage" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Texas Physician Mortgage | Best Suited Mortgage",
    description: "0% down, no PMI, up to $2M. The mortgage built for Texas doctors.",
    images: ["https://md.bestsuitedmortgage.com/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  other: {
    "geo.region": "US-TX",
    "geo.placename": "Texas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <SchemaMarkup />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background`}>
        {children}
      </body>
    </html>
  );
}
