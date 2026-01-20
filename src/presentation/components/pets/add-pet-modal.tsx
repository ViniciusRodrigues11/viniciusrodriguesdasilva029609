// Dependencies
import { useState } from "react";
import { ActionModal } from "../action-modal/action-modal";
import { AddButton } from "../ui/add-button";
import { FormInput } from "../ui/form-input";
import { ImageDragArea } from "../DragArea";
import { validators } from "../../../helpers/validatorsHelper";
import { petFacade } from "../../../services/pet.service";

// Types
interface AddPetModalProps {
  onPetAdded?: () => void;
}
type PetForm = { nome: string; raca: string; idade: string };
type PetErrors = Record<keyof PetForm, string>;

const BASE_FIELDS = { nome: "", raca: "", idade: "" };
const emptyForm = (): PetForm => ({ ...BASE_FIELDS });
const emptyErrors = (): PetErrors => ({ ...BASE_FIELDS });

const petValidators: Record<keyof PetForm, (v: string) => string> = {
  nome: validators.name,
  raca: validators.required,
  idade: validators.age,
};

const validate = (data: PetForm) => {
  const errors = emptyErrors();

  (Object.entries(data) as [keyof PetForm, string][]).forEach(([k, v]) => {
    errors[k] = petValidators[k](v);
  });

  return { ok: Object.values(errors).every((e) => !e), errors };
};

export function AddPetModal({ onPetAdded }: AddPetModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<PetForm>(emptyForm());
  const [errors, setErrors] = useState<PetErrors>(emptyErrors());
  const [imageFile, setImageFile] = useState<File | null>(null);

  const validateForm = (): boolean => {
    const { ok, errors: newErrors } = validate(formData);
    setErrors(newErrors);
    return ok;
  };

  const resetState = () => {
    setFormData(emptyForm());
    setErrors(emptyErrors());
    setImageFile(null);
  };

  const handleAddPet = async () => {
    if (!validateForm()) {
      throw new Error("Validação falhou");
    }

    try {
      const createdPet = await petFacade.addPet({
        nome: formData.nome.trim(),
        raca: formData.raca.trim(),
        idade: Number(formData.idade),
      });

      // Se houver imagem, faz upload em paralelo
      if (imageFile && createdPet.id) {
        await petFacade.uploadFoto(createdPet.id, imageFile);
      }

      resetState();
      onPetAdded?.();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar pet:", error);
      throw error;
    }
  };

  const handleInputChange = <K extends keyof PetForm>(
    field: K,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetState();
  };

  return (
    <>
      <AddButton onClick={() => setIsOpen(true)} label="Novo Pet" />
      <ActionModal
        isOpen={isOpen}
        title="Adicionar Novo Pet"
        description="Preencha os dados do novo pet para cadastrá-lo no sistema"
        onClose={handleClose}
        onConfirm={handleAddPet}
        confirmButtonLabel="Adicionar Pet"
        confirmButtonVariant="primary"
        size="md"
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <FormInput
            id="pet-name"
            label="Nome do Pet"
            type="text"
            value={formData.nome}
            onChange={(e) => handleInputChange("nome", e.target.value)}
            error={errors.nome}
            required
            placeholder="Ex: Rex, Fluffy"
          />

          <FormInput
            id="pet-raca"
            label="Raça"
            type="text"
            value={formData.raca}
            onChange={(e) => handleInputChange("raca", e.target.value)}
            error={errors.raca}
            required
            placeholder="Ex: Labrador, Persa"
          />

          <FormInput
            id="pet-idade"
            label="Idade (anos)"
            type="number"
            min={0}
            step={1}
            value={formData.idade}
            onChange={(e) => handleInputChange("idade", e.target.value)}
            error={errors.idade}
            required
            placeholder="Ex: 3, 5"
          />

          <ImageDragArea onImageSelect={setImageFile} />
        </form>
      </ActionModal>
    </>
  );
}
