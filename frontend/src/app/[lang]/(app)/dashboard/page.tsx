import { getDictionary } from "@/lib/getDictionary";
import { isSupportedLanguage, defaultLang } from "@/lib/i18n";
import ProfileDashboard from "@/app/src/components/profile/ProfileDashboard";

export default async function LangDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const resolvedLang = isSupportedLanguage(lang) ? lang : defaultLang;
  const dict = await getDictionary(resolvedLang);

  return (
    <ProfileDashboard lang={resolvedLang} dashboardDict={dict.dashboard} />
  );
}
