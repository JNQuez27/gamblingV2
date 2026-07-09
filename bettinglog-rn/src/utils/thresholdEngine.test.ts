import { averageOpensPerDay, classifyUsage } from './thresholdEngine';

describe('thresholdEngine', () => {
  it('averages opens over days', () => {
    expect(averageOpensPerDay(14, 7)).toBe(2);
    expect(averageOpensPerDay(10, 0)).toBe(0); // no divide-by-zero
  });

  it('classifies each band by default cut-offs', () => {
    expect(classifyUsage(0.5)).toBe('controlled');
    expect(classifyUsage(3)).toBe('elevated');
    expect(classifyUsage(6)).toBe('high');
    expect(classifyUsage(12)).toBe('severe');
  });

  it('respects the boundary values', () => {
    expect(classifyUsage(2)).toBe('elevated');
    expect(classifyUsage(5)).toBe('high');
    expect(classifyUsage(10)).toBe('severe');
  });
});
