import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { TutorFacade } from './tutor.facade';
import { ListTutoresUseCase } from '../use-cases/list-tutores.use-case';
import { DeleteTutorUseCase } from '../use-cases/delete-tutor.use-case';
import type { ITutorRepository } from '../../domain/repositories/tutor.repository';
import type { TutorEntity, PaginatedTutoresEntity } from '../../domain/entities/tutor.entity';
import type { TutorApi } from '../../infrastructure/api/tutor.api';

const createTutorApiMock = (): TutorApi => ({
  listTutores: vi.fn(),
  createTutor: vi.fn(),
  updateTutor: vi.fn(),
  deleteTutor: vi.fn(),
  getTutorDetail: vi.fn(),
  uploadFoto: vi.fn(),
  deleteFoto: vi.fn(),
  linkPet: vi.fn(),
  unlinkPet: vi.fn(),
} as unknown as TutorApi);

describe('TutorFacade', () => {
  let facade: TutorFacade;
  let mockListTutoresUseCase: ListTutoresUseCase;
  let mockDeleteTutorUseCase: DeleteTutorUseCase;
  let mockRepository: ITutorRepository;
  let mockTutorApi: TutorApi;

  const mockTutores: TutorEntity[] = [
    {
      id: 1,
      nome: 'João',
      email: 'joao@email.com',
      telefone: '11999999999',
      endereco: 'Rua A',
      cpf: 12345678901,
    },
    {
      id: 2,
      nome: 'Maria',
      telefone: '11988888888',
      endereco: 'Rua B',
    },
  ];

  beforeEach(() => {
    mockRepository = {
      list: vi.fn(),
      delete: vi.fn(),
    };

    mockListTutoresUseCase = new ListTutoresUseCase(mockRepository);
    mockDeleteTutorUseCase = new DeleteTutorUseCase(mockRepository);
    mockTutorApi = createTutorApiMock();

    facade = new TutorFacade(
      mockListTutoresUseCase,
      mockDeleteTutorUseCase,
      mockTutorApi
    );
  });

  describe('tutores$', () => {
    it('deve emitir array vazio inicialmente', async () => {
      const tutores = await firstValueFrom(facade.tutores$);
      expect(tutores).toEqual([]);
    });

    it('deve emitir tutores após carregar com sucesso', async () => {
      vi.spyOn(mockRepository, 'list').mockResolvedValue({
        tutores: mockTutores,
        page: 1,
        size: 10,
        total: 2,
      });

      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const tutores = await firstValueFrom(facade.tutores$);
      expect(tutores).toEqual(mockTutores);
    });
  });

  describe('pagination$', () => {
    it('deve emitir estado inicial de paginação', async () => {
      const pagination = await firstValueFrom(facade.pagination$);
      expect(pagination).toEqual({
        page: 1,
        pageSize: 9,
        total: null,
      });
    });

    it('deve atualizar estado de paginação após carregar', async () => {
      vi.spyOn(mockRepository, 'list').mockResolvedValue({
        tutores: mockTutores,
        page: 2,
        size: 5,
        total: 20,
      });

      facade.load(2, 5, 'Maria');
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const pagination = await firstValueFrom(facade.pagination$);
      expect(pagination).toEqual({
        page: 2,
        pageSize: 5,
        total: 20,
      });
    });
  });

  describe('load', () => {
    it('deve chamar use case com query de busca', async () => {
      const listSpy = vi.spyOn(mockRepository, 'list').mockResolvedValue({
        tutores: mockTutores,
        page: 1,
        size: 10,
        total: 2,
      });

      facade.load(1, 10, 'João');
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      expect(listSpy).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        nome: 'João',
      });
    });
  });

  describe('deleteTutor', () => {
    it('deve remover tutor da lista e atualizar total', async () => {
      vi.spyOn(mockRepository, 'list').mockResolvedValue({
        tutores: mockTutores,
        page: 1,
        size: 10,
        total: 2,
      });

      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      vi.spyOn(mockRepository, 'delete').mockResolvedValue();

      await facade.deleteTutor(1);

      const tutores = await firstValueFrom(facade.tutores$);
      const pagination = await firstValueFrom(facade.pagination$);

      expect(tutores).toEqual([mockTutores[1]]);
      expect(pagination.total).toBe(1);
    });
  });

  describe('loadTutorDetail', () => {
    it('deve carregar detalhes do tutor', async () => {
      const tutorDetail = {
        ...mockTutores[0],
        pets: [
          {
            id: 1,
            nome: 'Rex',
          },
        ],
      };

      vi.spyOn(mockTutorApi, 'getTutorDetail').mockResolvedValue(tutorDetail);

      await facade.loadTutorDetail(1);

      const detail = await firstValueFrom(facade.tutorDetail$);
      expect(detail).toEqual(tutorDetail);
    });
  });

  describe('linkPets', () => {
    it('deve vincular pets e recarregar detalhes', async () => {
      vi.spyOn(mockTutorApi, 'linkPet').mockResolvedValue();
      const loadDetailSpy = vi.spyOn(facade, 'loadTutorDetail').mockResolvedValue();

      await facade.linkPets(1, [1, 2]);

      expect(mockTutorApi.linkPet).toHaveBeenCalledTimes(2);
      expect(loadDetailSpy).toHaveBeenCalledWith(1);
    });

    it('não deve chamar api quando lista de pets é vazia', async () => {
      const linkSpy = vi.spyOn(mockTutorApi, 'linkPet');

      await facade.linkPets(1, []);

      expect(linkSpy).not.toHaveBeenCalled();
    });
  });

  describe('unlinkPet', () => {
    it('deve desvincular pet e recarregar detalhes', async () => {
      vi.spyOn(mockTutorApi, 'unlinkPet').mockResolvedValue();
      const loadDetailSpy = vi.spyOn(facade, 'loadTutorDetail').mockResolvedValue();

      await facade.unlinkPet(1, 2);

      expect(mockTutorApi.unlinkPet).toHaveBeenCalledWith(1, 2);
      expect(loadDetailSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('error$', () => {
    it('deve emitir mensagem específica para erro 401', async () => {
      const httpError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      vi.spyOn(mockRepository, 'list').mockRejectedValue(httpError);

      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      const error = await firstValueFrom(facade.error$);
      expect(error).toBe('Sessão expirada. Faça login novamente.');
    });
  });

  describe('detailLoading$', () => {
    it('deve emitir true durante loadTutorDetail', async () => {
      let resolvePromise: (value: TutorEntity) => void;
      const promise = new Promise<TutorEntity>((resolve) => {
        resolvePromise = resolve;
      });

      vi.spyOn(mockTutorApi, 'getTutorDetail').mockReturnValue(promise);

      facade.loadTutorDetail(1);

      const loading = await firstValueFrom(facade.detailLoading$);
      expect(loading).toBe(true);

      resolvePromise!(mockTutores[0]);
    });
  });

  describe('loading$', () => {
    it('deve emitir false inicialmente', async () => {
      const loading = await firstValueFrom(facade.loading$);
      expect(loading).toBe(false);
    });

    it('deve emitir true durante load', async () => {
      let resolvePromise: (value: PaginatedTutoresEntity) => void;
      const promise = new Promise<PaginatedTutoresEntity>((resolve) => {
        resolvePromise = resolve;
      });

      vi.spyOn(mockRepository, 'list').mockReturnValue(promise);

      facade.load();
      const loading = await firstValueFrom(facade.loading$);
      expect(loading).toBe(true);

      resolvePromise!({
        tutores: [],
        page: 1,
        size: 10,
        total: 0,
      });
    });
  });
});
