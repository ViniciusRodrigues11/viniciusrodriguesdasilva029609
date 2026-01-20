import type { AxiosInstance } from 'axios';

export interface TutorApiResponse {
  id: number;
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  cpf?: number;
  foto?: {
    id: number;
    nome?: string;
    contentType?: string;
    url?: string;
  };
}

export interface PaginatedTutoresApiResponse {
  content: TutorApiResponse[];
  page: number;
  size: number;
  total?: number;
  pageCount?: number;
}

export interface ListTutoresApiParams {
  page: number;
  size: number;
  nome?: string;
}

export interface CreateTutorApiPayload {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: number;
}

export class TutorApi {
  constructor(private readonly httpClient: AxiosInstance) { }

  async listTutores(params: ListTutoresApiParams): Promise<PaginatedTutoresApiResponse> {
    const response = await this.httpClient.get<PaginatedTutoresApiResponse>('/v1/tutores', {
      params,
    });

    return response.data;
  }

  async createTutor(payload: CreateTutorApiPayload): Promise<TutorApiResponse> {
    const response = await this.httpClient.post<TutorApiResponse>('/v1/tutores', payload);
    return response.data;
  }

  async deleteTutor(tutorId: number): Promise<void> {
    await this.httpClient.delete(`/v1/tutores/${tutorId}`);
  }

  async uploadFoto(tutorId: number, foto: File): Promise<{ id: number; nome?: string; contentType?: string; url?: string }> {
    const formData = new FormData();
    formData.append('foto', foto);

    const response = await this.httpClient.post(`/v1/tutores/${tutorId}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}
