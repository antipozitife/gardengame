import { FLOWERS, getFlowerById } from './flowers';

describe('flowers data', () => {
  it('contains five unique flowers', () => {
    expect(FLOWERS).toHaveLength(5);
    expect(new Set(FLOWERS.map((flower) => flower.id)).size).toBe(5);
  });

  it('returns flower by id', () => {
    const astra = getFlowerById(1);
    expect(astra).toBeDefined();
    expect(astra?.name).toBe('Астра');
    expect(astra?.price).toBe(10);
  });

  it('returns undefined for unknown id', () => {
    expect(getFlowerById(999)).toBeUndefined();
  });
});
