import type { AxiosInstance } from 'axios';

export interface PetApiResponse {
  id: number;
  nome: string;
  raca?: string;
  idade?: number;
  foto?: {
    id: number;
    nome?: string;
    contentType?: string;
    url?: string;
  };
}

export interface PaginatedPetsApiResponse {
  content: PetApiResponse[];
  page: number;
  size: number;
  total?: number;
  pageCount?: number;
}

export interface ListPetsApiParams {
  page: number;
  size: number;
  nome?: string;
}

export class PetApi {
  constructor(private readonly httpClient: AxiosInstance) { }

  async listPets(params: ListPetsApiParams): Promise<PaginatedPetsApiResponse> {
    const response = await this.httpClient.get<PaginatedPetsApiResponse>('/v1/pets', {
      params,
    });

    return response.data;
  }
}
