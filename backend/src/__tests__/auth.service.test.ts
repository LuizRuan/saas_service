import { authService } from '../services/auth.service';
import { ConflictError, UnauthorizedError } from '../utils/errors';

describe('AuthService', () => {
  const clientData = {
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'senha123',
    city: 'São Paulo',
    state: 'SP',
  };

  describe('registerClient', () => {
    it('cria usuário e retorna token', async () => {
      const result = await authService.registerClient(clientData);
      expect(result.user.email).toBe(clientData.email);
      expect(result.user.role).toBe('client');
      expect(result.token).toBeTruthy();
    });

    it('lança ConflictError para email duplicado', async () => {
      await authService.registerClient(clientData);
      await expect(authService.registerClient(clientData)).rejects.toThrow(ConflictError);
    });

    it('lança erro para senha curta', async () => {
      await expect(
        authService.registerClient({ ...clientData, email: 'outro@test.com', password: '123' })
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.registerClient(clientData);
    });

    it('retorna token com credenciais corretas', async () => {
      const result = await authService.login({ email: clientData.email, password: clientData.password });
      expect(result.token).toBeTruthy();
      expect(result.user.email).toBe(clientData.email);
    });

    it('lança UnauthorizedError para senha errada', async () => {
      await expect(
        authService.login({ email: clientData.email, password: 'errada' })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('lança UnauthorizedError para email inexistente', async () => {
      await expect(
        authService.login({ email: 'naoexiste@test.com', password: 'qualquer' })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('updateMe', () => {
    it('atualiza nome e telefone do usuário', async () => {
      const { user } = await authService.registerClient(clientData);
      const updated = await authService.updateMe(user._id.toString(), { name: 'João Atualizado', phone: '11999999999' });
      expect(updated.name).toBe('João Atualizado');
      expect(updated.phone).toBe('11999999999');
    });
  });
});
