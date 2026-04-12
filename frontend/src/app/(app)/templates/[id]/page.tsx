import Link from "next/link";
import { templateCategoryMap } from "@/lib/template-categories";

interface TemplatePageProps {
  params: {
    id: string;
  };
}

export default function TemplatePage({ params }: TemplatePageProps) {
  const category = templateCategoryMap[params.id];

  if (category) {
    return (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Template Category
        </p>
        <h1 className="mb-3 text-2xl font-bold">{category.title}</h1>
        <p className="mb-6 max-w-2xl text-slate-600">{category.detail}</p>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Category route is active at{" "}
            <span className="font-semibold text-slate-800">
              /templates/{category.slug}
            </span>
            . Next step is loading real templates from backend for this niche.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/templates"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Categories
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Chat With Developer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Fallback route for direct template demo ids, e.g. /templates/1. */}
      <h1 className="mb-4 text-2xl font-bold">Template #{params.id}</h1>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p>Preview of template UI</p>

        <button className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-white">
          Use this template
        </button>
      </div>
    </div>
  );
}
