import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupportedLanguage, defaultLang } from "@/lib/i18n";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("preferred_lang")?.value;
  const resolvedLang = lang && isSupportedLanguage(lang) ? lang : defaultLang;
  redirect(`/${resolvedLang}/admin`);
}
