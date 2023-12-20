import { IonButton, IonIcon, IonToolbar } from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { PageFooterProps } from "./PageFooter.types";
import "./PageFooter.scss";

const PageFooter = ({
  pageId,
  primaryButtonIcon,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonDisabled,
  secondaryButtonIcon,
  secondaryButtonText,
  secondaryButtonAction,
  secondaryButtonDisabled,
  tertiaryButtonIcon,
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
          {primaryButtonIcon && (
            <IonIcon
              slot="icon-only"
              size="small"
              icon={primaryButtonIcon}
              color="primary"
            />
          )}
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
          {secondaryButtonIcon && (
            <IonIcon
              slot="icon-only"
              size="small"
              icon={secondaryButtonIcon}
              color="primary"
            />
          )}
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
          {tertiaryButtonIcon && (
            <IonIcon
              slot="icon-only"
              size="small"
              icon={tertiaryButtonIcon}
              color="primary"
            />
          )}
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

export { PageFooter };
