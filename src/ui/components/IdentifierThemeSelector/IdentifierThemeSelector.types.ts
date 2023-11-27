interface IdentifierThemeSelectorProps {
  identifierType: number;
  selectedTheme: number;
  setSelectedTheme: (value: number) => void;
}

interface ThemeItemProps {
  index: number;
}

export type { IdentifierThemeSelectorProps, ThemeItemProps };
