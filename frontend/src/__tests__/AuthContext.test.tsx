import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';

const mockUser = { _id: '1', name: 'Test User', email: 'test@test.com', role: 'client' };

vi.mock('@/services/auth.service', () => ({
  authService: {
    me: vi.fn().mockRejectedValue(new Error('unauthenticated')),
    login: vi.fn().mockResolvedValue(mockUser),
    logout: vi.fn().mockResolvedValue(undefined),
    registerClient: vi.fn(),
    registerProvider: vi.fn(),
  },
}));

function TestConsumer() {
  const auth = useContext(AuthContext);
  if (!auth) return null;
  return (
    <div>
      <span data-testid="user">{auth.user?.name ?? 'nenhum'}</span>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <button onClick={() => auth.login('test@test.com', 'pass')}>Login</button>
      <button onClick={auth.logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicia sem usuário quando /auth/me retorna 401', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('nenhum');
  });

  it('seta usuário após login bem-sucedido', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    await userEvent.click(screen.getByText('Login'));
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Test User'));
  });

  it('limpa usuário após logout', async () => {
    const { authService } = await import('@/services/auth.service');
    (authService.me as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockUser);

    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Test User'));
    await userEvent.click(screen.getByText('Logout'));
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('nenhum'));
  });
});
