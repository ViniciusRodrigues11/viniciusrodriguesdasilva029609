import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { petFacade } from "../../../services/pet.service";
import { useObservable } from "../../hooks/use-observable.hook";
import type { PetDetail } from "../../../application/facades/pet.facade";
import { Mail, Phone, MapPin, PawPrint } from "lucide-react";
import { BackButton } from "../../components/back-button";
import { PawPrintLoader } from "../../components/ui/paw-print-loader";
import { ErrorState } from "../../components/error-state";

export function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const petDetail = useObservable<PetDetail | null>(petFacade.petDetail$, null);
  const loading = useObservable<boolean>(petFacade.detailLoading$, false);
  const error = useObservable<string | null>(petFacade.error$, null);

  useEffect(() => {
    if (id && !hasInitialized.current) {
      hasInitialized.current = true;
      const petId = parseInt(id, 10);
      petFacade.loadPetDetail(petId).catch((err) => {
        console.error("Erro ao carregar detalhes do pet:", err);
      });
    }

    return () => {
      petFacade.clearPetDetail();
    };
  }, [id]);

  const handleBackClick = () => {
    navigate("/pets");
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <BackButton onClick={handleBackClick} className="mb-4" />
        <PawPrintLoader />
      </div>
    );
  }

  if (error || !petDetail) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <BackButton onClick={handleBackClick} className="mb-4" />
        <ErrorState description="Não foi possível carregar os detalhes do pet." />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <BackButton onClick={handleBackClick} className="mb-4 w-fit" />

      {/* Header do Pet */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Foto do Pet */}
          {petDetail.foto ? (
            <div className="md:w-64 shrink-0">
              <img
                src={petDetail.foto.url}
                alt={petDetail.nome}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="md:w-64 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center h-64">
              <div className="text-center text-slate-400">
                <div className="text-4xl mb-2 flex items-center justify-center">
                  <PawPrint size={20} />
                </div>
                <p>Sem foto</p>
              </div>
            </div>
          )}

          {/* Informações do Pet */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {petDetail.nome}
            </h1>

            <div className="space-y-4 mt-6">
              {petDetail.raca && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Raça</p>
                  <p className="text-lg text-slate-900">{petDetail.raca}</p>
                </div>
              )}

              {petDetail.idade !== undefined && petDetail.idade !== null && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Idade</p>
                  <p className="text-lg text-slate-900">
                    {petDetail.idade} {petDetail.idade === 1 ? "ano" : "anos"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tutores */}
      {petDetail.tutores && petDetail.tutores.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Tutores ({petDetail.tutores.length})
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {petDetail.tutores.map((tutor) => (
              <div
                key={tutor.id}
                className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors cursor-pointer"
                onClick={() => navigate(`/tutores/${tutor.id}`)}
              >
                <div className="flex gap-4">
                  {tutor.foto ? (
                    <img
                      src={tutor.foto.url}
                      alt={tutor.nome}
                      className="w-16 h-16 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-xl">👤</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {tutor.nome}
                    </h3>

                    <div className="space-y-1 mt-2 text-sm">
                      {tutor.email && (
                        <a
                          href={`mailto:${tutor.email}`}
                          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 truncate"
                        >
                          <Mail size={14} className="shrink-0" />
                          <span className="truncate">{tutor.email}</span>
                        </a>
                      )}

                      {tutor.telefone && (
                        <a
                          href={`tel:${tutor.telefone}`}
                          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                        >
                          <Phone size={14} className="shrink-0" />
                          {tutor.telefone}
                        </a>
                      )}

                      {tutor.endereco && (
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin size={14} className="shrink-0 mt-0.5" />
                          <span className="wrap-break-word">
                            {tutor.endereco}
                          </span>
                        </div>
                      )}
                    </div>

                    {tutor.cpf && (
                      <p className="text-xs text-slate-500 mt-2">
                        CPF:{" "}
                        {String(tutor.cpf).replace(
                          /(\d{3})(\d{3})(\d{3})(\d{2})/,
                          "$1.$2.$3-$4",
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!petDetail.tutores ||
        (petDetail.tutores.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
            <p>Este pet não possui tutores cadastrados.</p>
          </div>
        ))}
    </div>
  );
}
