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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="aspect-[4/3] w-full bg-slate-100">
        {pet.foto?.url ? (
          <img
            src={pet.foto.url}
            alt={pet.nome}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-50 to-slate-100 text-5xl font-semibold text-indigo-400">
            {pet.nome.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
            {pet.nome}
          </h3>
          {typeof pet.idade === "number" ? (
            <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
              {pet.idade} {pet.idade === 1 ? "ano" : "anos"}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">
          {pet.raca ? `Espécie/Raça: ${pet.raca}` : "Espécie não informada"}
        </p>
      </div>
    </button>
  );
}
