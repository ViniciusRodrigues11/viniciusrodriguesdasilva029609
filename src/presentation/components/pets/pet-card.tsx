import type { PetEntity } from "../../../domain/entities/pet.entity";

interface PetCardProps {
  pet: PetEntity;
  onClick?: (petId: number) => void;
}

export function PetCard({ pet, onClick }: PetCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(pet.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex h-80 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {pet.foto?.url ? (
          <img
            src={pet.foto.url}
            alt={pet.nome}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-100 to-slate-100 text-6xl font-bold text-indigo-300">
            {pet.nome.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-5 text-left">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 line-clamp-2">
              {pet.nome}
            </h3>
            {typeof pet.idade === "number" ? (
              <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                {pet.idade}a
              </span>
            ) : null}
          </div>
          <p className="text-xs font-medium text-slate-500 line-clamp-2">
            {pet.raca ? `${pet.raca}` : "Raça não informada"}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition group-hover:bg-indigo-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
          Ver detalhes
        </div>
      </div>
    </button>
  );
}
