interface IdentityThemeSelectorProps {
  identityType: number;
  selectedTheme: number;
  setSelectedTheme: (value: number) => void;
}

interface ThemeItemProps {
  index: number;
}

export type { IdentityThemeSelectorProps, ThemeItemProps };
