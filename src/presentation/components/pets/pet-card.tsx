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
      title={pet.nome}
      metadata={
        <>
          <span className="text-xs font-medium text-slate-500 line-clamp-2 mb-1">
            {pet.raca ? `Raça: ${pet.raca}` : "Raça não informada"}
          </span>
          <span className="text-xs font-medium text-slate-500 line-clamp-2">
            {pet.idade ? `Idade: ${pet.idade} anos` : "Idade não informada"}
          </span>
        </>
      }
      imageAltContent={
        <div className="text-6xl font-bold text-indigo-300">
          {pet.nome.charAt(0).toUpperCase()}
        </div>
      }
    />
  );
}
