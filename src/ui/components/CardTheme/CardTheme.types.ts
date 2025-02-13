interface CardThemeBaseProps {
  className?: string;
}

interface CardThemeProps extends CardThemeBaseProps {
  layout?: number;
  color?: number;
}

export type { CardThemeBaseProps, CardThemeProps };
