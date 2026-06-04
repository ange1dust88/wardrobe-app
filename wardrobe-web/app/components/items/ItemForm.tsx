"use client";

import { CATEGORIES, PATTERNS, SEASONS, VIBES } from "../../lib/items";
import type { ItemFormApi } from "../../hooks/useItemForm";
import { Field } from "../ui/Field";
import { MultiSelect } from "../ui/MultiSelect";
import { Select } from "../ui/Select";

type Props = {
  form: ItemFormApi;
  onSubmit: () => void;
  pending?: boolean;
  errorMessage?: string;
};

export function ItemForm({ form, onSubmit, pending, errorMessage }: Props) {
  const { values, patch, toggle, isValid } = form;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <Field
        label="Name *"
        value={values.name}
        onChange={(v) => patch({ name: v })}
        placeholder="Black Hooded Jacket"
      />

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Select
            label="Type"
            value={values.category}
            options={CATEGORIES}
            onChange={(v) => patch({ category: v })}
          />
        </div>
        <Field
          label="Color"
          type="color"
          value={values.hex}
          onChange={(v) => patch({ hex: v })}
        />
      </div>

      <Select
        label="Pattern"
        value={values.pattern}
        options={PATTERNS}
        onChange={(v) => patch({ pattern: v })}
      />

      <MultiSelect
        label="Vibe *"
        options={VIBES}
        selected={values.vibe}
        onToggle={(v) => toggle("vibe", v)}
      />

      <MultiSelect
        label="When to wear *"
        options={SEASONS}
        selected={values.seasonWear}
        onToggle={(v) => toggle("seasonWear", v)}
      />

      {errorMessage && <p className="text-sm text-black">{errorMessage}</p>}

      <button
        type="submit"
        disabled={!isValid || pending}
        className="border border-black bg-white px-4 py-2 text-black disabled:opacity-40"
      >
        {pending ? "Saving…" : "Add item"}
      </button>
    </form>
  );
}
