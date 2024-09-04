import { ReactNode } from "react";
import { AlertProps } from "../Alert/Alert.types";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

type CommonErrorAlertProps = Pick<
  AlertProps,
  "isOpen" | "setIsOpen" | "actionConfirm"
>;

export type { ErrorBoundaryProps, ErrorBoundaryState, CommonErrorAlertProps };
