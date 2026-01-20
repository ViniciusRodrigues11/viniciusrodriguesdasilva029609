import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { TutorFacade } from './tutor.facade';
import { ListTutoresUseCase } from '../use-cases/list-tutores.use-case';
import { DeleteTutorUseCase } from '../use-cases/delete-tutor.use-case';
import type { ITutorRepository } from '../../domain/repositories/tutor.repository';
import type { TutorEntity } from '../../domain/entities/tutor.entity';
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

      vi.spyOn(mockRepository, 'delete').mockResolvedValue(undefined);

      await facade.deleteTutor(1);

      const tutores = await firstValueFrom(facade.tutores$);
      const pagination = await firstValueFrom(facade.pagination$);

      expect(tutores).toEqual([mockTutores[1]]);
      expect(pagination.total).toBe(1);
    });

    it('não deve atualizar total quando total é null', async () => {
      vi.spyOn(mockRepository, 'list').mockResolvedValue({
        tutores: mockTutores,
        page: 1,
        size: 10,
        total: null,
      });

      facade.load();
      await vi.waitFor(async () => {
        const loading = await firstValueFrom(facade.loading$);
        expect(loading).toBe(false);
      });

      vi.spyOn(mockRepository, 'delete').mockResolvedValue(undefined);

      await facade.deleteTutor(1);

      const pagination = await firstValueFrom(facade.pagination$);
      expect(pagination.total).toBeNull();
    });

    it('deve propagar erro e atualizar error$', async () => {
      const httpError = {
        response: {
          status: 500,
          data: { message: 'Falha ao deletar' },
        },
      };

      vi.spyOn(mockRepository, 'delete').mockRejectedValue(httpError);

      await expect(facade.deleteTutor(1)).rejects.toEqual(httpError);

      const error = await firstValueFrom(facade.error$);
      expect(error).toBe('Falha ao deletar');
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

    it('deve limpar detalhes quando há erro', async () => {
      const httpError = {
        response: {
          status: 500,
          data: { message: 'Erro ao carregar' },
        },
      };

      vi.spyOn(mockTutorApi, 'getTutorDetail').mockRejectedValue(httpError);

      await expect(facade.loadTutorDetail(1)).rejects.toEqual(httpError);

      const detail = await firstValueFrom(facade.tutorDetail$);
      const error = await firstValueFrom(facade.error$);

      expect(detail).toBeNull();
      expect(error).toBe('Erro ao carregar');
    });
  });

  describe('addTutor', () => {
    it('deve criar tutor com sucesso', async () => {
      const payload = {
        nome: 'Carlos',
        email: 'carlos@email.com',
        telefone: '11999999900',
        endereco: 'Rua C',
        cpf: 12345678909,
      };
      vi.spyOn(mockTutorApi, 'createTutor').mockResolvedValue({
        id: 3,
        ...payload,
      });

      const created = await facade.addTutor(payload);

      expect(created).toEqual({ id: 3, ...payload });
    });

    it('deve atualizar error$ quando falha ao criar tutor', async () => {
      const error = new Error('Falha ao criar');
      vi.spyOn(mockTutorApi, 'createTutor').mockRejectedValue(error);

      await expect(
        facade.addTutor({
          nome: 'Carlos',
          email: 'carlos@email.com',
          telefone: '11999999900',
          endereco: 'Rua C',
          cpf: 12345678909,
        })
      ).rejects.toThrow('Falha ao criar');

      const message = await firstValueFrom(facade.error$);
      expect(message).toBe('Falha ao criar');
    });
  });

  describe('updateTutor', () => {
    it('deve atualizar tutor com sucesso', async () => {
      const payload = {
        nome: 'Carlos Atualizado',
        email: 'carlos@email.com',
        telefone: '11999999900',
        endereco: 'Rua D',
        cpf: 12345678909,
      };

      vi.spyOn(mockTutorApi, 'updateTutor').mockResolvedValue({
        id: 3,
        ...payload,
      });

      const updated = await facade.updateTutor(3, payload);

      expect(updated).toEqual({ id: 3, ...payload });
    });

    it('deve definir mensagem genérica quando erro não é Error', async () => {
      vi.spyOn(mockTutorApi, 'updateTutor').mockRejectedValue('fail');

      await expect(
        facade.updateTutor(3, {
          nome: 'Carlos',
          email: 'carlos@email.com',
          telefone: '11999999900',
          endereco: 'Rua C',
          cpf: 12345678909,
        })
      ).rejects.toBe('fail');

      const message = await firstValueFrom(facade.error$);
      expect(message).toBe('Erro ao atualizar tutor');
    });
  });

  describe('linkPets', () => {
    it('deve vincular pets e recarregar detalhes', async () => {
      vi.spyOn(mockTutorApi, 'linkPet').mockResolvedValue(undefined);
      const loadDetailSpy = vi.spyOn(facade, 'loadTutorDetail').mockResolvedValue(undefined);

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
      vi.spyOn(mockTutorApi, 'unlinkPet').mockResolvedValue(undefined);
      const loadDetailSpy = vi.spyOn(facade, 'loadTutorDetail').mockResolvedValue(undefined);

      await facade.unlinkPet(1, 2);

      expect(mockTutorApi.unlinkPet).toHaveBeenCalledWith(1, 2);
      expect(loadDetailSpy).toHaveBeenCalledWith(1);
    });

    it('deve atualizar error$ quando falha', async () => {
      const httpError = {
        response: {
          status: 404,
          data: { message: 'Pet não encontrado' },
        },
      };

      vi.spyOn(mockTutorApi, 'unlinkPet').mockRejectedValue(httpError);

      await expect(facade.unlinkPet(1, 2)).rejects.toEqual(httpError);

      const error = await firstValueFrom(facade.error$);
      expect(error).toBe('Pet não encontrado');
    });
  });

  describe('uploadFoto', () => {
    it('deve chamar uploadFoto na API', async () => {
      const file = { name: 'foto.png', type: 'image/png' } as File;
      vi.spyOn(mockTutorApi, 'uploadFoto').mockResolvedValue({ id: 1 });

      await facade.uploadFoto(1, file);

      expect(mockTutorApi.uploadFoto).toHaveBeenCalledWith(1, file);
    });

    it('deve atualizar error$ quando falha', async () => {
      const file = { name: 'foto.png', type: 'image/png' } as File;
      vi.spyOn(mockTutorApi, 'uploadFoto').mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Falha ao enviar foto' },
        },
      });

      await expect(facade.uploadFoto(1, file)).rejects.toBeDefined();

      const error = await firstValueFrom(facade.error$);
      expect(error).toBe('Falha ao enviar foto');
    });
  });

  describe('deleteFoto', () => {
    it('deve chamar deleteFoto na API', async () => {
      vi.spyOn(mockTutorApi, 'deleteFoto').mockResolvedValue(undefined);

      await facade.deleteFoto(1, 9);

      expect(mockTutorApi.deleteFoto).toHaveBeenCalledWith(1, 9);
    });

    it('deve atualizar error$ quando falha', async () => {
      vi.spyOn(mockTutorApi, 'deleteFoto').mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Falha ao excluir foto' },
        },
      });

      await expect(facade.deleteFoto(1, 9)).rejects.toBeDefined();

      const error = await firstValueFrom(facade.error$);
      expect(error).toBe('Falha ao excluir foto');
    });
  });
});
