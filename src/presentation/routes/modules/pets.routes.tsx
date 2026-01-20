import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { PetsListPage } from "../../pages/pets/pets-list.page";
import { PetDetailPage } from "../../pages/pets/pet-detail.page";
import { LoadingFallback } from "../../components/ui/loading-fallback";

export function PetsModule() {
  return (
    <Routes>
      <Route index element={<PetsListPage />} />
      <Route
        path=":id"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <PetDetailPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default PetsModule;
