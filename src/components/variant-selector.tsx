"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Save } from "lucide-react";
import {
  variantGroupOf,
  variantLabel,
  VARIANT_GROUP_LABEL,
  type VariantGroup,
} from "@/lib/variants";
import { formatUSD } from "@/lib/utils";
import { adminReorderVariants } from "@/app/actions/admin";

export type VariantOption = {
  // skuId required for the admin reorder server action; for non-admin
  // viewers it's only used as a stable React key.
  skuId: string;
  variantType: string;
  lowestAskCents: number | null;
  imageUrl?: string | null;
};

/**
 * Dispatch a global "waxdepot:variant-preview" CustomEvent so the
 * ProductImageWithPreview client component on the same page swaps to
 * the previewed image. Decoupled from React context to avoid forcing
 * the entire image card subtree into client.
 */
function emitPreview(imageUrl: string | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("waxdepot:variant-preview", { detail: { imageUrl } }),
  );
}

const GROUP_ORDER: VariantGroup[] = ["single", "case"];

const GROUP_ACCENT: Record<VariantGroup, string> = {
  single: "text-amber-400/80",
  case: "text-fuchsia-400/80",
};

/**
 * Variant selector with two rows — single items on top, sealed cases
 * below. Admins get drag-drop on each row's chips: hold a chip, drag
 * it left/right to a new position, drop. A save bar appears once
 * anything's moved; click Save to persist variant_sort = 1..N for the
 * dropped row's chips. Non-admins get plain links (no DnD overhead).
 */
export function VariantSelector({
  groupSlug,
  variants,
  activeType,
  isAdmin,
}: {
  groupSlug: string;
  variants: VariantOption[];
  activeType: string;
  isAdmin?: boolean;
}) {
  if (variants.length <= 1) return null;

  // Bucket variants by their semantic group. We mirror the parent's
  // input order so any pre-sorted variant_sort from the data layer
  // shows up in that order on first paint.
  const buckets = new Map<VariantGroup, VariantOption[]>();
  for (const v of variants) {
    const g = variantGroupOf(v.variantType);
    if (!buckets.has(g)) buckets.set(g, []);
    buckets.get(g)!.push(v);
  }
  const visibleGroups = GROUP_ORDER.filter((g) => buckets.has(g));

  return (
    <div className="mb-6 space-y-4">
      <div className="text-[10px] font-semibold tracking-[0.18em] text-amber-400/80 uppercase">
        Variants
      </div>
      {visibleGroups.map((g) => (
        <VariantRow
          key={g}
          group={g}
          showLabel={visibleGroups.length > 1}
          groupSlug={groupSlug}
          activeType={activeType}
          initial={buckets.get(g)!}
          isAdmin={isAdmin ?? false}
        />
      ))}
    </div>
  );
}

function VariantRow({
  group,
  showLabel,
  groupSlug,
  activeType,
  initial,
  isAdmin,
}: {
  group: VariantGroup;
  showLabel: boolean;
  groupSlug: string;
  activeType: string;
  initial: VariantOption[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Sync from server-rendered state when initial changes (after a
  // router.refresh from a prior save) — but skip if the admin has
  // unsaved drags in flight.
  useEffect(() => {
    if (dirty) return;
    setItems(initial);
  }, [initial, dirty]);

  // 6px activation distance — same as the homepage drag-drop. Keeps
  // a click-on-chip from accidentally starting a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.skuId === active.id);
    const to = items.findIndex((i) => i.skuId === over.id);
    if (from < 0 || to < 0) return;
    setItems(arrayMove(items, from, to));
    setDirty(true);
  };

  const save = () => {
    setErr(null);
    start(async () => {
      const res = await adminReorderVariants(items.map((i) => i.skuId));
      if (res.error) {
        setErr(res.error);
        return;
      }
      setDirty(false);
      router.refresh();
    });
  };

  const Chips = (
    <div className="flex flex-wrap gap-2">
      {items.map((v) =>
        isAdmin ? (
          <SortableChip
            key={v.skuId}
            groupSlug={groupSlug}
            variant={v}
            active={v.variantType === activeType}
          />
        ) : (
          <VariantChip
            key={v.skuId}
            groupSlug={groupSlug}
            variant={v}
            active={v.variantType === activeType}
          />
        ),
      )}
    </div>
  );

  return (
    <div>
      {showLabel && (
        <div
          className={`mb-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase ${GROUP_ACCENT[group]}`}
        >
          {VARIANT_GROUP_LABEL[group]}
        </div>
      )}
      {isAdmin && dirty && (
        <div className="mb-2 flex items-center justify-between rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs">
          <span className="text-amber-100">
            <strong className="font-semibold">Order changed.</strong>{" "}
            <span className="text-amber-200/70">
              Click save to persist · refresh to discard.
            </span>
          </span>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Save size={11} />
            )}
            Save order
          </button>
        </div>
      )}
      {err && (
        <div className="mb-2 rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200">
          {err}
        </div>
      )}
      {isAdmin ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.skuId)}
            strategy={horizontalListSortingStrategy}
          >
            {Chips}
          </SortableContext>
        </DndContext>
      ) : (
        Chips
      )}
    </div>
  );
}

function SortableChip({
  groupSlug,
  variant,
  active,
}: {
  groupSlug: string;
  variant: VariantOption;
  active: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: variant.skuId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <VariantChip groupSlug={groupSlug} variant={variant} active={active} />
      {/* Small grip handle — appears on hover. Lives in the top-left
          corner of the chip; drag from here so clicks anywhere else
          on the chip still navigate via the link. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute -top-1.5 -left-1.5 z-10 inline-flex h-5 w-5 cursor-grab items-center justify-center rounded-full border border-sky-700/40 bg-sky-500/20 text-sky-200 opacity-0 transition group-hover:opacity-100 hover:scale-110 active:cursor-grabbing"
        title="Drag to reorder"
        aria-label="Drag handle"
      >
        <GripVertical size={10} />
      </button>
    </div>
  );
}

function VariantChip({
  groupSlug,
  variant,
  active,
}: {
  groupSlug: string;
  variant: VariantOption;
  active: boolean;
}) {
  const ask =
    variant.lowestAskCents !== null
      ? formatUSD(variant.lowestAskCents / 100)
      : null;
  return (
    <Link
      href={`/product/${groupSlug}?variant=${variant.variantType}`}
      aria-current={active ? "page" : undefined}
      scroll={false}
      onMouseEnter={() => emitPreview(variant.imageUrl ?? null)}
      onMouseLeave={() => emitPreview(null)}
      onFocus={() => emitPreview(variant.imageUrl ?? null)}
      onBlur={() => emitPreview(null)}
      className={
        active
          ? "rounded-md border border-amber-400/60 bg-amber-500/[0.08] px-3 py-2 text-sm font-bold text-amber-200 shadow-md shadow-amber-500/10"
          : "rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-amber-400/40 hover:bg-white/5 hover:text-white"
      }
    >
      <div>{variantLabel(variant.variantType)}</div>
      <div
        className={`text-[11px] font-normal ${active ? "text-amber-200/80" : "text-white/50"}`}
      >
        {ask ? `from ${ask}` : "no listings"}
      </div>
    </Link>
  );
}
