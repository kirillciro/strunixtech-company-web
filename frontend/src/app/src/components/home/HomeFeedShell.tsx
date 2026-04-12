"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { templateCategories } from "@/lib/template-categories";

type HomeImage = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
};

export default function HomeFeedShell({
  comPlatImages,
}: {
  comPlatImages: HomeImage[];
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTemplateCategories, setShowTemplateCategories] = useState(true);

  const featured = useMemo(() => comPlatImages[0], [comPlatImages]);
  const feedImages = useMemo(() => comPlatImages.slice(1), [comPlatImages]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_8%_8%,#cff8de_0%,transparent_35%),radial-gradient(circle_at_88%_6%,#dce9ff_0%,transparent_34%),linear-gradient(145deg,#f4f6fb_0%,#f7fdf8_45%,#fbfbff_100%)] text-slate-900">
      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        className="fixed left-4 top-5 z-40 rounded-2xl border border-white/55 bg-white/45 p-3 transition hover:bg-white/70"
        aria-label="Open navigation"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-slate-800"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 7h16M4 12h16M4 17h11" strokeLinecap="round" />
        </svg>
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[320px] transform border-r border-white/40 bg-white/28 p-5 transition duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-slate-900 p-2 text-white">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                <path d="M3 4h14v2H3V4zm0 5h10v2H3V9zm0 5h14v2H3v-2z" />
              </svg>
            </div>
            <p className="font-semibold tracking-wide">Company-Name</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-white/60"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="block rounded-xl bg-white/50 px-4 py-3 text-sm font-semibold text-slate-800"
          >
            Home Feed
          </Link>
          <Link
            href="/login"
            className="block rounded-xl bg-white/40 px-4 py-3 text-sm text-slate-700 transition hover:bg-white/60"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block rounded-xl bg-white/40 px-4 py-3 text-sm text-slate-700 transition hover:bg-white/60"
          >
            Chat With Developer
          </Link>

          <button
            type="button"
            onClick={() => setShowTemplateCategories((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl bg-cyan-600 px-4 py-3 text-left text-sm font-semibold text-white"
          >
            Templates
            <span>{showTemplateCategories ? "-" : "+"}</span>
          </button>

          {showTemplateCategories ? (
            <div className="space-y-2 rounded-2xl border border-white/45 bg-white/35 p-3">
              {templateCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/templates/${category.slug}`}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-white/65"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </aside>

      {isMenuOpen ? (
        <button
          type="button"
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30"
          aria-label="Close navigation overlay"
        />
      ) : null}

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 md:px-10 lg:px-12">
        <header className="ml-16 flex items-center justify-between md:ml-20">
          <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/55 px-3 py-2">
            <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
              <defs>
                <linearGradient id="feedCore" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0f766e" />
                </linearGradient>
              </defs>
              <rect
                x="6"
                y="6"
                width="52"
                height="52"
                rx="14"
                fill="url(#feedCore)"
              />
              <path d="M20 22h24v4H20zm0 8h16v4H20zm0 8h24v4H20z" fill="#fff" />
            </svg>
            <p className="text-sm font-semibold tracking-wider">COMPANY-NAME</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/templates"
              className="rounded-xl border border-white/55 bg-white/65 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              Templates
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start Chat
            </Link>
          </div>
        </header>

        <main className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.95fr]">
          <section className="space-y-6">
            <article className="rounded-[28px] border border-white/55 bg-white/62 p-7">
              <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Home Feed
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Choose a template.
                <br />
                Customize it. See it live.
                <br />
                Then we build it.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
                This is a feed-first homepage for direct brand traffic with
                richer visuals and a sliding liquid-glass side header for fast
                category navigation.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Chat With Developer Directly
                </Link>
                <Link
                  href="/templates/business"
                  className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
                >
                  Explore Business Templates
                </Link>
                <Link
                  href="/templates/mobile-ui"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Mobile App UI
                </Link>
              </div>
            </article>

            <article className="overflow-hidden rounded-[28px] border border-white/55 bg-white/62">
              <div className="border-b border-slate-200/80 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Cloudinary Feed (com-plat)
                </p>
              </div>

              {featured ? (
                <div className="relative aspect-video w-full">
                  <Image
                    src={featured.secure_url}
                    alt={featured.public_id
                      .replace("com-plat/", "")
                      .replaceAll("-", " ")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 900px"
                    priority
                  />
                </div>
              ) : (
                <p className="px-6 py-8 text-sm text-slate-600">
                  No Cloudinary images found in com-plat/ yet.
                </p>
              )}
            </article>

            {feedImages.length > 0 ? (
              <section className="grid gap-4 sm:grid-cols-2">
                {feedImages.map((asset) => (
                  <article
                    key={asset.public_id}
                    className="overflow-hidden rounded-3xl border border-white/55 bg-white/62"
                  >
                    <div className="relative aspect-4/5">
                      <Image
                        src={asset.secure_url}
                        alt={asset.public_id
                          .replace("com-plat/", "")
                          .replaceAll("-", " ")}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 420px"
                      />
                    </div>
                    <p className="line-clamp-1 px-4 py-3 text-sm font-medium text-slate-700">
                      {asset.public_id.replace("com-plat/", "")}
                    </p>
                  </article>
                ))}
              </section>
            ) : null}
          </section>

          <section className="space-y-5">
            <article className="rounded-3xl border border-white/55 bg-white/62 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Template Niches
              </p>
              <div className="mt-4 space-y-2">
                {templateCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/templates/${category.slug}`}
                    className="block rounded-xl border border-slate-200 bg-white/85 px-4 py-3 transition hover:bg-cyan-50"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {category.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {category.detail}
                    </p>
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-white/55 bg-white/62 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Flow
              </p>
              <ol className="mt-4 space-y-2 text-sm text-slate-700">
                <li>1. User picks a category.</li>
                <li>2. User enters a template and customizes it.</li>
                <li>3. User chats with developer and books a call.</li>
                <li>4. Project starts after approval.</li>
              </ol>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
