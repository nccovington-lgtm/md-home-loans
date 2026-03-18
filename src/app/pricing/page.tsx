import type { Metadata } from "next";
import PricingCalculator from "@/components/PricingCalculator";

export const metadata: Metadata = {
  title: "Physician Mortgage Rate Estimator | Best Suited Mortgage",
  description: "Estimate your physician mortgage rate and monthly payment. 0%, 5%, and 10% down options with no PMI.",
  robots: { index: false, follow: false },
};

export default function PricingPage() {
  return <PricingCalculator />;
}
