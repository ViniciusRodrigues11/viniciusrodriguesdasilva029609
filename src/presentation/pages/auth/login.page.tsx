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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-50/50 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              MeuPet
            </h1>
            <p className="text-gray-500 text-sm">
              Entre para gerenciar seus pets e tutores
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-1">
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
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
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <svg
                    className="w-4 h-4 opacity-70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
