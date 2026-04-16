import { type NextRequest, NextResponse } from "next/server";
import { getDictionary } from "@/lib/getDictionary";

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "en";
  const dict = await getDictionary(lang);
  return NextResponse.json({ content: dict });
}
