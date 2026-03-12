import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock stockStore before importing the controller
jest.unstable_mockModule('../data/stockStore.js', () => ({
  getEntry: jest.fn(),
  decrementStock: jest.fn(),
}));

const { checkout } = await import('../controllers/checkoutController.js');
const { getEntry, decrementStock } = await import('../data/stockStore.js');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('checkout', () => {
  it('returns 400 when items is missing', () => {
    const req = { body: {} };
    const res = mockRes();
    checkout(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cart is empty' });
  });

  it('returns 400 when items array is empty', () => {
    const req = { body: { items: [] } };
    const res = mockRes();
    checkout(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cart is empty' });
  });

  it('returns 404 when a SKU is not found', () => {
    getEntry.mockReturnValue(null);
    const req = { body: { items: [{ sku: '99999', name: 'Ghost Beer', quantity: 1 }] } };
    const res = mockRes();
    checkout(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'SKU 99999 not found' });
    expect(decrementStock).not.toHaveBeenCalled();
  });

  it('returns 409 when stock is insufficient', () => {
    getEntry.mockReturnValue({ stock: 2, price: 1000 });
    const req = {
      body: { items: [{ sku: '10167', name: 'Big Pack', quantity: 5 }] },
    };
    const res = mockRes();
    checkout(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Not enough stock for "Big Pack". Available: 2, requested: 5',
    });
    expect(decrementStock).not.toHaveBeenCalled();
  });

  it('returns 200 and decrements stock when all items pass validation', () => {
    getEntry.mockReturnValue({ stock: 10, price: 1000 });
    const req = {
      body: {
        items: [
          { sku: '10167', name: 'Beer A', quantity: 2 },
          { sku: '10166', name: 'Beer B', quantity: 3 },
        ],
      },
    };
    const res = mockRes();
    checkout(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Order placed successfully' });
    expect(decrementStock).toHaveBeenCalledTimes(2);
    expect(decrementStock).toHaveBeenCalledWith('10167', 2);
    expect(decrementStock).toHaveBeenCalledWith('10166', 3);
  });

  it('does not decrement any stock if the second item fails validation', () => {
    // First SKU has stock, second does not
    getEntry
      .mockReturnValueOnce({ stock: 10, price: 1000 }) // first item passes
      .mockReturnValueOnce({ stock: 1, price: 2000 }); // second item fails

    const req = {
      body: {
        items: [
          { sku: '10167', name: 'Beer A', quantity: 2 },
          { sku: '10166', name: 'Beer B', quantity: 5 },
        ],
      },
    };
    const res = mockRes();
    checkout(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(decrementStock).not.toHaveBeenCalled();
  });

  it('does not decrement any stock if a SKU is not found mid-cart', () => {
    getEntry
      .mockReturnValueOnce({ stock: 10, price: 1000 }) // first passes
      .mockReturnValueOnce(null);                       // second not found

    const req = {
      body: {
        items: [
          { sku: '10167', name: 'Beer A', quantity: 1 },
          { sku: 'GHOST', name: 'Ghost Beer', quantity: 1 },
        ],
      },
    };
    const res = mockRes();
    checkout(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(decrementStock).not.toHaveBeenCalled();
  });
});
