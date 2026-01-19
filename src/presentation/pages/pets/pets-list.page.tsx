import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PetCard } from "../../components/pets/pet-card";
import { AddPetModal } from "../../components/pets/add-pet-modal";
import { Pagination } from "../../components/ui/pagination";
import { SearchInput } from "../../components/ui/search-input";
import { useObservable } from "../../hooks/use-observable.hook";
import { petFacade } from "../../../services/pet.service";
import type { PetPaginationState } from "../../../application/facades/pet.facade";
import type { PetEntity } from "../../../domain/entities/pet.entity";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE = 300;

export function PetsListPage() {
  const navigate = useNavigate();
  const hasLoadedRef = useRef(false);

  const pets = useObservable<PetEntity[]>(petFacade.pets$, []);
  const loading = useObservable<boolean>(petFacade.loading$, false);
  const error = useObservable<string | null>(petFacade.error$, null);
  const pagination = useObservable<PetPaginationState>(petFacade.pagination$, {
    page: 1,
    pageSize: PAGE_SIZE,
    total: null,
  });

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
      petFacade.load(1, PAGE_SIZE, debouncedQuery);
    }
  }, [debouncedQuery]);

  const handlePrevPage = () => {
    const prevPage = Math.max(1, pagination.page - 1);
    petFacade.load(prevPage, PAGE_SIZE, debouncedQuery);
  };

  const handleNextPage = () => {
    petFacade.load(pagination.page + 1, PAGE_SIZE, debouncedQuery);
  };

  const handlePageChange = (page: number) => {
    const targetPage = Math.max(
      1,
      Math.min(page, Math.ceil((pagination.total ?? 0) / PAGE_SIZE) || page),
    );
    petFacade.load(targetPage, PAGE_SIZE, debouncedQuery);
  };

  const goToPetDetail = (petId: number) => {
    navigate(`/pets/${petId}`);
  };

  const handlePetAdded = () => {
    petFacade.load(1, PAGE_SIZE, debouncedQuery);
  };

  const hasNextPage = useMemo(() => {
    if (pagination.total && pagination.total > 0) {
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
          <p className="text-sm text-slate-600">
            Catálogo público de pets cadastrados.
          </p>
        </div>

        <div className="flex md:w-full justify-between gap-3 w-auto flex-row items-center my-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nome"
          />

          <AddPetModal onPetAdded={handlePetAdded} />
        </div>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
            Carregando pets...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
            {error}
          </div>
        )}

        {isEmptyState && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            Nenhum pet encontrado para a busca.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onClick={goToPetDetail} />
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
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
