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

export interface CreatePetApiPayload {
  nome: string;
  raca: string;
  idade: number;
}

export class PetApi {
  constructor(private readonly httpClient: AxiosInstance) { }

  async listPets(params: ListPetsApiParams): Promise<PaginatedPetsApiResponse> {
    const response = await this.httpClient.get<PaginatedPetsApiResponse>('/v1/pets', {
      params,
    });

    return response.data;
  }

  async createPet(payload: CreatePetApiPayload): Promise<PetApiResponse> {
    const response = await this.httpClient.post<PetApiResponse>('/v1/pets', payload);
    return response.data;
  }

  async deletePet(petId: number): Promise<void> {
    await this.httpClient.delete(`/v1/pets/${petId}`);
  }
}
