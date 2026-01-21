import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tutorFacade } from "../../../services/tutor.service";
import { useObservable } from "../../hooks/use-observable.hook";
import type { TutorDetail } from "../../../application/facades/tutor.facade";
import { Mail, Phone, MapPin, IdCard, Plus, X } from "lucide-react";
import { LinkPetModal } from "../../components/tutores/link-pet-modal";
import { ActionModal } from "../../components/action-modal/action-modal";
import { applyPhoneMask, applyCpfMask } from "../../../helpers/mask.helpers";
import { BackButton } from "../../components/back-button";

export function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const tutorDetail = useObservable<TutorDetail | null>(
    tutorFacade.tutorDetail$,
    null,
  );
  const loading = useObservable<boolean>(tutorFacade.detailLoading$, false);
  const error = useObservable<string | null>(tutorFacade.error$, null);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [petToUnlink, setPetToUnlink] = useState<{
    id: number;
    nome: string;
  } | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    if (id && !hasInitialized.current) {
      hasInitialized.current = true;
      const tutorId = parseInt(id, 10);
      tutorFacade.loadTutorDetail(tutorId).catch((err) => {
        console.error("Erro ao carregar detalhes do tutor:", err);
      });
    }

    return () => {
      tutorFacade.clearTutorDetail();
    };
  }, [id]);

  const handleBackClick = () => {
    navigate("/tutores");
  };

  const handleLinkPets = async (petIds: number[]) => {
    if (!id || petIds.length === 0) return;
    const tutorId = parseInt(id, 10);
    await tutorFacade.linkPets(tutorId, petIds);
  };

  const handleUnlinkClick = (petId: number, petNome: string) => {
    setPetToUnlink({ id: petId, nome: petNome });
  };

  const handleConfirmUnlink = async () => {
    if (!petToUnlink || !id) return;

    setIsUnlinking(true);
    try {
      const tutorId = parseInt(id, 10);
      await tutorFacade.unlinkPet(tutorId, petToUnlink.id);
      setPetToUnlink(null);
    } catch (error) {
      console.error("Erro ao desvincular pet:", error);
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleCancelUnlink = () => {
    setPetToUnlink(null);
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <BackButton onClick={handleBackClick} className="mb-4" />
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
          Carregando detalhes do tutor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <BackButton onClick={handleBackClick} className="mb-4" />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!tutorDetail) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <BackButton onClick={handleBackClick} className="mb-4" />
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
          Tutor não encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <BackButton onClick={handleBackClick} className="mb-4 w-fit" />

      {/* Header do Tutor */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Foto do Tutor */}
          {tutorDetail.foto ? (
            <div className="md:w-64 shrink-0">
              <img
                src={tutorDetail.foto.url}
                alt={tutorDetail.nome}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="md:w-64 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center h-64">
              <div className="text-center text-slate-400">
                <div className="text-4xl mb-2">👤</div>
                <p>Sem foto</p>
              </div>
            </div>
          )}

          {/* Informações do Tutor */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {tutorDetail.nome}
            </h1>

            <div className="space-y-4 mt-6">
              {tutorDetail.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${tutorDetail.email}`}
                    className="text-lg text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    {tutorDetail.email}
                  </a>
                </div>
              )}

              {tutorDetail.telefone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-slate-400 shrink-0" />
                  <a
                    href={`tel:${tutorDetail.telefone}`}
                    className="text-lg text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    {applyPhoneMask(tutorDetail.telefone)}
                  </a>
                </div>
              )}

              {tutorDetail.endereco && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 shrink-0 mt-1" />
                  <p className="text-lg text-slate-900">
                    {tutorDetail.endereco}
                  </p>
                </div>
              )}

              {tutorDetail.cpf && (
                <div className="flex items-center gap-3">
                  <IdCard size={18} className="text-slate-400 shrink-0" />
                  <p className="text-lg text-slate-900">
                    CPF: {applyCpfMask(String(tutorDetail.cpf))}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pets */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Pets ({tutorDetail.pets?.length || 0})
          </h2>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Adicionar pet
          </button>
        </div>

        {tutorDetail.pets && tutorDetail.pets.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {tutorDetail.pets.map((pet) => (
              <div
                key={pet.id}
                className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors group relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnlinkClick(pet.id, pet.nome);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Desvincular pet"
                >
                  <X size={16} />
                </button>
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/pets/${pet.id}`)}
                >
                  <div className="flex gap-4">
                    {pet.foto ? (
                      <img
                        src={pet.foto.url}
                        alt={pet.nome}
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-2xl">🐾</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-lg truncate">
                        {pet.nome}
                      </h3>

                      <div className="space-y-1 mt-2">
                        {pet.raca && (
                          <p className="text-sm text-slate-600">
                            Raça: {pet.raca}
                          </p>
                        )}

                        {pet.idade !== undefined && pet.idade !== null && (
                          <p className="text-sm text-slate-600">
                            Idade: {pet.idade}{" "}
                            {pet.idade === 1 ? "ano" : "anos"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(!tutorDetail.pets || tutorDetail.pets.length === 0) && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
            <p>Este tutor não possui pets cadastrados.</p>
            <p className="text-sm mt-1">
              Clique em "Adicionar pet" para vincular um pet.
            </p>
          </div>
        )}
      </div>

      {/* Modais */}
      <LinkPetModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onLinkPets={handleLinkPets}
        currentPetIds={tutorDetail?.pets?.map((p) => p.id) || []}
      />

      <ActionModal
        isOpen={!!petToUnlink}
        title="Desvincular Pet"
        description="Esta ação não pode ser desfeita."
        onClose={handleCancelUnlink}
        onConfirm={handleConfirmUnlink}
        size="sm"
        fitContent
        confirmButtonLabel="Desvincular"
        cancelButtonLabel="Cancelar"
        confirmButtonVariant="danger"
        isLoading={isUnlinking}
      >
        <p className="text-slate-700">
          Tem certeza que deseja desvincular o pet{" "}
          <strong>{petToUnlink?.nome}</strong> deste tutor?
        </p>
      </ActionModal>
    </div>
  );
}
