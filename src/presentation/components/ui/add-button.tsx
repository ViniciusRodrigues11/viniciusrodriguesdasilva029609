import { Plus } from "lucide-react";

interface AddButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

export function AddButton({ onClick, label, className = "" }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg text-xs bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${className}`}
    >
      <Plus size={20} aria-hidden="true" />
      {label}
    </button>
  );
}
