import { IonButton, IonIcon, IonToolbar } from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { PageFooterProps } from "./PageFooter.types";
import "./PageFooter.scss";

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
  deleteButtonText,
  deleteButtonAction,
  deleteButtonDisabled,
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
      {deleteButtonText && deleteButtonAction && (
        <IonButton
          shape="round"
          expand="block"
          fill="clear"
          className="delete-button"
          data-testid={`delete-button${pageId ? `-${pageId}` : ""}`}
          onClick={deleteButtonAction}
          disabled={deleteButtonDisabled}
        >
          <IonIcon
            slot="icon-only"
            size="small"
            icon={trashOutline}
            color="primary"
          />
          {deleteButtonText}
        </IonButton>
      )}
    </IonToolbar>
  );
};

export default PageFooter;
