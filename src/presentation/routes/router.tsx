import {
  createBrowserRouter,
  type RouteObject,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoginPage } from "../pages/auth/login.page";
import { ProtectedRoute } from "./protected.route";
import { LoadingFallback } from "../components/ui/loading-fallback";
import { MainLayout } from "../components/layout/main-layout";

// Lazy load das páginas
const HomePage = lazy(() =>
  import("../pages/home/home.page").then((module) => ({
    default: module.HomePage,
  })),
);

const PetsModule = lazy(() =>
  import("./modules/pets.routes").then((module) => ({
    default: module.default,
  })),
);

const TutoresModule = lazy(() =>
  import("./modules/tutores.routes").then((module) => ({
    default: module.default,
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
    path: "/health",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <HealthPage />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "pets/*",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PetsModule />
          </Suspense>
        ),
      },
      {
        path: "tutores/*",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TutoresModule />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

/**
 * Instância do router
 * Usa createBrowserRouter do React Router v6
 */
export const router = createBrowserRouter(routes);
