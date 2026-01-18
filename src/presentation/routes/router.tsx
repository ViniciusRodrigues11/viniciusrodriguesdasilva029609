import {
  createBrowserRouter,
  type RouteObject,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoginPage } from "../pages/auth/login.page";
import { ProtectedRoute } from "./protected.route";
import { LoadingFallback } from "../components/loading-fallback";
import { MainLayout } from "../components/layout/main-layout";

// Lazy load das páginas
const PetsModule = lazy(() =>
  import("./modules/pets.routes").then((module) => ({
    default: module.default,
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
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/pets/*",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PetsModule />
          </Suspense>
        ),
      },
      {
        path: "/tutores",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TutoresPage />
          </Suspense>
        ),
      },
    ],
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
