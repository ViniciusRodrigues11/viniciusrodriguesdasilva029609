import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PetCard } from "../../components/pets/pet-card";
import {
  AddPetModal,
  PetUpsertModal,
} from "../../components/pets/add-pet-modal";
import { Pagination } from "../../components/ui/pagination";
import { SearchInput } from "../../components/ui/search-input";
import { EmptyState } from "../../components/ui/empty-state";
import { PawPrintLoader } from "../../components/ui/paw-print-loader";
import { ActionModal } from "../../components/action-modal/action-modal";
import { useObservable } from "../../hooks/use-observable.hook";
import { petFacade } from "../../../services/pet.service";
import type { PetPaginationState } from "../../../application/facades/pet.facade";
import type { PetEntity } from "../../../domain/entities/pet.entity";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE = 700;

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function PetsListPage() {
  const navigate = useNavigate();

  const pets = useObservable<PetEntity[]>(petFacade.pets$, []);
  const loading = useObservable<boolean>(petFacade.loading$, false);
  const error = useObservable<string | null>(petFacade.error$, null);
  const pagination = useObservable<PetPaginationState>(petFacade.pagination$, {
    page: 1,
    pageSize: PAGE_SIZE,
    total: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedQuery = useDebouncedValue(searchTerm.trim(), SEARCH_DEBOUNCE);

  const [petToDelete, setPetToDelete] = useState<PetEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [petToEdit, setPetToEdit] = useState<PetEntity | null>(null);

  const loadPage = (page: number, query = debouncedQuery) => {
    petFacade.load(page, PAGE_SIZE, query);
  };

  const clampPage = (page: number) => {
    if (pagination.total == null) return Math.max(1, page);

    const totalPages = Math.max(1, Math.ceil(pagination.total / PAGE_SIZE));
    return Math.max(1, Math.min(page, totalPages));
  };

  const prevQueryRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (prevQueryRef.current === debouncedQuery) return;
    prevQueryRef.current = debouncedQuery;
    loadPage(1, debouncedQuery);
  }, [debouncedQuery]);

  const handlePrevPage = () => loadPage(clampPage(pagination.page - 1));
  const handleNextPage = () => loadPage(clampPage(pagination.page + 1));
  const handlePageChange = (page: number) => loadPage(clampPage(page));

  const goToPetDetail = (petId: number) => {
    navigate(`/pets/${petId}`);
  };

  const handlePetAdded = () => loadPage(1);

  const handleDeleteClick = (petId: number) => {
    const pet = pets.find((p) => p.id === petId);
    if (pet) setPetToDelete(pet);
  };

  const handleEditClick = (petId: number) => {
    const pet = pets.find((p) => p.id === petId);
    if (pet) setPetToEdit(pet);
  };

  const handleConfirmDelete = async () => {
    if (!petToDelete) return;

    setIsDeleting(true);
    const deletingId = petToDelete.id;

    try {
      await petFacade.deletePet(deletingId);
      setPetToDelete(null);

      // Se a página ficaria vazia após remover 1 item, volta uma página.
      const wouldBeEmpty = pets.length === 1;
      const targetPage =
        wouldBeEmpty && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;

      loadPage(targetPage);
    } catch (err) {
      // Erro já tratado pela facade
      console.error("Erro ao excluir pet:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setPetToDelete(null);
  };

  const handlePetUpdated = () => {
    setPetToEdit(null);
    loadPage(pagination.page);
  };

  const hasNextPage = useMemo(() => {
    if (pagination.total != null && pagination.total > 0) {
      const totalPages = Math.ceil(pagination.total / pagination.pageSize);
      return pagination.page < totalPages;
    }
    return pets.length >= pagination.pageSize;
  }, [pagination.page, pagination.pageSize, pagination.total, pets.length]);

  const isEmptyState = !loading && pets.length === 0 && !error;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="md:flex md:flex-col md:items-baseline gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pets</h1>
          <p className="text-sm text-slate-600">Catálogo público de pets.</p>
        </div>

        <div className="flex md:w-full justify-between gap-3 w-auto flex-row items-center my-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => setSearchTerm((v) => v.trim())}
            placeholder="Buscar por nome"
            className="md:max-w-72 max-w-52"
          />

          <AddPetModal onPetAdded={handlePetAdded} />
        </div>

        {loading && <PawPrintLoader />}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
            {error}
          </div>
        )}

        {isEmptyState && <EmptyState message="Ops! Nenhum pet por aqui..." />}

        <div className="grid gap-4  md:grid-cols-3 lg:grid-cols-4">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onClick={goToPetDetail}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>

        <PetUpsertModal
          mode="edit"
          pet={petToEdit}
          isOpen={!!petToEdit}
          onOpenChange={(open) => {
            if (!open) setPetToEdit(null);
          }}
          onSuccess={handlePetUpdated}
        />

        <ActionModal
          isOpen={!!petToDelete}
          title="Excluir Pet"
          description="Esta ação não pode ser desfeita."
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          size="sm"
          fitContent
          confirmButtonLabel="Excluir"
          cancelButtonLabel="Cancelar"
          confirmButtonVariant="danger"
          isLoading={isDeleting}
        >
          <p className="text-slate-700">
            Tem certeza que deseja excluir o pet{" "}
            <strong>{petToDelete?.nome}</strong>?
          </p>
        </ActionModal>

        {(!isEmptyState || !loading) && (
          <Pagination
            currentPage={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            isLoading={loading}
            hasNextPage={hasNextPage}
            onPreviousPage={handlePrevPage}
            onNextPage={handleNextPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
