import { useState } from "react";
import { Plus } from "lucide-react";
import { ActionModal } from "../modal/action-modal";

interface AddTutorModalProps {
  onTutorAdded?: () => void;
}

export function AddTutorModal({ onTutorAdded }: AddTutorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  });
  const [errors, setErrors] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  const validateForm = (): boolean => {
    const newErrors = { nome: "", email: "", telefone: "" };
    let isValid = true;

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddTutor = async () => {
    if (!validateForm()) {
      throw new Error("Validação falhou");
    }

    try {
      const response = await fetch("/v1/tutores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar tutor");
      }

      // Reset form
      setFormData({ nome: "", email: "", telefone: "" });
      setErrors({ nome: "", email: "", telefone: "" });

      // Callback para recarregar lista
      onTutorAdded?.();
    } catch (error) {
      console.error("Erro ao adicionar tutor:", error);
      throw error;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro ao começar a digitar
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex text-xs items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
      >
        <Plus size={20} />
        Novo Tutor
      </button>

      <ActionModal
        isOpen={isOpen}
        title="Adicionar Novo Tutor"
        description="Preencha os dados do novo tutor para cadastrá-lo no sistema"
        onClose={() => {
          setIsOpen(false);
          setFormData({ nome: "", email: "", telefone: "" });
          setErrors({ nome: "", email: "", telefone: "" });
        }}
        onConfirm={handleAddTutor}
        confirmButtonLabel="Adicionar Tutor"
        confirmButtonVariant="primary"
        size="md"
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
              htmlFor="tutor-name"
              className="block text-sm font-medium text-slate-700"
            >
              Nome Completo *
            </label>
            <input
              id="tutor-name"
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.nome
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-500"
              }`}
              placeholder="Ex: João Silva"
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-red-600">{errors.nome}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="tutor-email"
              className="block text-sm font-medium text-slate-700"
            >
              Email *
            </label>
            <input
              id="tutor-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.email
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-500"
              }`}
              placeholder="Ex: joao@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="tutor-phone"
              className="block text-sm font-medium text-slate-700"
            >
              Telefone *
            </label>
            <input
              id="tutor-phone"
              type="tel"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.telefone
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-500"
              }`}
              placeholder="Ex: (11) 99999-9999"
            />
            {errors.telefone && (
              <p className="mt-1 text-xs text-red-600">{errors.telefone}</p>
            )}
          </div>

          <p className="text-xs text-slate-500">* Campos obrigatórios</p>
        </form>
      </ActionModal>
    </>
  );
}
