import Link from "next/link";
import { PricingSection } from "@/components/pricing-section";

// Creem test product IDs — replace with production IDs before going live
const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "month",
    productId: "prod_2U8uqiBvIw7tRkwwG2flRw",
    features: ["3 projects", "Basic analytics", "Email support", "1 team member"],
  },
  {
    name: "Pro",
    price: "$29",
    period: "month",
    productId: "prod_1CqUBve5mBwFXcE9i02GJw",
    popular: true,
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "5 team members",
      "Custom integrations",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "month",
    productId: "prod_4GCQZSu3BSZMaXSkzE8hD4",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Dedicated support",
      "SLA guarantee",
      "Custom contracts",
      "SSO / SAML",
    ],
  },
];

function WaveDivider({ fill = "var(--bg-primary)" }: { fill?: string }) {
  return (
    <div className="w-full overflow-hidden leading-[0]">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="w-full h-[60px] md:h-[80px]"
      >
        <path
          d="M0,40 C360,120 720,0 1080,80 C1260,120 1380,40 1440,60 L1440,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* ═══ Hero — Cream background ═══ */}
      <section className="bg-bg-cream">
        <header>
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-extrabold text-text-dark tracking-tight">
              SaaSKit
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-bold text-text-dark/70 hover:text-text-dark transition-colors duration-150"
              >
                Sign In
              </Link>
              <Link href="/signup" className="text-sm px-5 py-2 btn-primary">
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 pb-20 text-center">
          <div className="inline-block px-4 py-1.5 bg-accent-orange/15 text-accent-orange text-xs font-bold uppercase tracking-widest border-2 border-accent-orange/30 rounded-full mb-8">
            Pricing
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-text-dark leading-[0.9] mb-4">
            SIMPLE,
            <br />
            <span className="text-accent-orange italic">TRANSPARENT</span>
            <br />
            PRICING.
          </h1>
          <p className="text-lg text-text-dark/60 font-medium">
            Choose the plan that fits your needs. Cancel anytime.
          </p>
        </div>
      </section>

      <WaveDivider />

      {/* ═══ Pricing Cards — Dark section ═══ */}
      <section className="bg-bg-primary py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <PricingSection plans={plans} />
        </div>
      </section>

      {/* ═══ Footer note ═══ */}
      <section className="bg-bg-primary pb-16">
        <div className="text-center text-sm text-text-muted">
          <p>All plans include a 14-day free trial. No credit card required.</p>
          <p className="mt-1">
            Payments processed securely by{" "}
            <a
              href="https://creem.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-orange font-bold hover:underline"
            >
              Creem
            </a>
            . Tax compliance handled automatically.
          </p>
        </div>
      </section>
    </div>
  );
}
