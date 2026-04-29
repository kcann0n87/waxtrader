import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { helpCategories } from "@/lib/help";

export default async function HelpCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = helpCategories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/help" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Help
        </Link>
        <span>/</span>
        <span className="text-slate-900">{category.title}</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">{category.title}</h1>
      <p className="mt-1 text-slate-600">{category.description}</p>

      <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {category.articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/help/${category.slug}/${a.slug}`}
              className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"
            >
              <div>
                <div className="text-base font-semibold text-slate-900">{a.title}</div>
                <div className="mt-0.5 line-clamp-1 text-sm text-slate-500">{a.body}</div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-sm text-slate-500">
        Still stuck?{" "}
        <Link href="/help/contact" className="font-semibold text-indigo-600 hover:underline">
          Contact support →
        </Link>
      </p>
    </div>
  );
}
