"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Save } from "lucide-react";
import { adminReorderSkus } from "@/app/actions/admin";
import { AdminCardDeleteButton } from "./admin-card-delete-button";

/**
 * Drag-and-drop wrapper around the catalog grid. Renders the same 4-col
 * grid as <Grid> in src/app/page.tsx, but each card is sortable for
 * admins. Drop a card to reorder; click "Save order" to persist
 * featured_rank = 1..N for every visible SKU. Non-admins get a plain
 * grid (no DnD overhead).
 *
 * Why a manual Save button instead of auto-save on every drop:
 *   - drag-and-drop is fiddly; admins often re-drop a few times to get
 *     the row right. Saving each intermediate state writes 100+ rows
 *     for nothing.
 *   - explicit save lets admins discard a bad reorder by refreshing.
 *
 * Items are passed as { id, node } pairs from the server component so
 * the React Server Component payload carries the pre-rendered
 * <ProductCard /> nodes; this client component just adds a drag
 * handle + transform without re-implementing the card.
 */
type GridItem = {
  id: string;
  node: React.ReactNode;
  // Variant-group level metadata for the rose ✕ delete button.
  // Optional so callers that don't want delete (e.g. featured rails)
  // can omit; the button only renders when both are present.
  variantGroup?: string;
  productLabel?: string;
};

export function SortableProductGrid({
  items: initialItems,
  isAdmin,
}: {
  items: GridItem[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Sync local state when the server-rendered list changes (after a
  // router.refresh() or another admin's reorder). Skips the sync if
  // the user has unsaved drags in flight, otherwise we'd clobber them.
  useEffect(() => {
    if (dirty) return;
    setItems(initialItems);
  }, [initialItems, dirty]);

  // PointerSensor (mouse + Apple Pencil) + TouchSensor (mobile) so
  // drag works on every input. Activation thresholds keep a tap/
  // click on a card link from accidentally starting a drag — 6px on
  // pointer, and a 250ms hold on touch since taps are inherently
  // imprecise vs. mouse clicks.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );

  if (!isAdmin) {
    return <Grid>{items.map((it) => it.node)}</Grid>;
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    setItems(arrayMove(items, from, to));
    setDirty(true);
  };

  const save = () => {
    setErr(null);
    start(async () => {
      const res = await adminReorderSkus(items.map((i) => i.id));
      if (res.error) {
        setErr(res.error);
        return;
      }
      setDirty(false);
      router.refresh();
    });
  };

  return (
    <div>
      {/* Floating save bar — appears once you've actually moved
          something. Sits above the grid with a hint. */}
      {dirty && (
        <div className="sticky top-2 z-40 mb-4 flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm backdrop-blur">
          <span className="text-amber-100">
            <strong className="font-semibold">Order changed.</strong>{" "}
            <span className="text-amber-200/70">
              Click save to persist featured_rank for all {items.length}{" "}
              cards. Refresh to discard.
            </span>
          </span>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            Save order
          </button>
        </div>
      )}
      {err && (
        <div className="mb-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {err}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <Grid>
            {items.map((it) => (
              <SortableCard
                key={it.id}
                id={it.id}
                variantGroup={it.variantGroup}
                productLabel={it.productLabel}
              >
                {it.node}
              </SortableCard>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableCard({
  id,
  variantGroup,
  productLabel,
  children,
}: {
  id: string;
  variantGroup?: string;
  productLabel?: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      {children}
      {/* Drag handle — small blue grip icon top-left, only visible on
          card hover. Sits above the card image but doesn't intercept
          link clicks elsewhere on the card. Mirror of the corner-pill
          admin tooling on the product detail page (emerald +, amber 📌,
          rose ✕). Blue picks the next color slot. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-3 left-3 z-30 inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-full border border-sky-700/40 bg-sky-500/15 text-sky-200 opacity-0 transition group-hover:opacity-100 hover:scale-110 hover:border-sky-500/60 hover:bg-sky-500/30 active:cursor-grabbing"
        title="Drag to reorder"
        aria-label="Drag handle"
      >
        <GripVertical size={14} />
      </button>
      {/* Rose ✕ delete — admin-only. Removes the entire variant_group
          (every Hobby Box / Hobby Case / Mega Box variant of this
          product) in one click, falling back to hide for variants
          referenced by orders/listings. */}
      {variantGroup && productLabel && (
        <AdminCardDeleteButton
          variantGroup={variantGroup}
          productLabel={productLabel}
          isAdmin={true}
        />
      )}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {children}
    </div>
  );
}
