export const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

export const stateByGlucose = (g: number): 'low' | 'high' | 'normal' => {
  if (g < 4) return 'low';
  if (g > 8) return 'high';
  return 'normal';
};

export const calculateGrade = (points: number): number => {
  if (points === 0) return 0;
  const base = Math.round((points / 67) * 100);
  return clamp(base, 0, 100);
};

export const getGradeText = (grade: number): string => {
  if (grade >= 85) return 'Отлично';
  if (grade >= 65) return 'Хорошо';
  return 'Нужно потренироваться';
};