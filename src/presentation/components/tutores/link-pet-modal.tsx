import { useEffect, useState, useMemo, useCallback } from "react";
import { ActionModal } from "../action-modal/action-modal";
import { SearchInput } from "../ui/search-input";
import { petFacade } from "../../../services/pet.service";
import { useObservable } from "../../hooks/use-observable.hook";
import type { PetEntity } from "../../../domain/entities/pet.entity";
import type { PetPaginationState } from "../../../application/facades/pet.facade";

interface LinkPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkPets: (petIds: number[]) => Promise<void>;
  currentPetIds: number[];
}

export function LinkPetModal({
  isOpen,
  onClose,
  onLinkPets,
  currentPetIds,
}: LinkPetModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPetIds, setSelectedPetIds] = useState<number[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allPets, setAllPets] = useState<PetEntity[]>([]);

  const pets = useObservable<PetEntity[]>(petFacade.pets$, []);
  const loading = useObservable<boolean>(petFacade.loading$, false);
  const pagination = useObservable<PetPaginationState>(petFacade.pagination$, {
    page: 1,
    pageSize: 10,
    total: null,
  });

  const isInitialLoading = loading && allPets.length === 0;
  const isLoadingMore = loading && allPets.length > 0;

  useEffect(() => {
    if (isOpen) {
      // Reseta e carrega primeira página quando o modal abre
      setCurrentPage(1);
      setAllPets([]);
      petFacade.load(1, 10, "");
      setSearchTerm("");
      setSelectedPetIds([]);
    }
  }, [isOpen]);

  // Acumula os pets conforme as páginas são carregadas
  useEffect(() => {
    if (pets.length > 0 && pagination.page > 0) {
      setAllPets((prev) => {
        // Se for a primeira página, substitui
        if (pagination.page === 1) {
          return [...pets];
        }
        // Se for página seguinte, adiciona apenas pets novos
        const existingIds = new Set(prev.map((p) => p.id));
        const newPets = pets.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPets];
      });
    }
  }, [pets, pagination.page]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    petFacade.load(nextPage, 10, searchTerm.trim());
  };

  const togglePetSelection = (petId: number) => {
    setSelectedPetIds((prev) =>
      prev.includes(petId)
        ? prev.filter((id) => id !== petId)
        : [...prev, petId],
    );
  };

  const availablePets = useMemo(() => {
    // Filtra pets que ainda não estão vinculados ao tutor
    const filtered = allPets.filter((pet) => !currentPetIds.includes(pet.id));

    if (!searchTerm.trim()) {
      return filtered;
    }

    // Filtra por termo de busca
    const search = searchTerm.toLowerCase();
    return filtered.filter(
      (pet) =>
        pet.nome.toLowerCase().includes(search) ||
        pet.raca?.toLowerCase().includes(search),
    );
  }, [allPets, currentPetIds, searchTerm]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setAllPets([]);
    setSelectedPetIds([]);
    // Recarrega com o novo termo de busca
    petFacade.load(1, 10, value.trim());
  }, []);

  const handleConfirm = async () => {
    if (selectedPetIds.length === 0) {
      throw new Error("Selecione ao menos um pet para vincular");
    }

    setIsLinking(true);
    try {
      await onLinkPets(selectedPetIds);
      onClose();
    } catch (error) {
      console.error("Erro ao vincular pet:", error);
      throw error;
    } finally {
      setIsLinking(false);
    }
  };

  const handleClose = () => {
    if (!isLinking) {
      onClose();
    }
  };

  return (
    <ActionModal
      isOpen={isOpen}
      title="Vincular Pet ao Tutor"
      description="Selecione um pet para vincular a este tutor."
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmButtonLabel="Vincular Pet"
      confirmButtonVariant="primary"
      size="md"
      isLoading={isLinking}
    >
      <div className="space-y-4">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar pet por nome ou raça"
        />

        {isInitialLoading && (
          <div className="text-center py-8 text-slate-600">
            Carregando pets...
          </div>
        )}

        {!isInitialLoading && availablePets.length === 0 && (
          <div className="text-center py-8 text-slate-600">
            {searchTerm
              ? "Nenhum pet encontrado com esse termo."
              : "Todos os pets já estão vinculados a este tutor."}
          </div>
        )}

        {!isInitialLoading && availablePets.length > 0 && (
          <div className="space-y-2">
            {availablePets.map((pet) => (
              <div
                key={pet.id}
                onClick={() => togglePetSelection(pet.id)}
                className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPetIds.includes(pet.id)
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {pet.foto ? (
                  <img
                    src={pet.foto.url}
                    alt={pet.nome}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🐾</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">
                    {pet.nome}
                  </h4>
                  <div className="text-sm text-slate-600 space-y-0.5">
                    {pet.raca && <p>Raça: {pet.raca}</p>}
                    {pet.idade !== undefined && pet.idade !== null && (
                      <p>
                        Idade: {pet.idade} {pet.idade === 1 ? "ano" : "anos"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {selectedPetIds.includes(pet.id) ? (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão Carregar Mais */}
        {!loading &&
          availablePets.length > 0 &&
          (() => {
            const totalPages = pagination.total
              ? Math.ceil(pagination.total / pagination.pageSize)
              : Infinity;
            const hasMore = currentPage < totalPages;

            return hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 rounded-lg transition-colors font-medium"
              >
                Carregar mais pets
              </button>
            ) : null;
          })()}

        {isLoadingMore && availablePets.length > 0 && (
          <div className="text-center py-4 text-slate-600">
            Carregando mais pets...
          </div>
        )}
      </div>
    </ActionModal>
  );
}
