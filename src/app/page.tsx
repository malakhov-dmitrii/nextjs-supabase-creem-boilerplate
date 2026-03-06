import Link from "next/link";
import { ShieldCheck, CreditCard, Database, Bell, UserCircle, Rocket } from "lucide-react";

function WaveDivider({ flip, fill = "var(--bg-primary)" }: { flip?: boolean; fill?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""}`}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-[60px] md:h-[80px]">
        <path
          d="M0,40 C360,120 720,0 1080,80 C1260,120 1380,40 1440,60 L1440,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

function ZigzagDivider({ fill = "var(--bg-cream)" }: { fill?: string }) {
  return (
    <div className="w-full overflow-hidden leading-[0]">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[30px] md:h-[40px]">
        <polygon
          points="0,60 20,0 40,60 60,0 80,60 100,0 120,60 140,0 160,60 180,0 200,60 220,0 240,60 260,0 280,60 300,0 320,60 340,0 360,60 380,0 400,60 420,0 440,60 460,0 480,60 500,0 520,60 540,0 560,60 580,0 600,60 620,0 640,60 660,0 680,60 700,0 720,60 740,0 760,60 780,0 800,60 820,0 840,60 860,0 880,60 900,0 920,60 940,0 960,60 980,0 1000,60 1020,0 1040,60 1060,0 1080,60 1100,0 1120,60 1140,0 1160,60 1180,0 1200,60 1220,0 1240,60 1260,0 1280,60 1300,0 1320,60 1340,0 1360,60 1380,0 1400,60 1420,0 1440,60"
          fill={fill}
        />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ═══ HERO — Cream background like Creem ═══ */}
      <section className="bg-bg-cream">
        <header>
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <span className="text-xl font-extrabold text-text-dark tracking-tight">
              SaaSKit
            </span>
            <nav className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="text-sm font-bold text-text-dark/70 hover:text-text-dark transition-colors duration-150"
              >
                Pricing
              </Link>
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

        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-24 text-center">
          <div className="inline-block px-4 py-1.5 bg-accent-orange/15 text-accent-orange text-xs font-bold uppercase tracking-widest border-2 border-accent-orange/30 rounded-full mb-8">
            Next.js + Supabase + Creem
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-text-dark leading-[0.9] mb-6">
            LAUNCH YOUR
            <br />
            <span className="text-accent-orange italic">SAAS.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-dark/60 max-w-xl mx-auto mb-10 font-medium">
            A production-ready boilerplate with auth, database, payments &amp;
            subscriptions. Ship in hours, not weeks.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-3 text-base btn-primary">
              Start Building →
            </Link>
            <a
              href="https://github.com/malakhov-dmitrii/nextjs-supabase-creem-boilerplate"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 text-base btn-secondary"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ═══ Violet blob divider ═══ */}
      <section className="bg-bg-violet relative">
        <WaveDivider flip fill="var(--bg-cream)" />
        <div className="py-4" />
        <WaveDivider fill="var(--bg-primary)" />
      </section>

      {/* ═══ FEATURES — Dark section ═══ */}
      <section className="bg-bg-primary py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary text-center mb-4">
            Everything you need to{" "}
            <span className="text-accent-orange italic">ship</span>
          </h2>
          <p className="text-text-secondary text-center mb-14 text-lg max-w-2xl mx-auto">
            Authentication, payments, database, webhooks — all wired up and ready to go.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-bg-secondary rounded-2xl border-2 border-border p-6"
                style={{ boxShadow: "4px 4px 0px rgba(255, 255, 255, 0.08)" }}
              >
                <div className="mb-3 text-accent-orange">{f.icon}</div>
                <h3 className="font-extrabold text-lg mb-2 text-text-primary">
                  {f.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Zigzag divider ═══ */}
      <ZigzagDivider />

      {/* ═══ STACK — Cream section ═══ */}
      <section className="bg-bg-cream py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-dark mb-4">
            Built with the{" "}
            <span className="text-accent-violet italic">best stack</span>
          </h2>
          <p className="text-text-dark/50 mb-12 text-lg">
            Modern tools, zero configuration headaches.
          </p>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            {[
              "Next.js 16",
              "React 19",
              "TypeScript",
              "Tailwind CSS",
              "Supabase",
              "Creem",
            ].map((tech) => (
              <span
                key={tech}
                className="px-5 py-2 bg-white text-text-dark font-bold text-sm border-2 border-black rounded-full"
                style={{ boxShadow: "3px 3px 0px #000" }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Wave divider cream → dark ═══ */}
      <WaveDivider fill="var(--bg-primary)" />

      {/* ═══ CTA — Orange section ═══ */}
      <section className="bg-accent-orange py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold text-black tracking-tight mb-4 leading-tight">
            Ready to launch
            <br />
            <span className="italic">your SaaS?</span>
          </h2>
          <p className="text-black/60 mb-8 text-lg font-medium">
            Clone the repo, configure your environment, and start accepting
            payments in minutes.
          </p>
          <Link href="/signup" className="inline-block px-8 py-3 text-base btn-dark">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-bg-primary border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center text-sm text-text-muted">
          <p>
            Built with Next.js, Supabase &{" "}
            <a
              href="https://creem.io"
              className="text-accent-orange hover:underline font-bold"
            >
              Creem
            </a>
            . Open source and free to use.
          </p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <ShieldCheck size={28} strokeWidth={2.5} />,
    title: "Authentication",
    description:
      "Email/password auth with Supabase. Magic links, OAuth, and session management out of the box.",
  },
  {
    icon: <CreditCard size={28} strokeWidth={2.5} />,
    title: "Payments & Subscriptions",
    description:
      "Creem handles checkout, billing, tax compliance, and subscription lifecycle. Global payments in minutes.",
  },
  {
    icon: <Database size={28} strokeWidth={2.5} />,
    title: "Database",
    description:
      "Supabase Postgres with Row Level Security. Your data is secure and scalable from day one.",
  },
  {
    icon: <Bell size={28} strokeWidth={2.5} />,
    title: "Webhooks",
    description:
      "HMAC-verified webhook handler syncs payment events to your database automatically.",
  },
  {
    icon: <UserCircle size={28} strokeWidth={2.5} />,
    title: "Billing Portal",
    description:
      "Customers manage their own subscriptions — upgrades, cancellations, payment methods.",
  },
  {
    icon: <Rocket size={28} strokeWidth={2.5} />,
    title: "Deploy in Minutes",
    description:
      "One-click deploy to Vercel. Environment variables, and you're live.",
  },
];
