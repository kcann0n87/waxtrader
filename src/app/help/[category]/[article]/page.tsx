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
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/help" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Help
        </Link>
        <span>/</span>
        <Link href={`/help/${category}`} className="hover:text-white">
          {found.category.title}
        </Link>
      </div>

      <article className="rounded-xl border border-white/10 bg-[#101012] p-8">
        <h1 className="text-2xl font-black tracking-tight text-white">{found.article.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-white/80">{found.article.body}</p>

        <div className="mt-8 border-t border-white/5 pt-6">
          <div className="text-sm font-semibold text-white/80">Was this helpful?</div>
          <div className="mt-3 flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#101012] px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-emerald-500/10 hover:text-emerald-300">
              <ThumbsUp size={14} /> Yes
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#101012] px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-rose-500/10 hover:text-rose-300">
              <ThumbsDown size={14} /> No
            </button>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold tracking-wider text-white/50 uppercase">
            Related articles
          </h2>
          <ul className="space-y-2">
            {related.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/help/${found.category.slug}/${a.slug}`}
                  className="block rounded-lg border border-white/10 bg-[#101012] px-4 py-3 text-sm font-semibold text-white hover:border-amber-700/50 hover:bg-amber-500/10"
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
        className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-700/40 bg-emerald-500/10 p-4 transition hover:bg-emerald-500/15"
      >
        <MessageCircle className="text-emerald-300" size={20} />
        <div className="flex-1">
          <div className="text-sm font-bold text-emerald-100">Still need help?</div>
          <div className="text-xs text-emerald-200">
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
