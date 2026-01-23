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
import { useDebouncedValue } from "../../hooks/use-debounced-value.hook";
import { tutorFacade } from "../../../services/tutor.service";
import type { TutorPaginationState } from "../../../application/facades/tutor.facade";
import type { TutorEntity } from "../../../domain/entities/tutor.entity";
import { PawPrintLoader } from "../../components/ui/paw-print-loader";
import {
  clampPage,
  calculateHasNextPage,
} from "../../helpers/pagination.helper";
import {
  PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from "../../constants/pagination.constants";
import { ErrorState } from "../../components/error-state";

export function TutoresListPage() {
  const navigate = useNavigate();

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
  const debouncedQuery = useDebouncedValue(
    searchTerm.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  const [tutorToDelete, setTutorToDelete] = useState<TutorEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tutorToEdit, setTutorToEdit] = useState<TutorEntity | null>(null);

  const loadPage = (page: number, query = debouncedQuery) => {
    tutorFacade.load(page, PAGE_SIZE, query);
  };

  const getClampedPage = (page: number) => {
    return clampPage(page, pagination.total, PAGE_SIZE);
  };

  const prevQueryRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (prevQueryRef.current === debouncedQuery) return;
    prevQueryRef.current = debouncedQuery;
    loadPage(1, debouncedQuery);
  }, [debouncedQuery]);

  const handlePrevPage = () => loadPage(getClampedPage(pagination.page - 1));
  const handleNextPage = () => loadPage(getClampedPage(pagination.page + 1));
  const handlePageChange = (page: number) => loadPage(getClampedPage(page));
  const handleTutorAdded = () => loadPage(1);
  const handleDeleteClick = (tutorId: number) => {
    const tutor = tutores.find((t) => t.id === tutorId);
    if (tutor) setTutorToDelete(tutor);
  };
  const handleEditClick = (tutorId: number) => {
    const tutor = tutores.find((t) => t.id === tutorId);
    if (tutor) setTutorToEdit(tutor);
  };
  const handleConfirmDelete = async () => {
    if (!tutorToDelete) return;

    setIsDeleting(true);
    const deletingId = tutorToDelete.id;

    try {
      await tutorFacade.deleteTutor(deletingId);
      setTutorToDelete(null);

      const wouldBeEmpty = tutores.length === 1;
      const targetPage =
        wouldBeEmpty && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;

      loadPage(targetPage);
    } catch (err) {
      console.error("Erro ao excluir tutor:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setTutorToDelete(null);
  };

  const handleTutorUpdated = () => {
    setTutorToEdit(null);
    loadPage(pagination.page);
  };

  const hasNextPage = useMemo(
    () =>
      calculateHasNextPage(
        pagination.page,
        pagination.pageSize,
        pagination.total,
        tutores.length,
      ),
    [pagination.page, pagination.pageSize, pagination.total, tutores.length],
  );

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
            onSearch={() => setSearchTerm((v) => v.trim())}
            placeholder="Buscar por nome"
            className="md:max-w-72 max-w-52"
          />
          <AddTutorModal onTutorAdded={handleTutorAdded} />
        </div>

        {loading && <PawPrintLoader />}

        {error && (
          <ErrorState description="Não foi possível carregar a lista de tutores." />
        )}

        {isEmptyState && (
          <EmptyState message="Nenhum tutor por aqui... Talvez os pets queriam passear!" />
        )}

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tutores.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onClick={() => navigate(`/tutores/${tutor.id}`)}
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
            if (!open) setTutorToEdit(null);
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
