import {
  createBrowserRouter,
  type RouteObject,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoginPage } from "../pages/auth/login.page";
import { ProtectedRoute } from "./protected.route";
import { LoadingFallback } from "../components/loading-fallback";

// Lazy load das páginas
const PetsPage = lazy(() =>
  import("../pages/pets/pets.page").then((module) => ({
    default: module.PetsPage,
  })),
);

const TutoresPage = lazy(() =>
  import("../pages/tutores/tutores.page").then((module) => ({
    default: module.TutoresPage,
  })),
);

const HealthPage = lazy(() =>
  import("../pages/health/health.page").then((module) => ({
    default: module.HealthPage,
  })),
);

// Rotas da aplicação
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <div>Em construção</div>, // TODO: Implementar registro
  },
  {
    path: "/reset-password",
    element: <div>Em construção</div>, // TODO: Implementar reset
  },
  {
    path: "/pets",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <PetsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tutores",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <TutoresPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/health",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <HealthPage />
      </Suspense>
    ),
  },
];

/**
 * Instância do router
 * Usa createBrowserRouter do React Router v6
 */
export const router = createBrowserRouter(routes);
