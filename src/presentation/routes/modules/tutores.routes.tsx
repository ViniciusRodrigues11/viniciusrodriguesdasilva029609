import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { TutoresListPage } from "../../pages/tutores/tutores-list.page";
import { TutorDetailPage } from "../../pages/tutores/tutor-detail.page";
import { LoadingFallback } from "../../components/ui/loading-fallback";

export function TutoresModule() {
  return (
    <Routes>
      <Route index element={<TutoresListPage />} />
      <Route
        path=":id"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <TutorDetailPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default TutoresModule;
