import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';

vi.mock('@/services/auth.service', () => ({
  authService: {
    me: vi.fn().mockResolvedValue({ _id: '1', name: 'Test User', email: 'test@test.com', role: 'client' }),
    login: vi.fn().mockResolvedValue({
      token: 'fake-token',
      user: { _id: '1', name: 'Test User', email: 'test@test.com', role: 'client' },
    }),
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
    localStorage.clear();
  });

  it('inicia sem usuário quando não há token salvo', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('nenhum');
  });

  it('persiste auth após login', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    await userEvent.click(screen.getByText('Login'));
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Test User'));
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('limpa auth após logout', async () => {
    localStorage.setItem('token', 'fake-token');
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    await userEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('user').textContent).toBe('nenhum');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
