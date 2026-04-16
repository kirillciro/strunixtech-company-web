export type TemplateCategory = {
  slug: string;
  title: string;
  detail: string;
  icon:
    | "briefcase"
    | "calendar"
    | "shopping-bag"
    | "layout-dashboard"
    | "messages-square"
    | "smartphone"
    | "bot"
    | "mouse-pointer-click"
    | "user-round"
    | "rocket";
  description: string;
};

export const templateCategories: TemplateCategory[] = [
  {
    slug: "business",
    title: "Business Websites",
    detail:
      "For agencies, consultants, local companies, and service-based businesses.",
    icon: "briefcase",
    description: "Professional websites for service-based businesses",
  },
  {
    slug: "bookings",
    title: "Booking Systems",
    detail: "For barbers, salons, clinics, and appointment-based businesses.",
    icon: "calendar",
    description: "Appointment and reservation management systems",
  },
  {
    slug: "ecommerce",
    title: "E-commerce",
    detail: "For online stores, product brands, and fast-moving retail ideas.",
    icon: "shopping-bag",
    description: "Online stores and shopping platforms",
  },
  {
    slug: "admin-dashboards",
    title: "Dashboards / Admin Systems",
    detail: "For SaaS tools, internal systems, analytics, and CRM products.",
    icon: "layout-dashboard",
    description: "Internal dashboards and admin panels",
  },
  {
    slug: "chat-community",
    title: "Chat / Community Apps",
    detail: "For startups, communities, and customer support systems.",
    icon: "messages-square",
    description: "Community platforms and chat applications",
  },
  {
    slug: "mobile-ui",
    title: "Mobile App UI",
    detail: "For startups, app ideas, and showcasing mobile products.",
    icon: "smartphone",
    description: "Mobile app interfaces and prototypes",
  },
  {
    slug: "ai-tools",
    title: "AI Tools",
    detail:
      "For automation products, assistants, generators, and SaaS platforms.",
    icon: "bot",
    description: "Automation-driven tools and assistant platforms",
  },
  {
    slug: "landing-pages",
    title: "Landing Pages / Marketing Funnels",
    detail:
      "For product launches, lead generation, and conversion-focused campaigns.",
    icon: "mouse-pointer-click",
    description: "High-converting landing pages and marketing funnels",
  },
  {
    slug: "portfolio",
    title: "Personal & Portfolio Websites",
    detail:
      "For freelancers, designers, developers, and creatives showcasing their work.",
    icon: "user-round",
    description: "Personal sites and professional portfolios",
  },
  {
    slug: "saas-startup",
    title: "SaaS MVP / Startup Launch Kits",
    detail:
      "For founders looking to ship fast, validate ideas, and launch their first product.",
    icon: "rocket",
    description: "Rapid SaaS MVPs and startup launch kits",
  },
];

export const templateCategoryMap = Object.fromEntries(
  templateCategories.map((category) => [category.slug, category]),
) as Record<string, TemplateCategory>;
