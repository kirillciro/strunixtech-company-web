import { getDictionary } from "@/lib/getDictionary";
import { isSupportedLanguage, defaultLang } from "@/lib/i18n";
import AdminDashboard from "@/app/src/components/admin/AdminDashboard";

export default async function LangAdminPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const resolvedLang = isSupportedLanguage(lang) ? lang : defaultLang;
  const dict = await getDictionary(resolvedLang);

  return <AdminDashboard lang={resolvedLang} adminDict={dict.admin} />;
}
