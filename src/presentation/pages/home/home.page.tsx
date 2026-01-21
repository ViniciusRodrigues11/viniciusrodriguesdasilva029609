import { useEffect, useState, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Users, Sparkles, ArrowRight } from "lucide-react";
import { petFacade } from "../../../services/pet.service";
import { tutorFacade } from "../../../services/tutor.service";

interface StatsState {
  pets: number | null;
  tutores: number | null;
}

const formatCount = (value: number | null) =>
  typeof value === "number" ? value.toLocaleString("pt-BR") : "--";

export function HomePage() {
  const [stats, setStats] = useState<StatsState>({ pets: null, tutores: null });
  const [loading, setLoading] = useState<boolean>(true);
  const hasInitialized = useRef(false);
  const petImages = [
    "/pets/pet1.webp",
    "/pets/pet2.webp",
    "/pets/pet3.webp",
    "/pets/pet4.webp",
    "/pets/pet5.webp",
    "/pets/pet6.webp",
    "/pets/pet7.webp",
    "/pets/pet8.webp",
  ];

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchStats = async () => {
      setLoading(true);

      try {
        const [petsTotal, tutoresTotal] = await Promise.all([
          petFacade.getTotalCount(),
          tutorFacade.getTotalCount(),
        ]);

        setStats({ pets: petsTotal, tutores: tutoresTotal });
      } catch {
        // Erro tratado silenciosamente
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-full bg-linear-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:gap-8 px-6 py-10">
        <section className="grid items-center gap-8 rounded-2xl bg-white/80 p-8 md:p-14 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          <div className="flex items-center justify-between gap-6 md:gap-12 flex-col lg:flex-row">
            <div className="space-y-3 flex flex-1 flex-col gap-4">
              <div className="inline-flex items-center w-fit gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                <Sparkles className="h-4 w-4" />
                Bem-vindo ao MeuPet
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-0">
                Acompanhe o cadastro público de{" "}
                <span className="text-indigo-600">pets</span> e seus{" "}
                <span className="text-indigo-600">tutores</span>.
              </h1>
              <p className="text-base text-slate-700 max-w-3xl">
                Centralize informações, visualize vínculos entre tutores e pets
                e mantenha o registro sempre atualizado com autenticação segura.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/pets"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg"
                >
                  Ver pets
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/tutores"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  Explorar tutores
                </Link>
              </div>
            </div>
            <RotatingPets images={petImages} intervalMs={3600} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Pets cadastrados"
            description="Total de registros ativos na base pública"
            value={formatCount(stats.pets)}
            icon={<PawPrint className="h-5 w-5 text-indigo-600" />}
            accent="bg-indigo-50"
            loading={loading}
          />
          <StatCard
            title="Tutores registrados"
            description="Pessoas vinculadas e prontas para contato"
            value={formatCount(stats.tutores)}
            icon={<Users className="h-5 w-5 text-indigo-600" />}
            accent="bg-indigo-50"
            loading={loading}
          />
        </section>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  description: string;
  value: string;
  icon: ReactNode;
  accent: string;
  loading?: boolean;
}

function StatCard({
  title,
  description,
  value,
  icon,
  accent,
  loading,
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md ${accent}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-inner ring-1 ring-slate-100">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? "--" : value}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-700">{description}</p>
    </div>
  );
}

interface RotatingPetsProps {
  images: string[];
  intervalMs?: number;
}

function RotatingPets({ images, intervalMs = 3000 }: RotatingPetsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images, intervalMs]);

  if (!images || images.length === 0) return null;

  return (
    <div className="h-60 overflow-hidden rounded-xl">
      {images.map((src, i) => {
        const isActive = i === index;
        const alt = `Pet ${i + 1}`;
        return (
          <img
            key={src}
            src={src}
            alt={alt}
            className={`sticky inset-0 h-60 self-center
               transition-all duration-600 ${isActive ? "opacity-100" : "opacity-0"}`}
            loading={isActive ? "eager" : "lazy"}
          />
        );
      })}
    </div>
  );
}
