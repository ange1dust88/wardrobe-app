"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BRIGHTNESSES,
  CATEGORIES,
  createItem,
  type CreateItem,
  deleteItem,
  fetchItems,
  PATTERNS,
  SATURATIONS,
  SEASON_PALETTES,
  SEASON_WEARS,
  TEMPERATURES,
  VIBES,
  WARDROBE_ROLES,
} from "./lib/items";

const EMPTY_FORM: CreateItem = {
  name: "",
  category: "top",
  color: {
    hex: "#000000",
    hue: 0,
    temperature: "neutral",
    brightness: "medium",
    saturation: "muted",
    isNeutral: false,
  },
  wardrobeRole: "core",
  pattern: "solid",
  seasonPaletteCompatibility: [],
  vibe: [],
  seasonWear: [],
};

export default function Home() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateItem>(EMPTY_FORM);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  const create = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.name.trim() ||
      form.seasonPaletteCompatibility.length === 0 ||
      form.vibe.length === 0 ||
      form.seasonWear.length === 0
    )
      return;
    create.mutate(form);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold">Гардероб</h1>

      <form onSubmit={submit} className="flex flex-col gap-4 rounded border p-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Название *</span>
          <input
            className="rounded border px-2 py-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>

        <Select
          label="Категория"
          value={form.category}
          options={CATEGORIES}
          onChange={(v) => setForm({ ...form, category: v })}
        />
        <Select
          label="Роль"
          value={form.wardrobeRole}
          options={WARDROBE_ROLES}
          onChange={(v) => setForm({ ...form, wardrobeRole: v })}
        />
        <Select
          label="Паттерн"
          value={form.pattern}
          options={PATTERNS}
          onChange={(v) => setForm({ ...form, pattern: v })}
        />

        <fieldset className="flex flex-col gap-3 rounded border p-3">
          <legend className="text-sm font-medium">Цвет</legend>
          <div className="flex gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Hex</span>
              <input
                type="color"
                className="h-9 w-16"
                value={form.color.hex}
                onChange={(e) =>
                  setForm({
                    ...form,
                    color: { ...form.color, hex: e.target.value },
                  })
                }
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-sm">Hue (0–360)</span>
              <input
                type="number"
                min={0}
                max={360}
                className="rounded border px-2 py-1"
                value={form.color.hue}
                onChange={(e) =>
                  setForm({
                    ...form,
                    color: { ...form.color, hue: Number(e.target.value) },
                  })
                }
              />
            </label>
          </div>
          <Select
            label="Температура"
            value={form.color.temperature}
            options={TEMPERATURES}
            onChange={(v) =>
              setForm({ ...form, color: { ...form.color, temperature: v } })
            }
          />
          <Select
            label="Яркость"
            value={form.color.brightness}
            options={BRIGHTNESSES}
            onChange={(v) =>
              setForm({ ...form, color: { ...form.color, brightness: v } })
            }
          />
          <Select
            label="Насыщенность"
            value={form.color.saturation}
            options={SATURATIONS}
            onChange={(v) =>
              setForm({ ...form, color: { ...form.color, saturation: v } })
            }
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.color.isNeutral}
              onChange={(e) =>
                setForm({
                  ...form,
                  color: { ...form.color, isNeutral: e.target.checked },
                })
              }
            />
            <span className="text-sm">Нейтральный</span>
          </label>
        </fieldset>

        <MultiSelect
          label="Сезонная палитра *"
          options={SEASON_PALETTES}
          selected={form.seasonPaletteCompatibility}
          onChange={(v) =>
            setForm({ ...form, seasonPaletteCompatibility: v })
          }
        />
        <MultiSelect
          label="Vibe *"
          options={VIBES}
          selected={form.vibe}
          onChange={(v) => setForm({ ...form, vibe: v })}
        />
        <MultiSelect
          label="Когда носить *"
          options={SEASON_WEARS}
          selected={form.seasonWear}
          onChange={(v) => setForm({ ...form, seasonWear: v })}
        />

        <button
          type="submit"
          disabled={create.isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-black"
        >
          {create.isPending ? "Сохранение…" : "Добавить вещь"}
        </button>

        {create.error && (
          <p className="text-sm text-red-600">
            {(create.error as Error).message}
          </p>
        )}
      </form>

      <section className="flex flex-col gap-2">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Загрузка…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{(error as Error).message}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500">Пока пусто.</p>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="flex items-center gap-3 rounded border px-3 py-2"
            >
              <span
                className="h-8 w-8 shrink-0 rounded border"
                style={{ backgroundColor: item.color.hex }}
              />
              <div className="flex flex-1 flex-col">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-zinc-500">
                  {[item.category, item.wardrobeRole, ...item.vibe].join(" · ")}
                </span>
              </div>
              <button
                onClick={() => remove.mutate(item.id)}
                className="text-sm text-zinc-400 hover:text-red-600"
              >
                Удалить
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm">{label}</span>
      <select
        className="rounded border px-2 py-1"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (v: T[]) => void;
}) {
  function toggle(o: T) {
    onChange(selected.includes(o) ? selected.filter((s) => s !== o) : [...selected, o]);
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            type="button"
            key={o}
            onClick={() => toggle(o)}
            className={`rounded-full border px-3 py-1 text-sm ${
              selected.includes(o)
                ? "bg-black text-white dark:bg-white dark:text-black"
                : ""
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
