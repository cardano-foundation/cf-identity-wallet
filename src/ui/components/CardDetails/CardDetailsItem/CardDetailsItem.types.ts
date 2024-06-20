export interface CardDetailsItemProps {
  info: string;
  copyButton?: boolean;
  icon?: string;
  keyValue?: string;
  textIcon?: string;
  testId?: string;
  infoTestId?: string;
  className?: string;
  mask?: boolean;
  fullText?: boolean;
  actionIcon?: string;
  actionIconClick?: () => void;
}
