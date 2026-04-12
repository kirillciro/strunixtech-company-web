import { redirect } from "next/navigation";
import { defaultLang } from "@/lib/i18n";

export default function Home() {
  redirect(`/${defaultLang}`);
}
