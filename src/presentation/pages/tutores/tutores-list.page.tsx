import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TutorCard } from "../../components/tutores/tutor-card";
import { AddTutorModal } from "../../components/tutores/add-tutor-modal";
import { Pagination } from "../../components/ui/pagination";
import { SearchInput } from "../../components/ui/search-input";
import { useObservable } from "../../hooks/use-observable.hook";
import { tutorFacade } from "../../../services/tutor.service";
import type { TutorPaginationState } from "../../../application/facades/tutor.facade";
import type { TutorEntity } from "../../../domain/entities/tutor.entity";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE = 300;

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, SEARCH_DEBOUNCE);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!hasLoadedRef.current || debouncedQuery !== "") {
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

  const goToTutorDetail = (tutorId: number) => {
    navigate(`/tutores/${tutorId}`);
  };

  const handleTutorAdded = () => {
    tutorFacade.load(1, PAGE_SIZE, debouncedQuery);
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
          <p className="text-sm text-slate-600">
            Catálogo público de tutores cadastrados.
          </p>
        </div>

        <div className="flex md:w-full justify-between gap-3 w-auto flex-row items-center my-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nome"
            className="md:max-w-72 max-w-52"
          />
          <AddTutorModal onTutorAdded={handleTutorAdded} />
        </div>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
            Carregando tutores...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
            {error}
          </div>
        )}

        {isEmptyState && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            Nenhum tutor encontrado para a busca.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tutores.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} onClick={goToTutorDetail} />
          ))}
        </div>

        <Pagination
          currentPage={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          isLoading={loading}
          hasNextPage={hasNextPage}
          onPreviousPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      </div>
    </div>
  );
}
