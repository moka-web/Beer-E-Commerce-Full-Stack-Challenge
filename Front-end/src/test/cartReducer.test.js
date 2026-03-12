import { describe, it, expect } from 'vitest';

// Inline reducer copy to test pure logic without importing context
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((i) => i.sku === action.payload.sku);
      if (existing) {
        return state.map((i) =>
          i.sku === action.payload.sku ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter((i) => i.sku !== action.payload.sku);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

const mockItem = { sku: '10167', name: '12 - 24oz Cans', brand: 'Modelo Especial', price: 2865 };
const mockItem2 = { sku: '10035', name: '24 - 12oz Bottles', brand: 'Miller Lite', price: 2940 };

describe('cartReducer', () => {
  describe('ADD_ITEM', () => {
    it('agrega un item nuevo al carrito', () => {
      const state = cartReducer([], { type: 'ADD_ITEM', payload: mockItem });
      expect(state).toHaveLength(1);
      expect(state[0].sku).toBe('10167');
      expect(state[0].quantity).toBe(1);
    });

    it('incrementa la cantidad si el SKU ya existe', () => {
      const initial = [{ ...mockItem, quantity: 1 }];
      const state = cartReducer(initial, { type: 'ADD_ITEM', payload: mockItem });
      expect(state).toHaveLength(1);
      expect(state[0].quantity).toBe(2);
    });

    it('no afecta otros items al agregar uno nuevo', () => {
      const initial = [{ ...mockItem, quantity: 1 }];
      const state = cartReducer(initial, { type: 'ADD_ITEM', payload: mockItem2 });
      expect(state).toHaveLength(2);
      expect(state[0].quantity).toBe(1);
    });
  });

  describe('REMOVE_ITEM', () => {
    it('elimina el item con el SKU indicado', () => {
      const initial = [{ ...mockItem, quantity: 1 }, { ...mockItem2, quantity: 1 }];
      const state = cartReducer(initial, { type: 'REMOVE_ITEM', payload: { sku: '10167' } });
      expect(state).toHaveLength(1);
      expect(state[0].sku).toBe('10035');
    });

    it('no modifica el carrito si el SKU no existe', () => {
      const initial = [{ ...mockItem, quantity: 1 }];
      const state = cartReducer(initial, { type: 'REMOVE_ITEM', payload: { sku: 'INEXISTENTE' } });
      expect(state).toHaveLength(1);
    });
  });

  describe('CLEAR_CART', () => {
    it('vacía el carrito completamente', () => {
      const initial = [{ ...mockItem, quantity: 2 }, { ...mockItem2, quantity: 1 }];
      const state = cartReducer(initial, { type: 'CLEAR_CART' });
      expect(state).toHaveLength(0);
    });
  });

  describe('acción desconocida', () => {
    it('retorna el estado sin cambios', () => {
      const initial = [{ ...mockItem, quantity: 1 }];
      const state = cartReducer(initial, { type: 'UNKNOWN' });
      expect(state).toEqual(initial);
    });
  });
});
