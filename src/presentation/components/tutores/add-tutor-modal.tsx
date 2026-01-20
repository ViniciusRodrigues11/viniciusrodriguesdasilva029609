import { useState } from "react";
import { ActionModal } from "../action-modal/action-modal";
import { AddButton } from "../ui/add-button";
import { FormInput } from "../ui/form-input";
import { ImageDragArea } from "../DragArea";
import { tutorFacade } from "../../../services/tutor.service";
import { applyPhoneMask, applyCpfMask } from "../../../helpers/maskHelpers";
import { createValidator, validators } from "../../../helpers/validatorsHelper";

interface AddTutorModalProps {
  onTutorAdded?: () => void;
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

export function AddTutorModal({ onTutorAdded }: AddTutorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<TutorForm>(emptyForm());
  const [errors, setErrors] = useState<TutorErrors>(emptyErrors());
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

  const handleAddTutor = async () => {
    if (!validateForm()) {
      throw new Error("Validação falhou");
    }

    try {
      const createdTutor = await tutorFacade.addTutor({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: onlyDigits(formData.telefone),
        endereco: formData.endereco.trim(),
        cpf: Number(onlyDigits(formData.cpf)),
      });

      // Se houver imagem, faz upload em paralelo
      if (imageFile && createdTutor.id) {
        await tutorFacade.uploadFoto(createdTutor.id, imageFile);
      }

      resetState();
      onTutorAdded?.();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar tutor:", error);
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
    setIsOpen(false);
    resetState();
  };

  return (
    <>
      <AddButton onClick={() => setIsOpen(true)} label="Novo Tutor" />

      <ActionModal
        isOpen={isOpen}
        title="Adicionar Novo Tutor"
        description="Preencha os dados do novo tutor para cadastrá-lo no sistema"
        onClose={handleClose}
        onConfirm={handleAddTutor}
        confirmButtonLabel="Adicionar Tutor"
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

          <ImageDragArea onImageSelect={setImageFile} />
        </form>
      </ActionModal>
    </>
  );
}
