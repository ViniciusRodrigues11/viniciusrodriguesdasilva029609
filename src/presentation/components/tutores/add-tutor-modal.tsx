import { useEffect, useMemo, useState } from "react";
import { ActionModal } from "../action-modal/action-modal";
import { AddButton } from "../ui/add-button";
import { FormInput } from "../ui/form-input";
import { ImageDragArea } from "../DragArea";
import { tutorFacade } from "../../../services/tutor.service";
import { applyPhoneMask, applyCpfMask } from "../../../helpers/mask.helpers";
import {
  createValidator,
  validators,
} from "../../../helpers/validators.helper";
import type { TutorEntity } from "../../../domain/entities/tutor.entity";

// Types
interface AddTutorModalProps {
  onTutorAdded?: () => void;
}

interface TutorUpsertModalProps {
  mode: "create" | "edit";
  tutor?: TutorEntity | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type TutorForm = {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
};

type TutorErrors = Record<keyof TutorForm, string>;

const BASE_FIELDS = {
  nome: "",
  email: "",
  telefone: "",
  endereco: "",
  cpf: "",
};

const emptyForm = (): TutorForm => ({ ...BASE_FIELDS });
const emptyErrors = (): TutorErrors => ({ ...BASE_FIELDS });

const onlyDigits = (v: string) => v.replace(/\D/g, "");

const addressValidator = createValidator(
  validators.required,
  validators.minLength(10),
  validators.maxLength(300),
);

const tutorFormValidators: Record<keyof TutorForm, (v: string) => string> = {
  nome: validators.name,
  email: validators.email,
  telefone: validators.phone,
  endereco: addressValidator,
  cpf: validators.cpf,
};

const validate = (data: TutorForm) => {
  const errors = emptyErrors();

  (Object.entries(data) as [keyof TutorForm, string][]).forEach(([k, v]) => {
    errors[k] = tutorFormValidators[k](v);
  });

  return { ok: Object.values(errors).every((e) => !e), errors };
};

function TutorUpsertModal({
  mode,
  tutor,
  isOpen,
  onOpenChange,
  onSuccess,
}: TutorUpsertModalProps) {
  const [formData, setFormData] = useState<TutorForm>(emptyForm());
  const [errors, setErrors] = useState<TutorErrors>(emptyErrors());
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

    if (isEdit && tutor) {
      setFormData({
        nome: tutor.nome ?? "",
        email: tutor.email ?? "",
        telefone: tutor.telefone ? applyPhoneMask(tutor.telefone) : "",
        endereco: tutor.endereco ?? "",
        cpf: tutor.cpf ? applyCpfMask(String(tutor.cpf)) : "",
      });
    } else {
      setFormData(emptyForm());
    }
    setErrors(emptyErrors());
    setImageFile(null);
    setIsRemovingPhoto(false);
    setRemovedExistingPhoto(false);
  }, [isOpen, isEdit, tutor]);

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
      email: formData.email.trim(),
      telefone: onlyDigits(formData.telefone),
      endereco: formData.endereco.trim(),
      cpf: Number(onlyDigits(formData.cpf)),
    };

    try {
      if (isEdit) {
        if (!tutor) {
          throw new Error("Tutor não encontrado para edição.");
        }

        const updatedTutor = await tutorFacade.updateTutor(tutor.id, payload);

        if (imageFile) {
          await tutorFacade.uploadFoto(updatedTutor.id, imageFile);
        }
      } else {
        const createdTutor = await tutorFacade.addTutor(payload);

        if (imageFile) {
          await tutorFacade.uploadFoto(createdTutor.id, imageFile);
        }
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar tutor:", error);
      throw error;
    }
  };

  const handleInputChange = <K extends keyof TutorForm>(
    field: K,
    value: string,
  ) => {
    let processedValue = value;

    if (field === "telefone") processedValue = applyPhoneMask(value);
    if (field === "cpf") processedValue = applyCpfMask(value);

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleRemoveExistingPhoto = async () => {
    if (!isEdit || !tutor?.foto?.id || !tutor?.id) return;

    try {
      setIsRemovingPhoto(true);
      await tutorFacade.deleteFoto(tutor.id, tutor.foto.id);
      setRemovedExistingPhoto(true);
      setImageFile(null);
    } catch (removeError) {
      console.error("Erro ao remover foto do tutor:", removeError);
      throw removeError;
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  const { modalTitle, confirmLabel, modalDescription } = useMemo(() => {
    if (isEdit) {
      return {
        modalTitle: "Editar tutor",
        confirmLabel: "Salvar alterações",
        modalDescription: "Atualize os dados do tutor e salve as mudanças.",
      };
    }

    return {
      modalTitle: "Adicionar novo tutor",
      confirmLabel: "Salvar",
      modalDescription:
        "Preencha os dados do novo tutor para cadastrá-lo no sistema",
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
          id="tutor-name"
          label="Nome Completo"
          type="text"
          value={formData.nome}
          onChange={(e) => handleInputChange("nome", e.target.value)}
          error={errors.nome}
          required
          placeholder="Ex: João Silva"
        />

        <FormInput
          id="tutor-email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          error={errors.email}
          required
          placeholder="Ex: joao@example.com"
        />

        <FormInput
          id="tutor-phone"
          label="Telefone"
          type="tel"
          value={formData.telefone}
          onChange={(e) => handleInputChange("telefone", e.target.value)}
          error={errors.telefone}
          required
          placeholder="Ex: (11) 99999-9999"
          maxLength={15}
        />

        <FormInput
          id="tutor-cpf"
          label="CPF"
          type="text"
          value={formData.cpf}
          onChange={(e) => handleInputChange("cpf", e.target.value)}
          error={errors.cpf}
          required
          placeholder="Ex: 123.456.789-01"
          maxLength={14}
        />

        <FormInput
          id="tutor-address"
          label="Endereço"
          type="text"
          value={formData.endereco}
          onChange={(e) => handleInputChange("endereco", e.target.value)}
          error={errors.endereco}
          required
          placeholder="Ex: Rua das Flores, 123, Bairro Centro, São Paulo - SP"
        />

        <ImageDragArea
          key={`${isEdit ? (tutor?.id ?? "new") : "create"}-${tutor?.foto?.id ?? "nofoto"}-${isOpen ? "open" : "closed"}`}
          onImageSelect={setImageFile}
          currentImageUrl={
            isEdit && tutor?.foto?.url && !removedExistingPhoto
              ? tutor.foto.url
              : undefined
          }
          onRemoveExisting={handleRemoveExistingPhoto}
          isRemoving={isRemovingPhoto}
        />
      </form>
    </ActionModal>
  );
}

export function AddTutorModal({ onTutorAdded }: AddTutorModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setIsOpen(true)} label="Novo tutor" />
      <TutorUpsertModal
        mode="create"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={onTutorAdded}
      />
    </>
  );
}

export { TutorUpsertModal };
