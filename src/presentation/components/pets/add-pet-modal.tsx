import { useEffect, useMemo, useState } from "react";
import { ActionModal } from "../action-modal/action-modal";
import { AddButton } from "../ui/add-button";
import { FormInput } from "../ui/form-input";
import { ImageDragArea } from "../DragArea";
import { validators } from "../../../helpers/validatorsHelper";
import type { PetEntity } from "../../../domain/entities/pet.entity";
import { petFacade } from "../../../services/pet.service";

// Types
interface AddPetModalProps {
  onPetAdded?: () => void;
}

interface PetUpsertModalProps {
  mode: "create" | "edit";
  pet?: PetEntity | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
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

function PetUpsertModal({
  mode,
  pet,
  isOpen,
  onOpenChange,
  onSuccess,
}: PetUpsertModalProps) {
  const [formData, setFormData] = useState<PetForm>(emptyForm());
  const [errors, setErrors] = useState<PetErrors>(emptyErrors());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  const [removedExistingPhoto, setRemovedExistingPhoto] = useState(false);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!isOpen) {
      setFormData(emptyForm());
      setErrors(emptyErrors());
      setImageFile(null);
      setIsRemovingPhoto(false);
      setRemovedExistingPhoto(false);
      return;
    }

    if (isEdit && pet) {
      setFormData({
        nome: pet.nome ?? "",
        raca: pet.raca ?? "",
        idade:
          pet.idade !== undefined && pet.idade !== null
            ? String(pet.idade)
            : "",
      });
    } else {
      setFormData(emptyForm());
    }
    setErrors(emptyErrors());
    setImageFile(null);
    setIsRemovingPhoto(false);
    setRemovedExistingPhoto(false);
  }, [isOpen, isEdit, pet]);

  const validateForm = (): boolean => {
    const { ok, errors: newErrors } = validate(formData);
    setErrors(newErrors);
    return ok;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      throw new Error("Validação falhou");
    }

    const payload = {
      nome: formData.nome.trim(),
      raca: formData.raca.trim(),
      idade: Number(formData.idade),
    };

    try {
      if (isEdit) {
        if (!pet) {
          throw new Error("Pet não encontrado para edição.");
        }

        const updatedPet = await petFacade.updatePet(pet.id, payload);

        if (imageFile) {
          await petFacade.uploadFoto(updatedPet.id, imageFile);
        }
      } else {
        const createdPet = await petFacade.addPet(payload);

        if (imageFile) {
          await petFacade.uploadFoto(createdPet.id, imageFile);
        }
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar pet:", error);
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
    onOpenChange(false);
  };

  const handleRemoveExistingPhoto = async () => {
    if (!isEdit || !pet?.foto?.id || !pet?.id) return;

    try {
      setIsRemovingPhoto(true);
      await petFacade.deleteFoto(pet.id, pet.foto.id);
      setRemovedExistingPhoto(true);
      setImageFile(null);
    } catch (removeError) {
      console.error("Erro ao remover foto do pet:", removeError);
      throw removeError;
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  const { modalTitle, confirmLabel, modalDescription } = useMemo(() => {
    if (isEdit) {
      return {
        modalTitle: "Editar Pet",
        confirmLabel: "Salvar alterações",
        modalDescription: "Atualize os dados do pet e salve as mudanças.",
      };
    }

    return {
      modalTitle: "Adicionar Novo Pet",
      confirmLabel: "Adicionar Pet",
      modalDescription:
        "Preencha os dados do novo pet para cadastrá-lo no sistema",
    };
  }, [isEdit]);

  return (
    <ActionModal
      isOpen={isOpen}
      title={modalTitle}
      description={modalDescription}
      onClose={handleClose}
      onConfirm={handleSubmit}
      confirmButtonLabel={confirmLabel}
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

        <ImageDragArea
          key={`${isEdit ? (pet?.id ?? "new") : "create"}-${pet?.foto?.id ?? "nofoto"}-${isOpen ? "open" : "closed"}`}
          onImageSelect={setImageFile}
          currentImageUrl={
            isEdit && pet?.foto?.url && !removedExistingPhoto
              ? pet.foto.url
              : undefined
          }
          onRemoveExisting={handleRemoveExistingPhoto}
          isRemoving={isRemovingPhoto}
        />
      </form>
    </ActionModal>
  );
}

export function AddPetModal({ onPetAdded }: AddPetModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setIsOpen(true)} label="Novo Pet" />
      <PetUpsertModal
        mode="create"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={onPetAdded}
      />
    </>
  );
}

export { PetUpsertModal };
