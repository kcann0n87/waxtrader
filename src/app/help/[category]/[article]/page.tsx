import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { findArticle, helpCategories } from "@/lib/help";

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ category: string; article: string }>;
}) {
  const { category, article } = await params;
  const found = findArticle(category, article);
  if (!found) notFound();

  const related = found.category.articles.filter((a) => a.slug !== article).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/help" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Help
        </Link>
        <span>/</span>
        <Link href={`/help/${category}`} className="hover:text-slate-900">
          {found.category.title}
        </Link>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{found.article.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">{found.article.body}</p>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="text-sm font-semibold text-slate-700">Was this helpful?</div>
          <div className="mt-3 flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
              <ThumbsUp size={14} /> Yes
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700">
              <ThumbsDown size={14} /> No
            </button>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold tracking-wider text-slate-500 uppercase">
            Related articles
          </h2>
          <ul className="space-y-2">
            {related.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/help/${found.category.slug}/${a.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:border-indigo-300 hover:bg-indigo-50/30"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/help/contact"
        className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition hover:bg-emerald-100"
      >
        <MessageCircle className="text-emerald-700" size={20} />
        <div className="flex-1">
          <div className="text-sm font-bold text-emerald-900">Still need help?</div>
          <div className="text-xs text-emerald-800">
            Real human response within 24 hours · faster for order issues
          </div>
        </div>
      </Link>
    </div>
  );
}

export function generateStaticParams() {
  return helpCategories.flatMap((c) =>
    c.articles.map((a) => ({ category: c.slug, article: a.slug })),
  );
}
