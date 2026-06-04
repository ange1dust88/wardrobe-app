type Props<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-black">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="border border-black bg-white px-2 py-1 text-black"
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
