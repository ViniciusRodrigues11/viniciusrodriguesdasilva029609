import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useObservable } from "../../hooks/use-observable.hook";
import { authFacade } from "../../../services/auth.service";
import type { CredentialsEntity } from "../../../domain/entities/auth.entity";

export function LoginPage() {
  const navigate = useNavigate();
  const isLoading = useObservable(authFacade.isLoading$, false);
  const error = useObservable(authFacade.error$, null);
  const isAuthenticated = useObservable(authFacade.isAuthenticated$, false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    password: "",
  });

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name === "username" ? "Usuário" : "Senha"} é obrigatório`;
    }

    if (name === "password" && value.length < 3) {
      return "Senha deve ter no mínimo 3 caracteres";
    }

    return "";
  };

  if (isAuthenticated) {
    navigate("/pets", { replace: true });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const usernameError = validateField("username", formData.username);
    const passwordError = validateField("password", formData.password);

    if (usernameError || passwordError) {
      setFormErrors({
        username: usernameError,
        password: passwordError,
      });
      return;
    }

    // Dispara o login
    const credentials: CredentialsEntity = {
      username: formData.username,
      password: formData.password,
    };

    authFacade.login(credentials);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso ao Sistema
            </h1>
            <p className="text-gray-600 text-sm">
              Gerenciador de Pets e Tutores
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nome de usuário
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="pai_de_pet"
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-400 transition-colors ${
                  formErrors.username
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="••••••••"
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-md text-gray-900 placeholder-gray-400 transition-colors ${
                  formErrors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-indigo-500"
                } focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <a
              href="/register"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Criar conta
            </a>
            <a
              href="/reset-password"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Recuperar senha
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
