import { AxiosClient } from '../infrastructure/http/axios.client';
import { TokenStorage } from '../infrastructure/storage/token.storage';
import { PetApi } from '../infrastructure/api/pet.api';
import { PetRepositoryImpl } from '../infrastructure/repositories/pet.repository.impl';
import { ListPetsUseCase } from '../application/use-cases/list-pets.use-case';
import { PetFacade } from '../application/facades/pet.facade';

const tokenStorage = new TokenStorage();
const axiosClient = new AxiosClient(undefined, tokenStorage);
const petApi = new PetApi(axiosClient.instance);
const petRepository = new PetRepositoryImpl(petApi);
const listPetsUseCase = new ListPetsUseCase(petRepository);

export const petFacade = new PetFacade(listPetsUseCase);
