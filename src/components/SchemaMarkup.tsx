const SITE_URL = "https://md.bestsuitedmortgage.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Best Suited Mortgage",
  url: SITE_URL,
  description:
    "Texas physician mortgage specialists helping doctors, residents, and fellows buy homes with specialized financing.",
  address: {
    "@type": "PostalAddress",
    addressRegion: "TX",
    addressCountry: "US",
  },
  identifier: {
    "@type": "PropertyValue",
    name: "NMLS",
    value: "2622691",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    areaServed: "TX",
    availableLanguage: "English",
  },
};

const financialServiceSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "Best Suited Mortgage — Texas Physician Loan Program",
  url: SITE_URL,
  description:
    "Specialized physician mortgage loans for Texas medical professionals. Up to 100% financing, no PMI, up to $2,000,000. Available for MDs, DOs, DDS, PharmD, DVM, CRNA, residents and fellows.",
  areaServed: {
    "@type": "State",
    name: "Texas",
  },
  audience: {
    "@type": "Audience",
    audienceType: "Medical Professionals",
    description:
      "Licensed physicians, dentists, pharmacists, veterinarians, podiatrists, nurse anesthetists, and medical residents in Texas",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Physician Mortgage Products",
    itemListElement: [
      {
        "@type": "Offer",
        name: "30-Year Fixed Physician Mortgage",
        description:
          "30-year fixed rate mortgage for Texas physicians. Up to $2M, 0% down, no PMI required.",
      },
      {
        "@type": "Offer",
        name: "15-Year Fixed Physician Mortgage",
        description:
          "15-year fixed rate mortgage for Texas physicians. Faster payoff with no PMI.",
      },
      {
        "@type": "Offer",
        name: "5/6 ARM Physician Mortgage",
        description:
          "Adjustable rate mortgage for physicians fixed for 5 years, then adjusts every 6 months. Indexed to SOFR.",
      },
      {
        "@type": "Offer",
        name: "7/6 ARM Physician Mortgage",
        description:
          "Adjustable rate mortgage fixed for 7 years. Ideal for physicians planning to move or refinance.",
      },
      {
        "@type": "Offer",
        name: "10/6 ARM Physician Mortgage",
        description:
          "10-year fixed ARM for physicians seeking medium-term stability.",
      },
    ],
  },
  provider: {
    "@type": "Organization",
    name: "Best Suited Mortgage",
    identifier: {
      "@type": "PropertyValue",
      name: "NMLS",
      value: "2622691",
    },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I qualify for a physician mortgage while still in residency?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We accept current residency income for qualification. You do not need to wait until you become an attending physician. Student loans in deferment or on IBR plans can also be excluded from your debt-to-income ratio while in residency or fellowship.",
      },
    },
    {
      "@type": "Question",
      name: "Do deferred student loans count against me on a physician mortgage?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not if you are currently in residency or a medical fellowship. Student loan payments in deferment or reporting as $0 on an IBR plan can be excluded from your DTI ratio, allowing you to qualify for a significantly larger loan on your current income.",
      },
    },
    {
      "@type": "Question",
      name: "Can I get a physician mortgage with a signed offer letter before I start working?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We accept projected income from a fully executed employment contract or offer letter. Your employment start date can be up to 150 days after your closing date. The offer letter must state your position, start date, and guaranteed or minimum salary.",
      },
    },
    {
      "@type": "Question",
      name: "Is a down payment required for a physician mortgage?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No down payment is required in most cases. We offer up to 100% financing — with a 680 credit score on loans up to $1.5 million, and a 720 credit score on loans up to $2 million. No private mortgage insurance (PMI) is required at any LTV.",
      },
    },
    {
      "@type": "Question",
      name: "Is PMI required on a physician mortgage?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Private mortgage insurance is never required on this program, even with 0% down payment. This can save Texas physicians hundreds of dollars every month compared to conventional loans.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use gift funds for the down payment or closing costs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Gift funds are accepted from family members or domestic partners. There is no minimum borrower contribution required.",
      },
    },
    {
      "@type": "Question",
      name: "What if I am a 1099 contractor rather than a W-2 employee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1099 income is accepted if you have an executed contract that clearly states a guaranteed or minimum salary for at least 12 months.",
      },
    },
    {
      "@type": "Question",
      name: "What is the minimum credit score required for a Texas physician mortgage?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The minimum credit score is 680 for most scenarios. A 720+ score is required to access the maximum $2,000,000 loan amount with 100% financing.",
      },
    },
  ],
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Texas Physician Mortgage | 0% Down, No PMI, Up to $2M | Best Suited Mortgage",
  description:
    "Physician mortgage loans for Texas doctors. Up to $2M, 100% financing, no PMI. Available for MDs, DOs, residents, fellows, dentists, pharmacists and more.",
  url: SITE_URL,
  inLanguage: "en-US",
  isPartOf: {
    "@type": "WebSite",
    name: "Best Suited Mortgage",
    url: SITE_URL,
  },
  about: {
    "@type": "Thing",
    name: "Physician Mortgage Loans Texas",
  },
  audience: {
    "@type": "Audience",
    audienceType: "Medical Professionals",
    description: "Texas physicians, residents, fellows, dentists, pharmacists, and other licensed medical professionals",
  },
};

export default function SchemaMarkup() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
