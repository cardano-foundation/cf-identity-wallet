export const shuffle = (array: any[]) => {
  const cp = [...array];
  return cp.sort(() => Math.random() - 0.5);
};

export const equals = (a: any[], b: any[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);
