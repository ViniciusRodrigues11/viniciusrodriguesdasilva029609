import type { PetEntity } from "../../../domain/entities/pet.entity";
import { Card } from "../ui/card";

interface PetCardProps {
  pet: PetEntity;
  onClick?: (petId: number) => void;
  onEdit?: (petId: number) => void;
  onDelete?: (petId: number) => void;
}

export function PetCard({ pet, onClick, onEdit, onDelete }: PetCardProps) {
  return (
    <Card
      id={pet.id}
      onClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
      image={pet.foto?.url ? { url: pet.foto.url, alt: pet.nome } : undefined}
      imageAltContent={
        <div className="text-6xl font-bold text-indigo-300">
          {pet.nome.charAt(0).toUpperCase()}
        </div>
      }
      title={pet.nome}
      subtitle={pet.raca ? `${pet.raca}` : "Raça não informada"}
      metadata={
        typeof pet.idade === "number" ? (
          <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            {pet.idade}a
          </span>
        ) : null
      }
    />
  );
}
