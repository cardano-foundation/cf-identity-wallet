import { IonButton, IonIcon, IonToolbar } from "@ionic/react";
import { archiveOutline, trashOutline } from "ionicons/icons";
import "./PageFooter.scss";
import { PageFooterProps } from "./PageFooter.types";

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
  declineButtonAction,
  declineButtonDisabled,
  declineButtonIcon,
  declineButtonText,
  children,
}: PageFooterProps) => {
  const getHrefLink = (action: (() => void) | string) => {
    if (typeof action === "string") return action;
    return undefined;
  };

  const getAction = (action: (() => void) | string) => {
    if (typeof action === "function") return action;
    return undefined;
  };

  return (
    <IonToolbar
      className={`page-footer${customClass ? " " + customClass : ""}`}
      data-testid={pageId && `${pageId}-footer`}
    >
      {children}
      <div className="page-footer-content">
        {primaryButtonText && primaryButtonAction && (
          <IonButton
            shape="round"
            expand="block"
            className="primary-button"
            data-testid={`primary-button${pageId ? `-${pageId}` : ""}`}
            onClick={getAction(primaryButtonAction)}
            disabled={primaryButtonDisabled}
            href={getHrefLink(primaryButtonAction)}
          >
            {primaryButtonIcon && (
              <IonIcon
                slot="icon-only"
                size="small"
                icon={primaryButtonIcon}
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
            onClick={getAction(secondaryButtonAction)}
            disabled={secondaryButtonDisabled}
            href={getHrefLink(secondaryButtonAction)}
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
            onClick={getAction(tertiaryButtonAction)}
            disabled={tertiaryButtonDisabled}
            href={getHrefLink(tertiaryButtonAction)}
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
            onClick={getAction(archiveButtonAction)}
            disabled={archiveButtonDisabled}
            href={getHrefLink(archiveButtonAction)}
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
            onClick={getAction(deleteButtonAction)}
            disabled={deleteButtonDisabled}
            href={getHrefLink(deleteButtonAction)}
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
        {declineButtonText && declineButtonAction && (
          <IonButton
            shape="round"
            expand="block"
            fill="clear"
            className="decline-button"
            data-testid={`decline-button${pageId ? `-${pageId}` : ""}`}
            onClick={getAction(declineButtonAction)}
            href={getHrefLink(declineButtonAction)}
            disabled={declineButtonDisabled}
          >
            {declineButtonIcon && (
              <IonIcon
                slot="icon-only"
                size="small"
                icon={declineButtonIcon}
                color="primary"
              />
            )}
            {declineButtonText}
          </IonButton>
        )}
      </div>
    </IonToolbar>
  );
};

export { PageFooter };
