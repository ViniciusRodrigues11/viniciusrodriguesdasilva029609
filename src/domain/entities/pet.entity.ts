export interface PetPhotoEntity {
  id: number;
  nome?: string;
  contentType?: string;
  url?: string;
}

export interface PetEntity {
  id: number;
  nome: string;
  raca?: string;
  idade?: number;
  foto?: PetPhotoEntity;
}

export interface PaginatedPetsEntity {
  pets: PetEntity[];
  page: number;
  size: number;
  total?: number | null;
}
