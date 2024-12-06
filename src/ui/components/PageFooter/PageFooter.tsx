import { IonButton, IonIcon, IonToolbar } from "@ionic/react";
import { archiveOutline, trashOutline } from "ionicons/icons";
import { PageFooterProps } from "./PageFooter.types";
import "./PageFooter.scss";

const PageFooter = ({
  pageId,
  customClass,
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
  archiveButtonText,
  archiveButtonAction,
  archiveButtonDisabled,
  deleteButtonText,
  deleteButtonAction,
  deleteButtonDisabled,
  children,
}: PageFooterProps) => {
  return (
    <IonToolbar
      className={`page-footer${customClass ? " " + customClass : ""}`}
      data-testid={`${pageId}-footer`}
    >
      {children}
      <div className="page-footer-content">
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
        {archiveButtonText && archiveButtonAction && (
          <IonButton
            shape="round"
            expand="block"
            fill="clear"
            className="archive-button"
            data-testid={`archive-button${pageId ? `-${pageId}` : ""}`}
            onClick={archiveButtonAction}
            disabled={archiveButtonDisabled}
          >
            <IonIcon
              slot="icon-only"
              size="small"
              icon={archiveOutline}
              color="primary"
            />
            {archiveButtonText}
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
      </div>
    </IonToolbar>
  );
};

export { PageFooter };
