enum IdentifierColor {
  Green,
  Dark,
  Brown,
  Primary,
  Secondary,
}

interface IdentifierColorSelectorProps {
  value: IdentifierColor;
  onColorChange: (color: IdentifierColor) => void;
}

export type { IdentifierColorSelectorProps };
export { IdentifierColor };
