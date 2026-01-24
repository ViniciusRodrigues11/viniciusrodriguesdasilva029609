export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const httpError = error as {
      response?: {
        status?: number;
        data?: { message?: string };
      };
    };
    const status = httpError.response?.status;

    if (status === 401) return 'Sessão expirada. Faça login novamente.';
    if (status === 404) return 'Recurso não encontrado.';
    if (status === 400) return 'Dados de entrada inválidos.';
    if (status === 409) return 'Conflito ao processar solicitação.';
    if (status === 500) return 'Erro interno do servidor.';

    return httpError.response?.data?.message ?? 'Erro ao processar solicitação.';
  }

  if (error instanceof Error) {
    if (error.message === 'Network Error') {
      return 'Erro de conexão com o servidor.';
    }
    return error.message || 'Erro ao processar solicitação.';
  }

  return 'Erro ao processar solicitação.';
}
