type Props<T extends string> = {
  label: string;
  options: readonly T[];
  selected: readonly T[];
  onToggle: (value: T) => void;
};

export function MultiSelect<T extends string>({
  label,
  options,
  selected = [],
  onToggle,
}: Props<T>) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-black">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            type="button"
            key={o}
            onClick={() => onToggle(o)}
            className={`border border-black px-3 py-1 text-sm ${
              selected.includes(o)
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
