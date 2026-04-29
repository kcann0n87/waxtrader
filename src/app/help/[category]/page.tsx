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
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/help" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Help
        </Link>
        <span>/</span>
        <span className="text-white">{category.title}</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-white">{category.title}</h1>
      <p className="mt-1 text-white/60">{category.description}</p>

      <ul className="mt-6 divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-[#101012]">
        {category.articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/help/${category.slug}/${a.slug}`}
              className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-white/[0.02]"
            >
              <div>
                <div className="text-base font-semibold text-white">{a.title}</div>
                <div className="mt-0.5 line-clamp-1 text-sm text-white/50">{a.body}</div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-white/40" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-sm text-white/50">
        Still stuck?{" "}
        <Link href="/help/contact" className="font-semibold text-amber-300 hover:underline">
          Contact support →
        </Link>
      </p>
    </div>
  );
}
