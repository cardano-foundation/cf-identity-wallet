import { Component, ErrorInfo } from "react";
import { CommonErrorAlert } from "./CommonErrorAlert";
import { ErrorBoundaryProps, ErrorBoundaryState } from "./Error.types";

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error, errorInfo);
  }

  setAlertIsOpen = (value: boolean) => {
    this.setState({
      hasError: value,
    });
  };

  closeAlert = () => {
    this.setState({
      hasError: false,
    });
  };

  public render() {
    return (
      <>
        {this.props.children}
        <CommonErrorAlert
          isOpen={this.state.hasError}
          setIsOpen={this.setAlertIsOpen}
          actionConfirm={this.closeAlert}
        />
      </>
    );
  }
}

export { ErrorBoundary };
