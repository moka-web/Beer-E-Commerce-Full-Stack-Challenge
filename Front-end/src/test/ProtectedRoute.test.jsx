import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

// Helper to render with a controlled AuthContext value
function renderWithAuth(isAuthenticated, ui) {
  return render(
    <AuthContext.Provider value={{ isAuthenticated }}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/protected" element={ui} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  it('renderiza el contenido si el usuario está autenticado', () => {
    renderWithAuth(true, <ProtectedRoute><div>Contenido protegido</div></ProtectedRoute>);
    expect(screen.getByText('Contenido protegido')).toBeTruthy();
  });

  it('redirige a /login si el usuario no está autenticado', () => {
    renderWithAuth(false, <ProtectedRoute><div>Contenido protegido</div></ProtectedRoute>);
    expect(screen.queryByText('Contenido protegido')).toBeNull();
    expect(screen.getByText('Login Page')).toBeTruthy();
  });
});
