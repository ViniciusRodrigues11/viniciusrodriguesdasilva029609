import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-6 py-12 text-center">
        <img
          src="/404.webp"
          alt="Página não encontrada"
          className="w-full max-w-60 rounded-2xl"
        />

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Não há nada aqui...
          </h1>
          <p className="text-base text-slate-600 md:text-lg">
            Ooops! Você procurou pets longe demais.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            aria-label="Voltar ao início"
            className="rounded-lg flex items-center justify-between px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <ChevronLeft size={16} className="mr-2" />
            <span>Voltar ao início </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
