import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorage', () => {
  describe('inicialización', () => {
    it('retorna el initialValue si la key no existe', () => {
      const { result } = renderHook(() => useLocalStorage('test', 'default'));
      expect(result.current[0]).toBe('default');
    });

    it('hidrata el valor desde localStorage si la key existe', () => {
      localStorage.setItem('test', JSON.stringify('stored-value'));
      const { result } = renderHook(() => useLocalStorage('test', 'default'));
      expect(result.current[0]).toBe('stored-value');
    });

    it('funciona con valores de tipo objeto', () => {
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'a@b.com' }));
      const { result } = renderHook(() => useLocalStorage('user', null));
      expect(result.current[0]).toEqual({ id: 1, email: 'a@b.com' });
    });

    it('retorna initialValue si el JSON almacenado es inválido', () => {
      localStorage.setItem('test', 'not-valid-json{{{');
      const { result } = renderHook(() => useLocalStorage('test', 'fallback'));
      expect(result.current[0]).toBe('fallback');
    });
  });

  describe('set', () => {
    it('actualiza el valor en estado y en localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test', ''));
      act(() => result.current[1]('nuevo'));
      expect(result.current[0]).toBe('nuevo');
      expect(JSON.parse(localStorage.getItem('test'))).toBe('nuevo');
    });

    it('acepta una updater function (patrón funcional)', () => {
      localStorage.setItem('count', JSON.stringify(1));
      const { result } = renderHook(() => useLocalStorage('count', 0));
      act(() => result.current[1]((prev) => prev + 1));
      expect(result.current[0]).toBe(2);
      expect(JSON.parse(localStorage.getItem('count'))).toBe(2);
    });

    it('elimina la key de localStorage al setear null', () => {
      localStorage.setItem('token', JSON.stringify('abc123'));
      const { result } = renderHook(() => useLocalStorage('token', null));
      act(() => result.current[1](null));
      expect(result.current[0]).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('elimina la key de localStorage al setear undefined', () => {
      localStorage.setItem('token', JSON.stringify('abc123'));
      const { result } = renderHook(() => useLocalStorage('token', null));
      act(() => result.current[1](undefined));
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('persiste arrays correctamente', () => {
      const { result } = renderHook(() => useLocalStorage('cart', []));
      act(() => result.current[1]([{ sku: '123', quantity: 2 }]));
      expect(result.current[0]).toEqual([{ sku: '123', quantity: 2 }]);
      expect(JSON.parse(localStorage.getItem('cart'))).toEqual([{ sku: '123', quantity: 2 }]);
    });
  });
});
