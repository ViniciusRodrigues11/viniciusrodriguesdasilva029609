import { useState } from "react";
import { Plus } from "lucide-react";
import { ActionModal } from "../modal/action-modal";
import { tutorFacade } from "../../../services/tutor.service";

interface AddTutorModalProps {
  onTutorAdded?: () => void;
}

// Função para aplicar máscara de telefone
const applyPhoneMask = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 10) {
    return cleaned
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return cleaned
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(\d{4})\d+?$/, "$1");
};

// Função para aplicar máscara de CPF
const applyCpfMask = (value: string): string => {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);

  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return cleaned.replace(/(\d{3})(\d)/, "$1.$2");
  if (cleaned.length <= 9)
    return cleaned.replace(/(\d{3})(\d{3})(\d)/, "$1.$2.$3");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
};

// Função para validar CPF
const isValidCpf = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
};

export function AddTutorModal({ onTutorAdded }: AddTutorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cpf: "",
  });
  const [errors, setErrors] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cpf: "",
  });

  const validateForm = (): boolean => {
    const newErrors = {
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      cpf: "",
    };
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
    } else {
      const cleaned = formData.telefone.replace(/\D/g, "");
      if (cleaned.length < 10 || cleaned.length > 11) {
        newErrors.telefone = "Telefone deve ter 10 ou 11 dígitos";
        isValid = false;
      }
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = "Endereço é obrigatório";
      isValid = false;
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
      isValid = false;
    } else if (!isValidCpf(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
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
      await tutorFacade.addTutor({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
        cpf: parseInt(formData.cpf.replace(/\D/g, "")),
      });

      // Reset form
      setFormData({ nome: "", email: "", telefone: "", endereco: "", cpf: "" });
      setErrors({ nome: "", email: "", telefone: "", endereco: "", cpf: "" });

      // Callback para recarregar lista
      onTutorAdded?.();
    } catch (error) {
      console.error("Erro ao adicionar tutor:", error);
      throw error;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;

    // Aplicar máscaras
    if (field === "telefone") {
      processedValue = applyPhoneMask(value);
    } else if (field === "cpf") {
      processedValue = applyCpfMask(value);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
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
          setFormData({
            nome: "",
            email: "",
            telefone: "",
            endereco: "",
            cpf: "",
          });
          setErrors({
            nome: "",
            email: "",
            telefone: "",
            endereco: "",
            cpf: "",
          });
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
              maxLength={15}
            />
            {errors.telefone && (
              <p className="mt-1 text-xs text-red-600">{errors.telefone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="tutor-cpf"
              className="block text-sm font-medium text-slate-700"
            >
              CPF *
            </label>
            <input
              id="tutor-cpf"
              type="text"
              value={formData.cpf}
              onChange={(e) => handleInputChange("cpf", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.cpf
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-500"
              }`}
              placeholder="Ex: 123.456.789-01"
              maxLength={14}
            />
            {errors.cpf && (
              <p className="mt-1 text-xs text-red-600">{errors.cpf}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="tutor-address"
              className="block text-sm font-medium text-slate-700"
            >
              Endereço *
            </label>
            <input
              id="tutor-address"
              type="text"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.endereco
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-500"
              }`}
              placeholder="Ex: Rua das Flores, 123, Bairro Centro, São Paulo - SP"
            />
            {errors.endereco && (
              <p className="mt-1 text-xs text-red-600">{errors.endereco}</p>
            )}
          </div>

          <p className="text-xs text-slate-500">* Campos obrigatórios</p>
        </form>
      </ActionModal>
    </>
  );
}
