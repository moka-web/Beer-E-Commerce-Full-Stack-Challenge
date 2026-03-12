import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../hooks/useForm';

const initialValues = { email: '', password: '' };

describe('useForm', () => {
  it('inicializa con los valores provistos', () => {
    const { result } = renderHook(() => useForm(initialValues, vi.fn()));
    expect(result.current.values).toEqual({ email: '', password: '' });
    expect(result.current.loading).toBe(false);
  });

  it('actualiza el campo correcto al llamar handleChange', () => {
    const { result } = renderHook(() => useForm(initialValues, vi.fn()));
    act(() => {
      result.current.handleChange({ target: { name: 'email', value: 'test@beer.com' } });
    });
    expect(result.current.values.email).toBe('test@beer.com');
    expect(result.current.values.password).toBe('');
  });

  it('reset vuelve a los valores iniciales', () => {
    const { result } = renderHook(() => useForm(initialValues, vi.fn()));
    act(() => {
      result.current.handleChange({ target: { name: 'email', value: 'test@beer.com' } });
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.values).toEqual(initialValues);
  });

  it('llama a onSubmit con los valores actuales', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const { result } = renderHook(() => useForm(initialValues, onSubmit));

    act(() => {
      result.current.handleChange({ target: { name: 'email', value: 'admin@beer.com' } });
      result.current.handleChange({ target: { name: 'password', value: 'admin123' } });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(onSubmit).toHaveBeenCalledWith({ email: 'admin@beer.com', password: 'admin123' });
  });

  it('muestra alert y no lanza error si onSubmit falla', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useForm(initialValues, onSubmit));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(alertMock).toHaveBeenCalledWith('Invalid credentials');
  });

  it('loading es true durante el submit y false al terminar', async () => {
    let resolve;
    const onSubmit = vi.fn(() => new Promise((r) => { resolve = r; }));
    const { result } = renderHook(() => useForm(initialValues, onSubmit));

    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.loading).toBe(true);

    await act(async () => { resolve(); });
    expect(result.current.loading).toBe(false);
  });
});
