import { ReactNode } from "react";

interface ErrorMessageProps {
  message: string | undefined;
  timeout?: boolean;
  action?: ReactNode;
}

export type { ErrorMessageProps };
