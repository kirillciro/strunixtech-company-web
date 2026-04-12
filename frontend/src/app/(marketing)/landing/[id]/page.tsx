import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const campaignContent = {
  green: {
    eyebrow: "Performance Campaign",
    headline: "Preview your website before you pay - then launch fast.",
    description:
      "Built for campaigns that need speed, clear messaging, and direct developer communication from first click.",
    accent: "bg-emerald-600",
  },
  red: {
    eyebrow: "Urgency Campaign",
    headline: "No guessing, no delay - see your preview before paying.",
    description:
      "Use this variant for high-intent traffic that should move quickly from ad click to chat and preview.",
    accent: "bg-rose-600",
  },
  blue: {
    eyebrow: "Trust Campaign",
    headline: "Work directly with a developer and approve scope before build.",
    description:
      "This version fits credibility-driven audiences that need clarity, lower risk, and visible delivery steps.",
    accent: "bg-blue-600",
  },
  enterprise: {
    eyebrow: "B2B Campaign",
    headline: "Website delivery for teams that need speed and certainty.",
    description:
      "Enterprise buyers get a clear process, direct technical contact, and preview approval before implementation.",
    accent: "bg-slate-900",
  },
  "chat-boost": {
    eyebrow: "Conversion Campaign",
    headline: "Start chat now and get your preview path in minutes.",
    description:
      "Ideal for chat-first acquisition where speed, qualification, and momentum are the top priority.",
    accent: "bg-cyan-600",
  },
} as const;

type CampaignId = keyof typeof campaignContent;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const campaign = campaignContent[id as CampaignId];

  if (!campaign) {
    return {
      title: "Campaign Landing | Company Platform",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${campaign.eyebrow} | Company Platform`,
    description: campaign.description,
    alternates: {
      canonical: `${siteUrl}/landing/${id}`,
    },
    robots: {
      // Paid-traffic variants are intentionally isolated from SEO competition.
      index: false,
      follow: true,
    },
    openGraph: {
      title: campaign.headline,
      description: campaign.description,
      url: `${siteUrl}/landing/${id}`,
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return Object.keys(campaignContent).map((id) => ({ id }));
}

export default async function DynamicLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = campaignContent[id as CampaignId];

  if (!campaign) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              {campaign.eyebrow}
            </p>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
              {campaign.headline}
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              {campaign.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className={`rounded-xl px-5 py-3 text-white transition hover:opacity-90 ${campaign.accent}`}
              >
                Start Chat with Developer
              </Link>

              <Link
                href="/templates"
                className="rounded-xl border border-slate-200 px-5 py-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                See Templates
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Preview before payment",
                "No long contracts",
                "Direct developer communication",
                "Clear scope before build",
              ].map((item) => (
                <p
                  key={item}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Campaign ID
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{id}</p>

            <div className="mt-8 space-y-4 text-slate-600">
              <p>What happens next?</p>
              <p>1. We understand your offer and traffic goal.</p>
              <p>2. You choose the closest template direction.</p>
              <p>3. We deliver a preview path for approval.</p>
              <p>4. After approval, we build and launch.</p>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Preview URL
              </p>
              <p className="mt-2 break-all font-medium text-slate-900">
                /landing/{id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
