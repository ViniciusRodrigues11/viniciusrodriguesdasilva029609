import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { TutorEntity } from "../../../domain/entities/tutor.entity";
import { TutoresListPage } from "./tutores-list.page";

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../../hooks/use-debounced-value.hook", () => ({
  useDebouncedValue: (value: string) => value,
}));

vi.mock("../../components/ui/paw-print-loader", () => ({
  PawPrintLoader: () => <div data-testid="loader" />,
}));

vi.mock("../../components/tutores/add-tutor-modal", () => ({
  AddTutorModal: () => <div data-testid="add-tutor-modal" />,
  TutorUpsertModal: () => null,
}));

vi.mock("../../components/action-modal/action-modal", () => ({
  ActionModal: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="action-modal">{children}</div>
  ),
}));

vi.mock("../../components/tutores/tutor-card", () => ({
  TutorCard: ({
    tutor,
    onClick,
  }: {
    tutor: TutorEntity;
    onClick?: () => void;
  }) => (
    <div data-testid={`tutor-card-${tutor.id}`} onClick={onClick}>
      {tutor.nome}
    </div>
  ),
}));

type Subscriber<T> = (value: T) => void;
function createSubject<T>(initial: T) {
  let current = initial;
  const subscribers = new Set<Subscriber<T>>();
  return {
    next(value: T) {
      current = value;
      subscribers.forEach((fn) => fn(value));
    },
    getValue() {
      return current;
    },
    asObservable() {
      return {
        subscribe(handler: Subscriber<T>) {
          handler(current);
          subscribers.add(handler);
          return {
            unsubscribe() {
              subscribers.delete(handler);
            },
          };
        },
      };
    },
  };
}

const hoisted = vi.hoisted(() => {
  const tutoresSubject = createSubject<TutorEntity[]>([]);
  const loadingSubject = createSubject<boolean>(false);
  const errorSubject = createSubject<string | null>(null);
  const paginationSubject = createSubject<{
    page: number;
    pageSize: number;
    total: number | null;
  }>({
    page: 1,
    pageSize: 12,
    total: null,
  });

  const loadMock = vi.fn();
  const deleteMock = vi.fn();

  return {
    tutoresSubject,
    loadingSubject,
    errorSubject,
    paginationSubject,
    loadMock,
    deleteMock,
  };
});

vi.mock("../../../services/tutor.service", () => ({
  tutorFacade: {
    tutores$: hoisted.tutoresSubject.asObservable(),
    loading$: hoisted.loadingSubject.asObservable(),
    error$: hoisted.errorSubject.asObservable(),
    pagination$: hoisted.paginationSubject.asObservable(),
    load: hoisted.loadMock,
    deleteTutor: hoisted.deleteMock,
  },
  mockTutorFacade: hoisted,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <TutoresListPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  hoisted.tutoresSubject.next([]);
  hoisted.loadingSubject.next(false);
  hoisted.errorSubject.next(null);
  hoisted.paginationSubject.next({ page: 1, pageSize: 12, total: null });
  hoisted.loadMock.mockReset();
  hoisted.deleteMock.mockReset();
});

describe("TutoresListPage - essencial", () => {
  it("renderiza título e campo de busca", () => {
    renderPage();
    expect(screen.getByText("Tutores")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar por nome")).toBeInTheDocument();
  });

  it("exibe loader quando carregando", async () => {
    hoisted.loadingSubject.next(true);
    renderPage();
    expect(await screen.findByTestId("loader")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando presente", () => {
    hoisted.errorSubject.next("Não foi possível carregar a lista de tutores.");
    renderPage();
    expect(
      screen.getByText("Não foi possível carregar a lista de tutores."),
    ).toBeInTheDocument();
  });

  it("exibe estado vazio quando sem tutores e sem erro", () => {
    hoisted.tutoresSubject.next([]);
    hoisted.loadingSubject.next(false);
    hoisted.errorSubject.next(null);
    renderPage();
    expect(
      screen.getByText(
        "Nenhum tutor por aqui... Talvez os pets queriam passear!",
      ),
    ).toBeInTheDocument();
  });

  it("renderiza cards quando há tutores", async () => {
    hoisted.tutoresSubject.next([
      { id: 1, nome: "Ana", telefone: "1111-1111" },
      { id: 2, nome: "Bruno", telefone: "2222-2222" },
    ]);
    hoisted.paginationSubject.next({ page: 1, pageSize: 12, total: 20 });
    renderPage();

    expect(await screen.findByTestId("tutor-card-1")).toBeInTheDocument();
    expect(await screen.findByTestId("tutor-card-2")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Paginação" }),
    ).toBeInTheDocument();
  });

  it("dispara carregamento inicial via facade.load", () => {
    renderPage();
    expect(hoisted.loadMock).toHaveBeenCalled();
  });
});
