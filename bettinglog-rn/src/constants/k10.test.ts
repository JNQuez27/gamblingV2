import { K10_ITEMS, K10_MIN, K10_MAX, k10Band } from '@/constants/k10';

describe('K10', () => {
  it('is the standard 10-item scale scored 10-50', () => {
    expect(K10_ITEMS).toHaveLength(10);
    expect(K10_MIN).toBe(10); // all-1s
    expect(K10_MAX).toBe(50); // all-5s
  });

  it('bands the total by the standard cut-offs', () => {
    expect(k10Band(10)).toBe('well');
    expect(k10Band(22)).toBe('mild');
    expect(k10Band(27)).toBe('moderate');
    expect(k10Band(35)).toBe('severe');
  });

  it('respects the boundary values', () => {
    expect(k10Band(19)).toBe('well');
    expect(k10Band(20)).toBe('mild');
    expect(k10Band(25)).toBe('moderate');
    expect(k10Band(30)).toBe('severe');
  });
});
