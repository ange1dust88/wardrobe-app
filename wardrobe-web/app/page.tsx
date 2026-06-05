"use client";

import { useState } from "react";
import { AddItemModal } from "./components/items/AddItemModal";
import { ItemList } from "./components/items/ItemList";
import { useItems } from "./hooks/useItems";
import { useMatches } from "./hooks/useMatches";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { itemsQuery, createMutation, deleteMutation, seedMutation } =
    useItems();
  const { matchedIds, scoreById } = useMatches(hoveredId);

  const items = itemsQuery.data ?? [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wardrobe</h1>
        <div className="flex gap-2">
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="border border-black bg-white px-4 py-2 text-sm text-black disabled:opacity-40"
          >
            {seedMutation.isPending ? "Loading…" : "Reset examples"}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="border border-black bg-white px-4 py-2 text-sm text-black"
          >
            Add item
          </button>
        </div>
      </header>

      <p className="text-sm text-black">
        Hover an item to highlight what it matches with.
      </p>

      <ItemList
        items={items}
        isLoading={itemsQuery.isLoading}
        errorMessage={
          itemsQuery.error ? (itemsQuery.error as Error).message : undefined
        }
        onDelete={(id) => deleteMutation.mutate(id)}
        hoveredId={hoveredId}
        matchedIds={matchedIds}
        scoreById={scoreById}
        onHover={setHoveredId}
      />

      <AddItemModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(values, callbacks) =>
          createMutation.mutate(values, callbacks)
        }
        pending={createMutation.isPending}
        errorMessage={
          createMutation.error
            ? (createMutation.error as Error).message
            : undefined
        }
      />
    </main>
  );
}
