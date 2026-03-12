import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useStockPrice } from '../hooks/useStockPrice';
import * as api from '../services/api';

const mockToken = 'fake-token';
const mockSku = '10167';
const mockData = { price: 2865, stock: 130 };

// Flushes pending promises without advancing fake timers
async function flushPromises() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

describe('useStockPrice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(api, 'getStockPrice').mockResolvedValue(mockData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('inicia con loading true y price/stock null', () => {
    const { result } = renderHook(() => useStockPrice(mockSku, mockToken));
    expect(result.current.loading).toBe(true);
    expect(result.current.price).toBeNull();
    expect(result.current.stock).toBeNull();
  });

  it('actualiza price y stock tras el fetch inicial', async () => {
    const { result } = renderHook(() => useStockPrice(mockSku, mockToken));
    await flushPromises();
    expect(result.current.loading).toBe(false);
    expect(result.current.price).toBe(2865);
    expect(result.current.stock).toBe(130);
    expect(api.getStockPrice).toHaveBeenCalledWith(mockSku, mockToken);
  });

  it('no hace fetch si sku es null', async () => {
    renderHook(() => useStockPrice(null, mockToken));
    await flushPromises();
    expect(api.getStockPrice).not.toHaveBeenCalled();
  });

  it('no hace fetch si token es null', async () => {
    renderHook(() => useStockPrice(mockSku, null));
    await flushPromises();
    expect(api.getStockPrice).not.toHaveBeenCalled();
  });

  it('llama a getStockPrice de nuevo cada 5 segundos', async () => {
    renderHook(() => useStockPrice(mockSku, mockToken));
    await flushPromises();
    expect(api.getStockPrice).toHaveBeenCalledTimes(1);

    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(api.getStockPrice).toHaveBeenCalledTimes(2);

    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(api.getStockPrice).toHaveBeenCalledTimes(3);
  });

  it('limpia el interval al desmontar', async () => {
    const { unmount } = renderHook(() => useStockPrice(mockSku, mockToken));
    await flushPromises();
    expect(api.getStockPrice).toHaveBeenCalledTimes(1);

    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(api.getStockPrice).toHaveBeenCalledTimes(1);
  });

  it('re-fetcha cuando cambia el SKU', async () => {
    let sku = mockSku;
    const { rerender } = renderHook(() => useStockPrice(sku, mockToken));
    await flushPromises();
    expect(api.getStockPrice).toHaveBeenCalledWith(mockSku, mockToken);

    sku = '10035';
    rerender();
    await flushPromises();
    expect(api.getStockPrice).toHaveBeenCalledWith('10035', mockToken);
  });

  it('setea loading false si el fetch falla', async () => {
    vi.spyOn(api, 'getStockPrice').mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useStockPrice(mockSku, mockToken));
    await flushPromises();
    expect(result.current.loading).toBe(false);
    expect(result.current.price).toBeNull();
    expect(result.current.stock).toBeNull();
  });

  it('no actualiza el estado si el componente se desmontó antes de resolver', async () => {
    let resolvePromise;
    vi.spyOn(api, 'getStockPrice').mockReturnValue(
      new Promise((r) => { resolvePromise = r; })
    );

    const { result, unmount } = renderHook(() => useStockPrice(mockSku, mockToken));
    unmount();

    await act(async () => { resolvePromise(mockData); });

    expect(result.current.price).toBeNull();
    expect(result.current.stock).toBeNull();
  });
});
