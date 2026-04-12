import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaign Landing Hub | Company Platform",
  description:
    "Internal hub for campaign landing variants. Paid traffic should point to /landing/[id] routes.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LandingPage() {
  const campaignIds = ["green", "red", "blue", "enterprise", "chat-boost"];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
            Campaign Hub
          </p>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
            Campaign landing variants live under /landing/[id]
          </h1>

          <p className="mt-6 text-lg text-slate-600">
            Use this route as an internal preview page for campaign variants. Ad
            traffic should go directly to a specific landing page such as
            /landing/green or /landing/chat-boost.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Back to Homepage
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
            >
              Open Registration
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {campaignIds.map((campaignId) => (
            <Link
              key={campaignId}
              href={`/landing/${campaignId}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Campaign
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                {campaignId}
              </h2>
              <p className="mt-3 text-slate-600">
                Preview the dedicated landing route for this audience segment.
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
