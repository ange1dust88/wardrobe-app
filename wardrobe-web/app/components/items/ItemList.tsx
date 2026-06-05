import { CATEGORIES, CATEGORY_LABELS, type Item } from "../../lib/items";
import { type CardState, ItemCard } from "./ItemCard";

type Props = {
  items: Item[];
  isLoading: boolean;
  errorMessage?: string;
  onDelete: (id: string) => void;
  hoveredId: string | null;
  matchedIds: Set<string>;
  scoreById: Record<string, number>;
  onHover: (id: string | null) => void;
};

export function ItemList({
  items,
  isLoading,
  errorMessage,
  onDelete,
  hoveredId,
  matchedIds,
  scoreById,
  onHover,
}: Props) {
  if (isLoading) {
    return <p className="text-sm text-black">Loading…</p>;
  }
  if (errorMessage) {
    return <p className="text-sm text-black">{errorMessage}</p>;
  }
  if (items.length === 0) {
    return <p className="text-sm text-black">Empty.</p>;
  }

  function cardState(item: Item): CardState {
    if (!hoveredId) return "normal";
    if (item.id === hoveredId) return "anchor";
    if (matchedIds.has(item.id)) return "match";
    return "dim";
  }

  const groups = CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-6 border border-black p-4">
      {groups.map((group) => (
        <div key={group.category} className="flex items-center gap-4">
          <div className="grid flex-1 grid-cols-4 gap-3">
            {group.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                state={cardState(item)}
                score={scoreById[item.id]}
                onDelete={onDelete}
                onHover={onHover}
              />
            ))}
          </div>
          <span className="w-24 shrink-0 text-sm text-black">
            {CATEGORY_LABELS[group.category]}
          </span>
        </div>
      ))}
    </div>
  );
}
