import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      "https://nextjs-supabase-creem-boilerplate.vercel.app"
  ),
  title: "SaaSKit — Next.js + Supabase + Creem Boilerplate",
  description:
    "The most comprehensive SaaS boilerplate with Creem payments. Auth, subscriptions, license keys, credits, webhooks, and demo mode — ship your SaaS in hours.",
  keywords: [
    "SaaS boilerplate",
    "Next.js",
    "Supabase",
    "Creem",
    "payments",
    "subscriptions",
    "TypeScript",
  ],
  openGraph: {
    title: "SaaSKit — Next.js + Supabase + Creem Boilerplate",
    description:
      "Auth, payments, subscriptions, license keys, credits wallet — ship your SaaS in hours.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaSKit — Ship your SaaS in hours",
    description:
      "Production-ready boilerplate with Creem payments, Supabase auth, and demo mode.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
