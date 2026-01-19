import { AxiosClient } from '../infrastructure/http/axios.client';
import { TokenStorage } from '../infrastructure/storage/token.storage';
import { TutorApi } from '../infrastructure/api/tutor.api';
import { TutorRepositoryImpl } from '../infrastructure/repositories/tutor.repository.impl';
import { ListTutoresUseCase } from '../application/use-cases/list-tutores.use-case';
import { DeleteTutorUseCase } from '../application/use-cases/delete-tutor.use-case';
import { TutorFacade } from '../application/facades/tutor.facade';

const tokenStorage = new TokenStorage();
const axiosClient = new AxiosClient(undefined, tokenStorage);
const tutorApi = new TutorApi(axiosClient.instance);
const tutorRepository = new TutorRepositoryImpl(tutorApi);
const listTutoresUseCase = new ListTutoresUseCase(tutorRepository);
const deleteTutorUseCase = new DeleteTutorUseCase(tutorRepository);

export const tutorFacade = new TutorFacade(listTutoresUseCase, deleteTutorUseCase, tutorApi);
