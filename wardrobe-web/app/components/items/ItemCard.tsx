import type { Item } from "../../lib/items";

type Props = {
  item: Item;
  onDelete: (id: string) => void;
};

export function ItemCard({ item, onDelete }: Props) {
  return (
    <div className="group relative flex flex-col gap-1">
      <div className="aspect-square w-full border border-black bg-white" />
      <span className="text-center text-sm text-black">{item.name}</span>
      <button
        onClick={() => onDelete(item.id)}
        aria-label="Delete"
        className="absolute top-1 right-1 hidden border border-black bg-white px-1 text-xs text-black group-hover:block"
      >
        ✕
      </button>
    </div>
  );
}
