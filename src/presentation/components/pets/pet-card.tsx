import { PawPrint } from "lucide-react";
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
          <span className="text-xs font-medium text-slate-500 mb-1">
            {pet.raca ? (
              <div className="flex">
                <span>Raça:</span>
                <span className="ml-1 text-ellipsis line-clamp-1">
                  {pet.raca}
                </span>
              </div>
            ) : (
              "Raça não informada"
            )}
          </span>
          <span className="text-xs font-medium text-slate-500 line-clamp-2 text-ellipsis">
            {pet.idade ? `Idade: ${pet.idade} anos` : "Idade não informada"}
          </span>
        </>
      }
      imageAltContent={
        <div className="text-6xl font-bold text-slate-300">
          <PawPrint strokeWidth={1.5} size={30} />
        </div>
      }
    />
  );
}
