import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage/LoginPage';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/api';

function renderLoginPage(authValue) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<div>Products Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const defaultAuth = {
  isAuthenticated: false,
  login: vi.fn(),
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario correctamente', () => {
    renderLoginPage(defaultAuth);
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('muestra las credenciales de demo', () => {
    renderLoginPage(defaultAuth);
    expect(screen.getByText('admin@beer.com')).toBeTruthy();
    expect(screen.getByText('admin123')).toBeTruthy();
  });

  it('redirige a /products si ya está autenticado', async () => {
    renderLoginPage({ ...defaultAuth, isAuthenticated: true });
    await waitFor(() => expect(screen.getByText('Products Page')).toBeTruthy());
  });

  it('llama a login y redirige tras un submit exitoso', async () => {
    vi.spyOn(api, 'authLogin').mockResolvedValue({
      token: 'fake-token',
      user: { id: 1, email: 'admin@beer.com' },
    });

    renderLoginPage(defaultAuth);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@beer.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(api.authLogin).toHaveBeenCalledWith('admin@beer.com', 'admin123');
      expect(defaultAuth.login).toHaveBeenCalledWith('fake-token', { id: 1, email: 'admin@beer.com' });
    });
  });

  it('muestra alert si el login falla', async () => {
    vi.spyOn(api, 'authLogin').mockRejectedValue(new Error('Invalid credentials'));
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderLoginPage(defaultAuth);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@beer.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('deshabilita el botón mientras carga', async () => {
    vi.spyOn(api, 'authLogin').mockImplementation(() => new Promise(() => {})); // never resolves

    renderLoginPage(defaultAuth);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@beer.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Signing in...' }).disabled).toBe(true);
    });
  });
});
