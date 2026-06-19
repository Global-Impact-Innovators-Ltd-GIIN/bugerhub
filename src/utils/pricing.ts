export const formatRWF = (usdAmount: number): string => {
  return `${Math.round(usdAmount * 1300).toLocaleString()} RWF`;
};
