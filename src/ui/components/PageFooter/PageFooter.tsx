import { IonButton, IonToolbar } from "@ionic/react";
import { PageFooterProps } from "./PageFooter.types";

const PageFooter = ({
  pageId,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonDisabled,
  secondaryButtonText,
  secondaryButtonAction,
  secondaryButtonDisabled,
  tertiaryButtonText,
  tertiaryButtonAction,
  tertiaryButtonDisabled,
}: PageFooterProps) => {
  return (
    <IonToolbar
      color="light"
      className="page-footer"
    >
      {primaryButtonText && primaryButtonAction && (
        <IonButton
          shape="round"
          expand="block"
          className="primary-button"
          data-testid={`primary-button${pageId ? `-${pageId}` : ""}`}
          onClick={primaryButtonAction}
          disabled={primaryButtonDisabled}
        >
          {primaryButtonText}
        </IonButton>
      )}
      {secondaryButtonText && secondaryButtonAction && (
        <IonButton
          shape="round"
          expand="block"
          fill="outline"
          className="secondary-button"
          data-testid={`secondary-button${pageId ? `-${pageId}` : ""}`}
          onClick={secondaryButtonAction}
          disabled={secondaryButtonDisabled}
        >
          {secondaryButtonText}
        </IonButton>
      )}
      {tertiaryButtonText && tertiaryButtonAction && (
        <IonButton
          shape="round"
          expand="block"
          fill="clear"
          className="tertiary-button"
          data-testid={`tertiary-button${pageId ? `-${pageId}` : ""}`}
          onClick={tertiaryButtonAction}
          disabled={tertiaryButtonDisabled}
        >
          {tertiaryButtonText}
        </IonButton>
      )}
    </IonToolbar>
  );
};

export default PageFooter;
