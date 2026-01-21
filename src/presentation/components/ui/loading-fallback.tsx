export const LoadingFallback = () => (
  <div
    className="flex items-center justify-center min-h-screen"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div
      className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
      aria-label="Carregando"
    />
  </div>
);
