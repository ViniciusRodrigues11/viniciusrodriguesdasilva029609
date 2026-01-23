import type { ReactNode } from "react";
import { Edit2, Trash2, ChevronRight } from "lucide-react";

interface CardProps {
  id: number;
  onClick?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  image?: {
    url: string;
    alt: string;
  };
  imageHeight?: string;
  imageAltContent?: ReactNode;
  title: string;
  subtitle?: string;
  metadata?: ReactNode;
  customActions?: ReactNode;
  className?: string;
  showDefaultActions?: boolean;
}

export function Card({
  id,
  onClick,
  onEdit,
  onDelete,
  image,
  imageAltContent,
  title,
  subtitle,
  metadata,
  customActions,
  className = "",
  showDefaultActions = true,
}: CardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const renderActions = () => {
    if (customActions) {
      return customActions;
    }

    if (!showDefaultActions) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        {onClick && (
          <button
            type="button"
            onClick={handleClick}
            aria-label={`Ver detalhes de ${title}`}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-white bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-400"
          >
            Ver
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={handleEdit}
          aria-label={`Editar ${title}`}
          title={!onEdit ? "Edição não disponível" : undefined}
          className="flex items-center cursor-pointer justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 hover:border-slate-400 disabled:cursor-not-allowed"
          disabled={!onEdit}
        >
          <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Excluir ${title}`}
          title={!onDelete ? "Exclusão não disponível" : undefined}
          className="flex items-center cursor-pointer justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-600 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <div
      className={`group relative flex h-100 md:min-w-62.5 flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm
         transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${className}`}
    >
      {/* Image Section */}
      <div className={`relative flex-1 w-full overflow-hidden bg-slate-100`}>
        {image?.url ? (
          <img
            src={image.url}
            alt={image.alt}
            className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
            {imageAltContent}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-between gap-2 p-5 text-left">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 text-ellipsis">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500 line-clamp-2 text-ellipsis">
              {subtitle}
            </p>
          )}
        </div>

        {/* Metadata */}
        {metadata && <div>{metadata}</div>}

        {/* Actions */}
        {renderActions()}
      </div>
    </div>
  );
}
