export interface CardDetailsItemProps {
  info: string;
  copyButton?: boolean;
  icon?: string;
  keyValue?: string;
  testId?: string;
  infoTestId?: string;
  className?: string;
  mask?: boolean;
  fullText?: boolean;
  actionButton?: string;
  actionButtonClick?: () => void;
}
