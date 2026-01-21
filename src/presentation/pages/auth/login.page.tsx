// Dependencies
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useObservable } from "../../hooks/use-observable.hook";
import { FormInput } from "../../components/ui/form-input";
import { authFacade } from "../../../services/auth.service";
import { validators } from "../../../helpers/validators.helper";

// Types
import type { CredentialsEntity } from "../../../domain/entities/auth.entity";
type LoginForm = { username: string; password: string };
type LoginErrors = Record<keyof LoginForm, string>;

const BASE_FIELDS = { username: "", password: "" };
const emptyForm = (): LoginForm => ({ ...BASE_FIELDS });
const emptyErrors = (): LoginErrors => ({ ...BASE_FIELDS });

const loginFormValidators: Record<keyof LoginForm, (v: string) => string> = {
  username: validators.required,
  password: validators.password,
};

const validate = (data: LoginForm) => {
  const errors = emptyErrors();

  (Object.entries(data) as [keyof LoginForm, string][]).forEach(([k, v]) => {
    errors[k] = loginFormValidators[k](v);
  });

  return { ok: Object.values(errors).every((e) => !e), errors };
};

export function LoginPage() {
  const isLoading = useObservable(authFacade.isLoading$, false);
  const error = useObservable(authFacade.error$, null);
  const isAuthenticated = useObservable(
    authFacade.isAuthenticated$,
    authFacade.isAuthenticatedSync(),
  );

  const [formData, setFormData] = useState<LoginForm>(emptyForm());
  const [errors, setErrors] = useState<LoginErrors>(emptyErrors());

  const validateForm = (): boolean => {
    const { ok, errors: newErrors } = validate(formData);
    setErrors(newErrors);
    return ok;
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = <K extends keyof LoginForm>(
    field: K,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const credentials: CredentialsEntity = {
      username: formData.username.trim(),
      password: formData.password.trim(),
    };

    authFacade.login(credentials);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">MeuPet</h1>
            <p className="text-gray-600 text-sm">
              Cadastro público de pets e tutores.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              id="username"
              label="Nome de usuário"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              error={errors.username}
              required
              placeholder="Digite seu nome de usuário"
              disabled={isLoading}
            />

            <FormInput
              id="password"
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              error={errors.password}
              required
              placeholder="Digite sua senha"
              disabled={isLoading}
            />

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
        </div>
      </div>
    </div>
  );
}
