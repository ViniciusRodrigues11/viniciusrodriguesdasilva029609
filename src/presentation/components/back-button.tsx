import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export function BackButton({ onClick, className = "" }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors ${className}`}
      aria-label="Voltar à página anterior"
    >
      <ArrowLeft size={18} />
      Voltar
    </button>
  );
}
