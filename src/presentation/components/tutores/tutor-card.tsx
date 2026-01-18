import type { TutorEntity } from "../../../domain/entities/tutor.entity";
import { User, Mail, Phone, MapPin } from "lucide-react";

interface TutorCardProps {
  tutor: TutorEntity;
  onClick?: (tutorId: number) => void;
}

export function TutorCard({ tutor, onClick }: TutorCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(tutor.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex h-80 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
    >
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
        {tutor.foto?.url ? (
          <img
            src={tutor.foto.url}
            alt={tutor.nome}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-100">
            <User className="h-16 w-16 text-indigo-300" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-5 text-left">
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 line-clamp-2">
            {tutor.nome}
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            {tutor.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{tutor.email}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{tutor.telefone}</span>
            </div>

            {tutor.endereco && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{tutor.endereco}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs font-medium text-indigo-600">
            Ver detalhes
          </span>
          <svg
            className="h-4 w-4 text-indigo-600 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}
