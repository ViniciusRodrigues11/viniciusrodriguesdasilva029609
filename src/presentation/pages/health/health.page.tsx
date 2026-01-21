import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/back-button";

type HealthStatus = "loading" | "ok" | "error";

type HealthCheck = {
  status: HealthStatus;
  message?: string;
  checkedAt?: Date;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://pet-manager-api.geia.vip";

const DEFAULT_TIMEOUT_MS = 5000;

const withTimeout = async (url: string, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const parseHealthResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  try {
    const data = await response.json();
    if (data?.status && data.status !== "UP") {
      throw new Error(`Status ${data.status}`);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return;
    }
    throw error;
  }
};

export function HealthPage() {
  const navigate = useNavigate();
  const [liveness, setLiveness] = useState<HealthCheck>({
    status: "loading",
  });
  const [readiness, setReadiness] = useState<HealthCheck>({
    status: "loading",
  });
  const [overall, setOverall] = useState<HealthCheck>({
    status: "loading",
  });

  const checkHealth = useCallback(async () => {
    setLiveness({ status: "loading" });
    setReadiness({ status: "loading" });
    setOverall({ status: "loading" });

    const now = new Date();

    const check = async (path: string) => {
      const response = await withTimeout(`${API_BASE_URL}${path}`);
      await parseHealthResponse(response);
    };

    const [liveResult, readyResult, overallResult] = await Promise.allSettled([
      check("/q/health/live"),
      check("/q/health/ready"),
      check("/q/health"),
    ]);

    setLiveness({
      status: liveResult.status === "fulfilled" ? "ok" : "error",
      message:
        liveResult.status === "rejected"
          ? ((liveResult.reason as Error)?.message ?? "Falha")
          : "OK",
      checkedAt: now,
    });

    setReadiness({
      status: readyResult.status === "fulfilled" ? "ok" : "error",
      message:
        readyResult.status === "rejected"
          ? ((readyResult.reason as Error)?.message ?? "Falha")
          : "OK",
      checkedAt: now,
    });

    setOverall({
      status: overallResult.status === "fulfilled" ? "ok" : "error",
      message:
        overallResult.status === "rejected"
          ? ((overallResult.reason as Error)?.message ?? "Falha")
          : "OK",
      checkedAt: now,
    });
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      checkHealth();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [checkHealth]);

  const badgeClass = useCallback((status: HealthStatus) => {
    if (status === "ok") return "bg-emerald-100 text-emerald-700";
    if (status === "error") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-600";
  }, []);

  const formatTime = useCallback((date?: Date) => {
    if (!date) return "-";
    return date.toLocaleTimeString("pt-BR");
  }, []);

  const overallSummary = useMemo(() => {
    if (overall.status === "ok") return "API disponível";
    if (overall.status === "error") return "API indisponível";
    return "Verificando...";
  }, [overall.status]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <BackButton onClick={() => navigate("/pets")} />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Health Check</h1>
        <p className="text-gray-600">
          Monitoramento básico de liveness e readiness da API.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${badgeClass(
            overall.status,
          )}`}
        >
          {overallSummary}
        </span>
        <span className="text-sm text-slate-500">
          Última verificação: {formatTime(overall.checkedAt)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={checkHealth}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Liveness</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                liveness.status,
              )}`}
            >
              {liveness.status === "loading" ? "Verificando" : liveness.message}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Confirma se a API está viva e respondendo.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Endpoint: /q/health/live
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Readiness</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                readiness.status,
              )}`}
            >
              {readiness.status === "loading"
                ? "Verificando"
                : readiness.message}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Confirma se a API está pronta para atender.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Endpoint: /q/health/ready
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Health</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                overall.status,
              )}`}
            >
              {overall.status === "loading" ? "Verificando" : overall.message}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Resumo geral de saúde da API.
          </p>
          <p className="mt-3 text-xs text-slate-400">Endpoint: /q/health</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p>
          Base URL: <span className="font-semibold">{API_BASE_URL}</span>
        </p>
        <p className="mt-1">Timeout: {DEFAULT_TIMEOUT_MS / 1000}s</p>
      </div>
    </div>
  );
}
