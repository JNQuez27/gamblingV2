export function getPos(level: number): 'left' | 'center' | 'right' {
  const mod = (level - 1) % 4;
  if (mod === 0) return 'left';
  if (mod === 1) return 'center';
  if (mod === 2) return 'right';
  return 'center';
}

export function dateForLevel(level: number, currentLevel: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (currentLevel - level));
  return d.toISOString().split('T')[0];
}
