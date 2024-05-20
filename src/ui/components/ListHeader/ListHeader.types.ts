interface ListHeaderProps {
  title: string;
  activeActionIndex?: number;
  hasAction?: boolean;
  firstIcon?: string;
  onFirstIconClick?: () => void;
  secondIcon?: string;
  onSecondIconClick?: () => void;
}

export type { ListHeaderProps };
