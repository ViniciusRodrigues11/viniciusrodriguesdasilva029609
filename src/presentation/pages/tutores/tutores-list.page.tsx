import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TutorCard } from "../../components/tutores/tutor-card";
import {
  AddTutorModal,
  TutorUpsertModal,
} from "../../components/tutores/add-tutor-modal";
import { Pagination } from "../../components/ui/pagination";
import { SearchInput } from "../../components/ui/search-input";
import { EmptyState } from "../../components/ui/empty-state";
import { ActionModal } from "../../components/action-modal/action-modal";
import { useObservable } from "../../hooks/use-observable.hook";
import { tutorFacade } from "../../../services/tutor.service";
import type { TutorPaginationState } from "../../../application/facades/tutor.facade";
import type { TutorEntity } from "../../../domain/entities/tutor.entity";
import { PawPrintLoader } from "../../components/ui/paw-print-loader";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE = 700;

export function TutoresListPage() {
  const navigate = useNavigate();
  const hasLoadedRef = useRef(false);

  const tutores = useObservable<TutorEntity[]>(tutorFacade.tutores$, []);
  const loading = useObservable<boolean>(tutorFacade.loading$, false);
  const error = useObservable<string | null>(tutorFacade.error$, null);
  const pagination = useObservable<TutorPaginationState>(
    tutorFacade.pagination$,
    {
      page: 1,
      pageSize: PAGE_SIZE,
      total: null,
    },
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [tutorToDelete, setTutorToDelete] = useState<TutorEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tutorToEdit, setTutorToEdit] = useState<TutorEntity | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, SEARCH_DEBOUNCE);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (hasLoadedRef.current) {
      tutorFacade.load(1, PAGE_SIZE, debouncedQuery);
    } else {
      hasLoadedRef.current = true;
      tutorFacade.load(1, PAGE_SIZE, debouncedQuery);
    }
  }, [debouncedQuery]);

  const handlePrevPage = () => {
    const prevPage = Math.max(1, pagination.page - 1);
    tutorFacade.load(prevPage, PAGE_SIZE, debouncedQuery);
  };

  const handleNextPage = () => {
    tutorFacade.load(pagination.page + 1, PAGE_SIZE, debouncedQuery);
  };

  const handlePageChange = (page: number) => {
    const targetPage = Math.max(
      1,
      Math.min(page, Math.ceil((pagination.total ?? 0) / PAGE_SIZE) || page),
    );
    tutorFacade.load(targetPage, PAGE_SIZE, debouncedQuery);
  };

  const goToTutorDetail = (tutorId: number) => {
    navigate(`/tutores/${tutorId}`);
  };

  const handleTutorAdded = () => {
    tutorFacade.load(1, PAGE_SIZE, debouncedQuery);
  };

  const handleDeleteClick = (tutorId: number) => {
    const tutor = tutores.find((t) => t.id === tutorId);
    if (tutor) {
      setTutorToDelete(tutor);
    }
  };

  const handleEditClick = (tutorId: number) => {
    const tutor = tutores.find((t) => t.id === tutorId);
    if (tutor) {
      setTutorToEdit(tutor);
    }
  };

  const handleConfirmDelete = async () => {
    if (!tutorToDelete) return;

    setIsDeleting(true);
    try {
      await tutorFacade.deleteTutor(tutorToDelete.id);
      setTutorToDelete(null);

      const remainingTutores = tutores.filter((t) => t.id !== tutorToDelete.id);
      if (remainingTutores.length === 0 && pagination.page > 1) {
        tutorFacade.load(pagination.page - 1, PAGE_SIZE, debouncedQuery);
      }
    } catch (error) {
      console.error("Erro ao excluir tutor:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setTutorToDelete(null);
  };

  const handleTutorUpdated = () => {
    setTutorToEdit(null);
    tutorFacade.load(pagination.page, PAGE_SIZE, debouncedQuery);
  };

  const hasNextPage = useMemo(() => {
    if (pagination.total && pagination.total > 0) {
      const totalPages = Math.ceil(pagination.total / pagination.pageSize);
      return pagination.page < totalPages;
    }
    return tutores.length >= pagination.pageSize;
  }, [pagination.page, pagination.pageSize, pagination.total, tutores.length]);

  const isEmptyState = !loading && tutores.length === 0 && !error;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="md:flex md:flex-col md:items-baseline gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tutores</h1>
          <p className="text-sm text-slate-600">Catálogo público de tutores.</p>
        </div>

        <div className="flex md:w-full justify-between gap-3 w-auto flex-row items-center my-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => setDebouncedQuery(searchTerm.trim())}
            placeholder="Buscar por nome"
            className="md:max-w-72 max-w-52"
          />
          <AddTutorModal onTutorAdded={handleTutorAdded} />
        </div>

        {loading && <PawPrintLoader />}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
            {error}
          </div>
        )}

        {isEmptyState && (
          <EmptyState message="Nenhum tutor por aqui... Talvez os pets queriam passear!" />
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tutores.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onClick={goToTutorDetail}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>

        <TutorUpsertModal
          mode="edit"
          tutor={tutorToEdit}
          isOpen={!!tutorToEdit}
          onOpenChange={(open) => {
            if (!open) {
              setTutorToEdit(null);
            }
          }}
          onSuccess={handleTutorUpdated}
        />

        <ActionModal
          isOpen={!!tutorToDelete}
          title="Excluir tutor"
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
            Tem certeza que deseja excluir o tutor{" "}
            <strong>{tutorToDelete?.nome}</strong>?
          </p>
        </ActionModal>

        {!isEmptyState && (
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
