export type HeaderContent = {
  templates: string;
  login: string;
  logout: string;
  chat: string;
};

export type HeroStepContent = {
  step: string;
  title: string;
  detail: string;
};

export type HeroContent = {
  title: string;
  subtitle: string;
  description: string;
  roadmapLabel: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustedBy: string;
  steps: HeroStepContent[];
};

export type HowItWorksStepContent = {
  step: string;
  title: string;
  description: string;
};

export type HowItWorksContent = {
  title: string;
  description: string;
  cta: string;
  steps: HowItWorksStepContent[];
};

export type TemplateDemoContent = {
  name: string;
  category: string;
};

export type TemplateCategoryContent = {
  title: string;
  detail: string;
};

export type TemplatesContent = {
  title: string;
  description: string;
  explore: string;
  featuredTitle: string;
  demoPreview: string;
  featuredDemos: TemplateDemoContent[];
  categories: Record<string, TemplateCategoryContent>;
};

export type CoreOfferPointContent = {
  title: string;
  description: string;
};

export type CoreOfferContent = {
  eyebrow: string;
  title: string;
  description: string;
  briefTitle: string;
  briefItems: string[];
  previewTitle: string;
  previewFallback: string;
  points: CoreOfferPointContent[];
};

export type ServiceGroupContent = {
  title: string;
  items: string[];
};

export type ServicesContent = {
  title: string;
  description: string;
  groups: ServiceGroupContent[];
};

export type WhyChooseUsReasonContent = {
  title: string;
  description: string;
};

export type WhyChooseUsStatContent = {
  label: string;
  target: number;
  suffix?: string;
  prefix?: string;
};

export type WhyChooseUsContent = {
  title: string;
  description: string;
  reasons: WhyChooseUsReasonContent[];
  stats: WhyChooseUsStatContent[];
};

export type CallToActionContent = {
  title: string;
  description: string;
  primary: string;
  secondary: string;
  trust: string;
};

export type FooterContent = {
  brandDescription: string;
  servicesTitle: string;
  services: string[];
  companyTitle: string;
  company: string[];
  legalTitle: string;
  legal: string[];
  contactTitle: string;
  rights: string;
};

export type MarketingDictionary = {
  header: HeaderContent;
  hero: HeroContent;
  howItWorks: HowItWorksContent;
  templates: TemplatesContent;
  coreOffer: CoreOfferContent;
  services: ServicesContent;
  whyChooseUs: WhyChooseUsContent;
  cta: CallToActionContent;
  footer: FooterContent;
};

export type TranslationEntry = {
  path: string;
  value: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectTranslationEntries(
  value: unknown,
  currentPath: string,
  entries: TranslationEntry[],
) {
  if (typeof value === "string") {
    entries.push({ path: currentPath, value });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const nextPath = currentPath ? `${currentPath}.${index}` : String(index);
      collectTranslationEntries(item, nextPath, entries);
    });
    return;
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([key, nestedValue]) => {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      collectTranslationEntries(nestedValue, nextPath, entries);
    });
  }
}

export function getTranslationEntries(
  dictionary: MarketingDictionary,
): TranslationEntry[] {
  const entries: TranslationEntry[] = [];
  collectTranslationEntries(dictionary, "", entries);
  return entries;
}

export function applyTranslatedEntries(
  baseDictionary: MarketingDictionary,
  translatedEntries: TranslationEntry[],
): MarketingDictionary {
  const nextDictionary = structuredClone(baseDictionary);

  translatedEntries.forEach(({ path, value }) => {
    const segments = path.split(".");
    let cursor: unknown = nextDictionary;

    for (let index = 0; index < segments.length - 1; index += 1) {
      const segment = segments[index];

      if (Array.isArray(cursor)) {
        cursor = cursor[Number(segment)];
        continue;
      }

      if (isRecord(cursor)) {
        cursor = cursor[segment];
        continue;
      }

      throw new Error(`Invalid translation path: ${path}`);
    }

    const leaf = segments[segments.length - 1];

    if (Array.isArray(cursor)) {
      cursor[Number(leaf)] = value;
      return;
    }

    if (isRecord(cursor)) {
      cursor[leaf] = value;
      return;
    }

    throw new Error(`Invalid translation path: ${path}`);
  });

  return nextDictionary;
}
