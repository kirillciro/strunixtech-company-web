import Link from "next/link";
import { templateCategories } from "@/lib/template-categories";

// Static template list used until templates are moved into PostgreSQL + backend APIs.
const templates = [
  { id: 1, name: "Barber Booking App" },
  { id: 2, name: "Painter Website" },
  { id: 3, name: "E-commerce Store" },
];

export default function TemplatesPage() {
  return (
    <div>
      <h1 className="mb-3 text-2xl font-bold">Templates</h1>
      <p className="mb-6 text-slate-600">
        Select a niche category first. Inside each category you can continue
        into specific template demos.
      </p>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templateCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/templates/${category.slug}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-900">{category.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{category.detail}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">Example Template Demos</h2>

      {/* These remain direct demo entries while the backend template inventory is still static. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/templates/${template.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-semibold">{template.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
