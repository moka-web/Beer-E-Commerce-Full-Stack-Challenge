import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authLogin } from '../../services/api';
import { useForm } from '../../hooks/useForm';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/products', { replace: true });
  }, [isAuthenticated, navigate]);

  const { values, handleChange, handleSubmit, loading } = useForm(
    { email: '', password: '' },
    async ({ email, password }) => {
      const data = await authLogin(email, password);
      login(data.token, data.user);
      navigate('/products', { replace: true });
    }
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              placeholder="••••••"
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </p>

        <p className="auth-demo">
          User: <strong>admin@beer.com</strong><br />
          Password: <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
