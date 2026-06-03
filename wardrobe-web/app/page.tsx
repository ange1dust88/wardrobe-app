"use client";

import { useCallback, useEffect, useState } from "react";

// API-сервер (NestJS). По умолчанию http://localhost:3000.
// Если Next.js запущен на том же порту — задай NEXT_PUBLIC_API_URL,
// например NEXT_PUBLIC_API_URL=http://localhost:3001 next dev -p 3000
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type Item = {
  id: number;
  name: string;
  category: string;
  color?: string;
  size?: string;
};

type FormState = {
  name: string;
  category: string;
  color: string;
  size: string;
};

const EMPTY_FORM: FormState = { name: "", category: "", color: "", size: "" };

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/items`);
      if (!res.ok) throw new Error(`GET /items → ${res.status}`);
      setItems(await res.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить вещи");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // все setState в load() выполняются после await — синхронного каскада нет
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          ...(form.color.trim() && { color: form.color.trim() }),
          ...(form.size.trim() && { size: form.size.trim() }),
        }),
      });
      if (!res.ok) throw new Error(`POST /items → ${res.status}`);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать вещь");
    }
  }

  async function deleteItem(id: number) {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE /items/${id} → ${res.status}`);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить вещь");
    }
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
        <header className="flex items-baseline justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Гардероб
          </h1>
          <button
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-zinc-50"
          >
            Обновить
          </button>
        </header>

        {/* Форма создания */}
        <form
          onSubmit={createItem}
          className="grid grid-cols-2 gap-3 rounded-2xl border border-black/[.08] bg-white p-5 dark:border-white/[.12] dark:bg-zinc-950"
        >
          <Field
            label="Название *"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="Чёрные джинсы"
          />
          <Field
            label="Категория *"
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
            placeholder="bottoms"
          />
          <Field
            label="Цвет"
            value={form.color}
            onChange={(v) => setForm((f) => ({ ...f, color: v }))}
            placeholder="black"
          />
          <Field
            label="Размер"
            value={form.size}
            onChange={(v) => setForm((f) => ({ ...f, size: v }))}
            placeholder="32"
          />
          <button
            type="submit"
            disabled={!form.name.trim() || !form.category.trim()}
            className="col-span-2 mt-1 h-11 rounded-full bg-black text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Добавить вещь
          </button>
        </form>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Список вещей */}
        <section className="flex flex-col gap-2">
          {loading && items.length === 0 ? (
            <p className="text-sm text-zinc-500">Загрузка…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-zinc-500">Пока пусто — добавь первую вещь.</p>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-black/[.06] bg-white px-4 py-3 dark:border-white/[.1] dark:bg-zinc-950"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-black dark:text-zinc-50">
                    {item.name}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {[item.category, item.color, item.size]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-sm font-medium text-zinc-400 hover:text-red-600"
                >
                  Удалить
                </button>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-black/[.1] bg-transparent px-3 text-black outline-none focus:border-black dark:border-white/[.15] dark:text-zinc-50 dark:focus:border-zinc-50"
      />
    </label>
  );
}
