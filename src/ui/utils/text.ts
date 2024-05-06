const ellipsisBetweenText = (text: string) => {
  if (text.length < 10) return text;

  const firstPart = text.slice(0, 5);
  const lastPart = text.slice(text.length - 5, text.length);

  return `${firstPart}...${lastPart}`;
};

export { ellipsisBetweenText };
