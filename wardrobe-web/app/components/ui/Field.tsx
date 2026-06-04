type Props = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "color";
  min?: number;
  max?: number;
  placeholder?: string;
};

export function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
  placeholder,
}: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-black">{label}</span>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={
          type === "color"
            ? "h-9 w-16 cursor-pointer border border-black bg-white"
            : "border border-black bg-white px-2 py-1 text-black"
        }
      />
    </label>
  );
}
