import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyDifferent from "@/components/WhyDifferent";
import EligibleDesignations from "@/components/EligibleDesignations";
import ProgramHighlights from "@/components/ProgramHighlights";
import LoanOptions from "@/components/LoanOptions";
import StudentLoans from "@/components/StudentLoans";
import ProjectedIncome from "@/components/ProjectedIncome";
import HowItWorks from "@/components/HowItWorks";
import Requirements from "@/components/Requirements";
import FAQ from "@/components/FAQ";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <WhyDifferent />
      <EligibleDesignations />
      <ProgramHighlights />
      <LoanOptions />
      <StudentLoans />
      <ProjectedIncome />
      <HowItWorks />
      <Requirements />
      <FAQ />
      <LeadForm />
      <Footer />
    </main>
  );
}
