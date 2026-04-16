export type HeaderContent = {
  templates: string;
  login: string;
  logout: string;
  chat: string;
  services: string;
  company: string;
  legal: string;
  myProfile: string;
  adminDashboard: string;
  serviceItems: string[];
  companyItems: string[];
  legalItems: string[];
  translationOn: string;
  translationOff: string;
};

export type HeroContent = {
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustedBy: string;
  companies: string[];
};

export type PositioningContent = {
  whyTitle: string;
  whyItems: string[];
  forTitle: string;
  forItems: string[];
  nextTitle: string;
  nextSteps: string[];
  supportTitle: string;
  supportPoints: string[];
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

export type DashboardDictionary = {
  myProfile: string;
  backToSite: string;
  tabs: {
    overview: string;
    messages: string;
    templates: string;
    settings: string;
  };
  overview: {
    welcomeBack: string;
    quickAccess: string;
    emailVerified: string;
    emailNotVerified: string;
    providerAccount: string;
    links: {
      messages: { label: string; description: string };
      templates: { label: string; description: string };
      settings: { label: string; description: string };
    };
  };
  messages: {
    title: string;
    subtitle: string;
    online: string;
    connecting: string;
    translationOn: string;
    translationOff: string;
    translationDesc: string;
    emptyTitle: string;
    emptySubtitle: string;
    inputPlaceholderEmpty: string;
    inputPlaceholderReply: string;
    inputPlaceholderConnecting: string;
    userTag: string;
    adminTag: string;
    translationLabel: string;
    faqSuggestions: string[];
  };
  settings: {
    title: string;
    subtitle: string;
    verified: string;
    notVerified: string;
    fieldFullName: string;
    fieldEmail: string;
    fieldSignIn: string;
    fieldMemberSince: string;
    signOutTitle: string;
    signOutSubtitle: string;
    signOutButton: string;
  };
};

export type AdminDictionary = {
  title: string;
  backToSite: string;
  tabs: { overview: string; users: string; content: string; messages: string };
  overview: {
    title: string;
    subtitle: string;
    statUsers: string;
    statContent: string;
    statLocales: string;
    errorLoad: string;
    tipsTitle: string;
    tip1: string;
    tip2: string;
    tip3: string;
  };
  users: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    colUser: string;
    colProvider: string;
    colStatus: string;
    colRole: string;
    verified: string;
    pending: string;
    makeAdmin: string;
    removeAdmin: string;
    confirmSure: string;
    delete: string;
    cancel: string;
    loading: string;
    noUsers: string;
  };
  messages: {
    title: string;
    subtitle: string;
    newBadge: string;
    live: string;
    connecting: string;
    translationOn: string;
    translationOff: string;
    translationLabel: string;
    translationDesc: string;
    adminTag: string;
    userTag: string;
    noConversations: string;
    noUsersMatch: string;
    selectConversation: string;
    noMessages: string;
    searchPlaceholder: string;
    deleteConversation: string;
    deleteConfirm: string;
    deleteCancel: string;
  };
  content: {
    title: string;
    subtitle: string;
    sectionLabel: string;
    sectionHero: string;
    sectionPositioning: string;
    sectionHowItWorks: string;
    sectionTemplates: string;
    sectionCoreOffer: string;
    sectionServices: string;
    sectionWhyChooseUs: string;
    sectionCta: string;
    sectionFooter: string;
    loading: string;
    saving: string;
    translating: string;
    retranslating: string;
    allUpdated: string;
    save: string;
    retranslate: string;
  };
};

export type MarketingDictionary = {
  header: HeaderContent;
  hero: HeroContent;
  positioning: PositioningContent;
  howItWorks: HowItWorksContent;
  templates: TemplatesContent;
  coreOffer: CoreOfferContent;
  services: ServicesContent;
  whyChooseUs: WhyChooseUsContent;
  cta: CallToActionContent;
  footer: FooterContent;
  dashboard: DashboardDictionary;
  admin: AdminDictionary;
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
