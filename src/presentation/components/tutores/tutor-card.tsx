import type { TutorEntity } from "../../../domain/entities/tutor.entity";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { Card } from "../card";

interface TutorCardProps {
  tutor: TutorEntity;
  onClick?: (tutorId: number) => void;
  onEdit?: (tutorId: number) => void;
  onDelete?: (tutorId: number) => void;
}

export function TutorCard({
  tutor,
  onClick,
  onEdit,
  onDelete,
}: TutorCardProps) {
  return (
    <Card
      id={tutor.id}
      onClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
      image={
        tutor.foto?.url ? { url: tutor.foto.url, alt: tutor.nome } : undefined
      }
      imageAltContent={
        <User className="h-16 w-16 text-indigo-300" strokeWidth={1.5} />
      }
      imageHeight="h-32"
      title={tutor.nome}
      metadata={
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
      }
    />
  );
}
