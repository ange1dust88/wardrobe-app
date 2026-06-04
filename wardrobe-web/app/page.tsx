"use client";

import { useState } from "react";
import { AddItemModal } from "./components/items/AddItemModal";
import { ItemList } from "./components/items/ItemList";
import { useItems } from "./hooks/useItems";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { itemsQuery, createMutation, deleteMutation } = useItems();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wardrobe</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="border border-black bg-white px-4 py-2 text-sm text-black"
        >
          Add item
        </button>
      </header>

      <ItemList
        items={itemsQuery.data ?? []}
        isLoading={itemsQuery.isLoading}
        errorMessage={
          itemsQuery.error ? (itemsQuery.error as Error).message : undefined
        }
        onDelete={(id) => deleteMutation.mutate(id)}
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
