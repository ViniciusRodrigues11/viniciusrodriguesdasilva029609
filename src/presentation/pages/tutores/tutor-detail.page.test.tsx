import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BehaviorSubject } from "rxjs";
import type { TutorDetail } from "../../../application/facades/tutor.facade";
import { TutorDetailPage } from "./tutor-detail.page";

const mockNavigate = vi.fn();
const mockLoadTutorDetail = vi.fn();
const mockClearTutorDetail = vi.fn();
const mockLinkPets = vi.fn();
const mockUnlinkPet = vi.fn();

let tutorDetailSubject: BehaviorSubject<TutorDetail | null>;
let detailLoadingSubject: BehaviorSubject<boolean>;
let errorSubject: BehaviorSubject<string | null>;

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useParams: () => ({ id: "42" }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../services/tutor.service", () => ({
  tutorFacade: {
    get tutorDetail$() {
      return tutorDetailSubject.asObservable();
    },
    get detailLoading$() {
      return detailLoadingSubject.asObservable();
    },
    get error$() {
      return errorSubject.asObservable();
    },
    loadTutorDetail: (...args: Parameters<typeof mockLoadTutorDetail>) =>
      mockLoadTutorDetail(...args),
    clearTutorDetail: (...args: Parameters<typeof mockClearTutorDetail>) =>
      mockClearTutorDetail(...args),
    linkPets: (...args: Parameters<typeof mockLinkPets>) =>
      mockLinkPets(...args),
    unlinkPet: (...args: Parameters<typeof mockUnlinkPet>) =>
      mockUnlinkPet(...args),
  },
}));

vi.mock("../../components/tutores/link-pet-modal", () => ({
  LinkPetModal: () => null,
}));

vi.mock("../../components/action-modal/action-modal", () => ({
  ActionModal: () => null,
}));

vi.mock("../../components/back-button", () => ({
  BackButton: ({
    onClick,
    className,
  }: {
    onClick?: () => void;
    className?: string;
  }) => (
    <button className={className} onClick={onClick} type="button">
      Voltar
    </button>
  ),
}));

describe("TutorDetailPage", () => {
  beforeEach(() => {
    tutorDetailSubject = new BehaviorSubject<TutorDetail | null>(null);
    detailLoadingSubject = new BehaviorSubject<boolean>(false);
    errorSubject = new BehaviorSubject<string | null>(null);
    mockLoadTutorDetail.mockResolvedValue(undefined);
    mockLinkPets.mockResolvedValue(undefined);
    mockUnlinkPet.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("carrega os detalhes do tutor e limpa ao desmontar", async () => {
    const { unmount } = render(<TutorDetailPage />);

    await waitFor(() => {
      expect(mockLoadTutorDetail).toHaveBeenCalledWith(42);
    });

    unmount();

    expect(mockClearTutorDetail).toHaveBeenCalled();
  });

  it("exibe o estado de carregamento", () => {
    detailLoadingSubject.next(true);

    render(<TutorDetailPage />);

    expect(
      screen.getByText("Carregando detalhes do tutor..."),
    ).toBeInTheDocument();
  });

  it("exibe mensagem de erro", () => {
    errorSubject.next("Falha ao carregar tutor");

    render(<TutorDetailPage />);

    expect(screen.getByText("Falha ao carregar tutor")).toBeInTheDocument();
  });

  it("renderiza os detalhes do tutor e lista de pets", () => {
    tutorDetailSubject.next({
      id: 42,
      nome: "Maria Silva",
      email: "maria@teste.com",
      telefone: "11987654321",
      endereco: "Rua A, 123",
      cpf: 12345678901,
      pets: [
        { id: 1, nome: "Rex", raca: "Labrador", idade: 3 },
        { id: 2, nome: "Mia", raca: "Siamês", idade: 2 },
      ],
    });

    render(<TutorDetailPage />);

    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("Pets (2)")).toBeInTheDocument();
    expect(screen.getByText("Rex")).toBeInTheDocument();
    expect(screen.getByText("Mia")).toBeInTheDocument();
  });
});
