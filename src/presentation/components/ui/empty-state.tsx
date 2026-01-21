interface EmptyStateProps {
  imageSrc?: string;
  message: string;
  className?: string;
}

export function EmptyState({
  imageSrc = "/doghouse.webp",
  message,
  className = "",
}: EmptyStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className={`p-8 text-center text-slate-600 flex self-center flex-col items-center gap-4 ${className}`}
    >
      <img src={imageSrc} alt="" className="w-30" />
      <h2 className="text-xl font-semibold">{message}</h2>
    </section>
  );
}
