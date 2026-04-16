"use client";

import Link from "next/link";
import { templateCategories } from "@/lib/template-categories";
import {
  Briefcase,
  Calendar,
  ShoppingBag,
  LayoutDashboard,
  MessagesSquare,
  MousePointerClick,
  Rocket,
  Smartphone,
  Bot,
  UserRound,
  ArrowRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  calendar: Calendar,
  "shopping-bag": ShoppingBag,
  "layout-dashboard": LayoutDashboard,
  "messages-square": MessagesSquare,
  smartphone: Smartphone,
  bot: Bot,
  "mouse-pointer-click": MousePointerClick,
  "user-round": UserRound,
  rocket: Rocket,
};

export default function ProfileTemplatesTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">Templates</h2>
        <p className="text-slate-400 text-sm">
          Browse template categories and select the right fit for your project
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {templateCategories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] ?? LayoutDashboard;
          return (
            <Link
              key={cat.slug}
              href={`/templates/${cat.slug}`}
              className="group flex items-start gap-4 p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all hover:bg-slate-800/60"
            >
              <div className="p-2.5 rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors shrink-0">
                <Icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white mb-1">
                  {cat.title}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {cat.detail}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
