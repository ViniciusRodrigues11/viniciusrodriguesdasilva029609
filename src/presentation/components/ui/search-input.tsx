import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar por nome",
  className = "w-full sm:w-72",
}: SearchInputProps) {
  return (
    <div className={className}>
      <label className="sr-only" htmlFor="search">
        {placeholder}
      </label>
      <div className="relative">
        <input
          id="search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <span
          className="pointer-events-none absolute right-3 top-2.5 text-slate-400"
          aria-hidden="true"
        >
          <Search size={16} />
        </span>
      </div>
    </div>
  );
}
