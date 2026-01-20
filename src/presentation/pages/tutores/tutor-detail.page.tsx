import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tutorFacade } from "../../../services/tutor.service";
import { useObservable } from "../../hooks/use-observable.hook";
import type { TutorDetail } from "../../../application/facades/tutor.facade";
import { ArrowLeft, Mail, Phone, MapPin, IdCard } from "lucide-react";

export function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const tutorDetail = useObservable<TutorDetail | null>(
    tutorFacade.tutorDetail$,
    null,
  );
  const loading = useObservable<boolean>(tutorFacade.detailLoading$, false);
  const error = useObservable<string | null>(tutorFacade.error$, null);

  useEffect(() => {
    if (id) {
      const tutorId = parseInt(id, 10);
      tutorFacade.loadTutorDetail(tutorId).catch((err) => {
        console.error("Erro ao carregar detalhes do tutor:", err);
      });
    }

    return () => {
      tutorFacade.clearTutorDetail();
    };
  }, [id]);

  const handleBackClick = () => {
    navigate("/tutores");
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
          Carregando detalhes do tutor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!tutorDetail) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
          Tutor não encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <button
        onClick={handleBackClick}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 w-fit"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      {/* Header do Tutor */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Foto do Tutor */}
          {tutorDetail.foto ? (
            <div className="md:w-64 shrink-0">
              <img
                src={tutorDetail.foto.url}
                alt={tutorDetail.nome}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="md:w-64 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center h-64">
              <div className="text-center text-slate-400">
                <div className="text-4xl mb-2">👤</div>
                <p>Sem foto</p>
              </div>
            </div>
          )}

          {/* Informações do Tutor */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {tutorDetail.nome}
            </h1>

            <div className="space-y-4 mt-6">
              {tutorDetail.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${tutorDetail.email}`}
                    className="text-lg text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    {tutorDetail.email}
                  </a>
                </div>
              )}

              {tutorDetail.telefone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-slate-400 shrink-0" />
                  <a
                    href={`tel:${tutorDetail.telefone}`}
                    className="text-lg text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    {tutorDetail.telefone}
                  </a>
                </div>
              )}

              {tutorDetail.endereco && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 shrink-0 mt-1" />
                  <p className="text-lg text-slate-900">
                    {tutorDetail.endereco}
                  </p>
                </div>
              )}

              {tutorDetail.cpf && (
                <div className="flex items-center gap-3">
                  <IdCard size={18} className="text-slate-400 shrink-0" />
                  <p className="text-lg text-slate-900">
                    CPF:{" "}
                    {String(tutorDetail.cpf).replace(
                      /(\d{3})(\d{3})(\d{3})(\d{2})/,
                      "$1.$2.$3-$4",
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pets */}
      {tutorDetail.pets && tutorDetail.pets.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Pets ({tutorDetail.pets.length})
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {tutorDetail.pets.map((pet) => (
              <div
                key={pet.id}
                className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors cursor-pointer"
                onClick={() => navigate(`/pets/${pet.id}`)}
              >
                <div className="flex gap-4">
                  {pet.foto ? (
                    <img
                      src={pet.foto.url}
                      alt={pet.nome}
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-2xl">🐾</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-lg truncate">
                      {pet.nome}
                    </h3>

                    <div className="space-y-1 mt-2">
                      {pet.raca && (
                        <p className="text-sm text-slate-600">
                          Raça: {pet.raca}
                        </p>
                      )}

                      {pet.idade !== undefined && pet.idade !== null && (
                        <p className="text-sm text-slate-600">
                          Idade: {pet.idade} {pet.idade === 1 ? "ano" : "anos"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!tutorDetail.pets ||
        (tutorDetail.pets.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
            <p>Este tutor não possui pets cadastrados.</p>
          </div>
        ))}
    </div>
  );
}
