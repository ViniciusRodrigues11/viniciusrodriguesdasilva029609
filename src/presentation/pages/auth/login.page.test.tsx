import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { LoginPage } from "../auth/login.page";
import { MemoryRouter } from "react-router-dom";
import * as authService from "../../../services/auth.service";

// Mock do router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock do authFacade
vi.mock("../../../services/auth.service", () => ({
  authFacade: {
    isLoading$: {
      subscribe: (callback: (value: boolean) => void) => {
        callback(false);
        return { unsubscribe: vi.fn() };
      },
    },
    error$: {
      subscribe: (callback: (value: string | null) => void) => {
        callback(null);
        return { unsubscribe: vi.fn() };
      },
    },
    isAuthenticated$: {
      subscribe: (callback: (value: boolean) => void) => {
        callback(false);
        return { unsubscribe: vi.fn() };
      },
    },
    isAuthenticatedSync: vi.fn().mockReturnValue(false),
    login: vi.fn(),
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o formulário de login", () => {
    // Act
    render(<LoginPage />);

    // Assert
    expect(screen.getByText("MeuPet")).toBeInTheDocument();
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("deve validar usuário obrigatório", async () => {
    // Arrange
    const user = userEvent.setup({ delay: 0 });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole("button", { name: /entrar/i });

    // Act
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getAllByText(/campo obrigatório/i)).toHaveLength(2);
    });
  });

  it("deve validar senha obrigatória", async () => {
    // Arrange
    const user = userEvent.setup({ delay: 0 });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole("button", { name: /entrar/i });

    // Act
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getAllByText(/campo obrigatório/i)).toHaveLength(2);
    });
  });

  it("deve validar comprimento mínimo da senha", async () => {
    // Arrange
    const user = userEvent.setup({ delay: 0 });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    // Act
    await user.type(passwordInput, "ab");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText(/deve ter no mínimo 5 caracteres/i),
      ).toBeInTheDocument();
    });
  });

  it("deve disparar login com credenciais válidas", async () => {
    // Arrange
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const usernameInput = screen.getByLabelText(/usuário/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    // Act
    fireEvent.input(usernameInput, { target: { value: "testuser" } });
    fireEvent.input(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(authService.authFacade.login).toHaveBeenCalledWith({
      username: "testuser",
      password: "password123",
    });
  });

  it("deve desabilitar inputs durante carregamento", async () => {
    Object.defineProperty(authService.authFacade, "isLoading$", {
      value: {
        subscribe: (callback: (value: boolean) => void) => {
          callback(true);
          return { unsubscribe: vi.fn() };
        },
      },
      configurable: true,
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    // Assert
    expect(screen.getByLabelText(/usuário/i)).toBeDisabled();
    expect(screen.getByLabelText(/senha/i)).toBeDisabled();
  });
});
