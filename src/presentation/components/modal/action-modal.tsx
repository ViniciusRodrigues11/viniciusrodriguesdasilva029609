import { useState } from "react";
import { Modal } from "./modal";

interface ActionModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  confirmButtonVariant?: "primary" | "danger";
  isLoading?: boolean;
}

export function ActionModal({
  isOpen,
  title,
  description,
  onClose,
  onConfirm,
  children,
  size = "md",
  confirmButtonLabel = "Confirmar",
  cancelButtonLabel = "Cancelar",
  confirmButtonVariant = "primary",
  isLoading = false,
}: ActionModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || isLoading;

  const confirmButtonClasses = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={description}
      onClose={onClose}
      size={size}
      isDismissible={!isDisabled}
    >
      <div className="space-y-6">
        {/* Custom content */}
        {children}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 fixed w-[90%] bottom-4 md:static md:w-auto ">
          <button
            type="button"
            onClick={onClose}
            disabled={isDisabled}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            {cancelButtonLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDisabled}
            className={`flex-1 rounded-lg px-4 py-2 font-medium transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 ${confirmButtonClasses[confirmButtonVariant]}`}
          >
            {isDisabled ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Carregando...
              </span>
            ) : (
              confirmButtonLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
