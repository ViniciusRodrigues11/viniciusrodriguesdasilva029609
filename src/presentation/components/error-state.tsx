import type { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  children?: ReactNode;
};

export function ErrorState({
  title = "Oops!",
  description = "Não foi possível carregar os detalhes.",
  imageSrc = "/404.webp",
  imageAlt = "Não encontrado",
  className = "",
  children,
}: ErrorStateProps) {
  return (
    <div
      className={`rounded-lg flex flex-col items-center justify-center p-6 text-center text-slate-700 ${className}`}
    >
      <img src={imageSrc} alt={imageAlt} className="max-w-30" />
      <p className="text-2xl text-slate-800 font-bold">{title}</p>
      {description && <p className="text-slate-700">{description}</p>}
      {children}
    </div>
  );
}