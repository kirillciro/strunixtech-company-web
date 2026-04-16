import Header from "@/app/src/components/home/Header";
import Footer from "@/app/src/components/home/Footer";
import type { Metadata } from "next";
import HeroSection from "@/app/src/components/home/HeroSection";
import SocialProofSection from "@/app/src/components/home/SocialProofSection";
import HowItWorksSection from "@/app/src/components/home/HowItWorksSection";
import TemplatesShowcaseSection from "@/app/src/components/home/TemplatesShowcaseSection";
import DemoPreviewSection from "@/app/src/components/home/DemoPreviewSection";
import CallToActionSection from "@/app/src/components/home/CallToActionSection";
import ScrollReveal from "@/app/src/components/home/ScrollReveal";
import CookieConsent from "@/app/src/components/home/CookieConsent";
import PositioningSection from "@/app/src/components/home/PositioningSection";
import { getDictionary } from "@/lib/getDictionary";
import { defaultLang, isSupportedLanguage, languages } from "@/lib/i18n";
import ServicesSection from "../src/components/home/ServicesSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang = isSupportedLanguage(lang) ? lang : defaultLang;
  const dict = await getDictionary(resolvedLang);

  const languageAlternates = Object.fromEntries(
    languages.map((code) => [code, `${siteUrl}/${code}`]),
  );

  return {
    title: `${dict.hero.title} | Company Platform`,
    description: dict.hero.description,
    alternates: {
      canonical: `${siteUrl}/${resolvedLang}`,
      languages: {
        ...languageAlternates,
        "x-default": `${siteUrl}/${defaultLang}`,
      },
    },
    openGraph: {
      title: `${dict.hero.title} | Company Platform`,
      description: dict.hero.description,
      url: `${siteUrl}/${resolvedLang}`,
      type: "website",
    },
  };
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Build a slug→title map so the Header can show translated template category names
  const templateCategoryLabels = Object.fromEntries(
    Object.entries(dict.templates.categories).map(([slug, cat]) => [
      slug,
      (cat as { title: string }).title,
    ]),
  );

  return (
    <div className="relative bg-slate-950 text-white overflow-x-clip">
      <ScrollReveal />
      <CookieConsent />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-45">
        <div className="absolute inset-0 grid-overlay"></div>
      </div>
      <Header
        lang={lang}
        labels={dict.header}
        templateCategoryLabels={templateCategoryLabels}
      />

      <main>
        <HeroSection content={dict.hero} />
        <PositioningSection content={dict.positioning} />
        <HowItWorksSection content={dict.howItWorks} />
        <TemplatesShowcaseSection content={dict.templates} lang={lang} />
        <DemoPreviewSection content={dict.coreOffer} />
        <ServicesSection content={dict.services} />
        <SocialProofSection content={dict.whyChooseUs} />
        <CallToActionSection content={dict.cta} />
      </main>

      <Footer content={dict.footer} />
    </div>
  );
}
