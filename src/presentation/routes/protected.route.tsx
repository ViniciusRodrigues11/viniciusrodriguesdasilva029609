import { Navigate } from "react-router-dom";
import { useObservable } from "../hooks/use-observable.hook";
import { authFacade } from "../../services/auth.service";

/**
 * Guard para proteger rotas que requerem autenticação
 * Redireciona para /login se não autenticado
 * Implementa o padrão de Route Guard do React Router
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useObservable(
    authFacade.isAuthenticated$,
    authFacade.isAuthenticatedSync(),
  );

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
