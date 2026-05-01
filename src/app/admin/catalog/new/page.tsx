import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SkuForm } from "../sku-form";

export const dynamic = "force-dynamic";

export default function AdminNewSkuPage() {
  return (
    <div>
      <Link
        href="/admin/catalog"
        className="mb-3 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
      >
        <ArrowLeft size={12} /> Catalog
      </Link>
      <h1 className="font-display mb-6 text-2xl font-black text-white">Add new SKU</h1>
      <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
        <SkuForm />
      </div>
    </div>
  );
}
