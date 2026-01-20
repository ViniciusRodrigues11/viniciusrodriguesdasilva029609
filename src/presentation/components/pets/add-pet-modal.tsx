import { useState } from "react";
import { ActionModal } from "../action-modal/action-modal";
import { AddButton } from "../ui/add-button";
import { validators } from "../../../helpers/validatorsHelper";

interface AddPetModalProps {
  onPetAdded?: () => void;
}

type PetForm = {
  nome: string;
  raca: string;
  idade: string;
};

type PetErrors = Record<keyof PetForm, string>;

const BASE_FIELDS = {
  nome: "",
  raca: "",
  idade: "",
};

const emptyForm = (): PetForm => ({ ...BASE_FIELDS });
const emptyErrors = (): PetErrors => ({ ...BASE_FIELDS });

const petValidators: Record<keyof PetForm, (v: string) => string> = {
  nome: validators.name,
  raca: validators.required,
  idade: validators.age,
};

const validateForm = (
  formData: PetForm,
): { ok: boolean; errors: PetErrors } => {
  const errors = emptyErrors();

  (Object.keys(formData) as (keyof PetForm)[]).forEach((key) => {
    errors[key] = petValidators[key](formData[key]);
  });

  const ok = (Object.values(errors) as string[]).every((e) => e === "");
  return { ok, errors };
};

export function AddPetModal({ onPetAdded }: AddPetModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<PetForm>(emptyForm());
  const [errors, setErrors] = useState<PetErrors>(emptyErrors());

  const handleAddPet = async () => {
    const { ok, errors: newErrors } = validateForm(formData);
    setErrors(newErrors);

    if (!ok) {
      throw new Error("Validação falhou");
    }

    try {
      const response = await fetch("/v1/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          raca: formData.raca,
          idade: Number(formData.idade),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar pet");
      }

      // Reset form
      setFormData({ nome: "", raca: "", idade: "" });
      setErrors({ nome: "", raca: "", idade: "" });

      // Callback para recarregar lista
      onPetAdded?.();
    } catch (error) {
      console.error("Erro ao adicionar pet:", error);
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
      <AddButton onClick={() => setIsOpen(true)} label="Novo Pet" />

      <ActionModal
        isOpen={isOpen}
        title="Adicionar Novo Pet"
        description="Preencha os dados do novo pet para cadastrá-lo no sistema"
        onClose={() => {
          setIsOpen(false);
          setFormData({ nome: "", raca: "", idade: "" });
          setErrors({ nome: "", raca: "", idade: "" });
        }}
        onConfirm={handleAddPet}
        confirmButtonLabel="Adicionar Pet"
        confirmButtonVariant="primary"
        size="md"
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label
              htmlFor="pet-name"
              className="block text-sm font-medium text-slate-700"
            >
              Nome do Pet *
            </label>
            <input
              id="pet-name"
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.nome
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-500"
              }`}
              placeholder="Ex: Rex, Fluffy"
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-red-600">{errors.nome}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="pet-raca"
              className="block text-sm font-medium text-slate-700"
            >
              Raça *
            </label>
            <input
              id="pet-raca"
              type="text"
              value={formData.raca}
              onChange={(e) => handleInputChange("raca", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.raca
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-500"
              }`}
              placeholder="Ex: Labrador, Persa"
            />
            {errors.raca && (
              <p className="mt-1 text-xs text-red-600">{errors.raca}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="pet-idade"
              className="block text-sm font-medium text-slate-700"
            >
              Idade (anos) *
            </label>
            <input
              id="pet-idade"
              type="number"
              min="0"
              step="1"
              value={formData.idade}
              onChange={(e) => handleInputChange("idade", e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.idade
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500"
                  : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-500"
              }`}
              placeholder="Ex: 3, 5"
            />
            {errors.idade && (
              <p className="mt-1 text-xs text-red-600">{errors.idade}</p>
            )}
          </div>
        </form>
      </ActionModal>
    </>
  );
}
