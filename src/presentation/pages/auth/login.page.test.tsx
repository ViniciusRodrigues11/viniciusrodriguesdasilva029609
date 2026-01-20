import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { LoginPage } from "../auth/login.page";
import { BrowserRouter } from "react-router-dom";
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
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    // Assert
    expect(screen.getByText("Acesso ao Sistema")).toBeInTheDocument();
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("deve validar usuário obrigatório", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
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
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
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
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
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
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    const usernameInput = screen.getByLabelText(/usuário/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    // Act
    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(authService.authFacade.login).toHaveBeenCalledWith({
        username: "testuser",
        password: "password123",
      });
    });
  });

  it("deve desabilitar inputs durante carregamento", async () => {
    // Arrange - Mock com loading true
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
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    // Assert
    expect(screen.getByLabelText(/usuário/i)).toBeDisabled();
    expect(screen.getByLabelText(/senha/i)).toBeDisabled();
  });
});
