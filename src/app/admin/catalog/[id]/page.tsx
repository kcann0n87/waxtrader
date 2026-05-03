import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { serviceRoleClient } from "@/lib/supabase/admin";
import { SkuForm } from "../sku-form";

export const dynamic = "force-dynamic";

export default async function AdminEditSkuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = serviceRoleClient();
  const { data: sku } = await sb.from("skus").select("*").eq("id", id).maybeSingle();
  if (!sku) notFound();

  return (
    <div>
      <Link
        href="/admin/catalog"
        className="mb-3 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
      >
        <ArrowLeft size={12} /> Catalog
      </Link>
      <h1 className="font-display mb-1 text-2xl font-black text-white">
        Edit {sku.year} {sku.brand} {sku.set_name}
      </h1>
      <p className="mb-6 font-mono text-xs text-white/60">{sku.slug}</p>
      <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
        <SkuForm
          skuId={id}
          initial={{
            slug: sku.slug,
            year: sku.year,
            brand: sku.brand,
            set_name: sku.set_name,
            product: sku.product,
            sport: sku.sport,
            release_date: sku.release_date ?? "",
            description: sku.description ?? "",
            image_url: sku.image_url ?? "",
            gradient_from: sku.gradient_from ?? "#475569",
            gradient_to: sku.gradient_to ?? "#0f172a",
            is_published: sku.is_published ?? true,
          }}
        />
      </div>
    </div>
  );
}
