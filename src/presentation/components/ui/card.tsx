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
  imageHeight = "h-48",
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
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            Ver
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={handleEdit}
          className="flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!onEdit}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group relative flex h-80 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${className}`}
    >
      {/* Image Section */}
      <div
        className={`relative ${imageHeight} w-full overflow-hidden bg-slate-100`}
      >
        {image?.url ? (
          <img
            src={image.url}
            alt={image.alt}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-100 to-slate-100">
            {imageAltContent}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-5 text-left">
        {/* Title and Subtitle */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 line-clamp-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Metadata */}
        {metadata && <div>{metadata}</div>}

        {/* Actions */}
        {renderActions()}
      </div>
    </button>
  );
}
