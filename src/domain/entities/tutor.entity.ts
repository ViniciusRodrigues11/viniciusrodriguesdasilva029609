export interface TutorPhotoEntity {
  id: number;
  nome?: string;
  contentType?: string;
  url?: string;
}

export interface TutorEntity {
  id: number;
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  cpf?: number;
  foto?: TutorPhotoEntity;
}

export interface PaginatedTutoresEntity {
  tutores: TutorEntity[];
  page: number;
  size: number;
  total?: number | null;
}
