import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonButtons,
  IonProgressBar,
  IonButton,
  IonIcon,
  IonTitle,
  IonFooter,
} from "@ionic/react";
import { arrowBackOutline, closeOutline, menuOutline } from "ionicons/icons";
import "./PageLayout.scss";
import { useHistory } from "react-router-dom";
import { PageLayoutProps } from "./PageLayout.types";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { getStateCache} from "../../../../store/reducers/stateCache";
import { updateReduxState } from "../../../../store/utils";
import { getBackRoute } from "../../../../routes/backRoute";

const PageLayout = ({
  id,
  header,
  backButton,
  onBack,
  currentPath,
  children,
  closeButton,
  closeButtonAction,
  closeButtonLabel,
  actionButton,
  actionButtonDisabled,
  actionButtonAction,
  actionButtonLabel,
  actionButtonIcon,
  progressBar,
  progressBarValue,
  progressBarBuffer,
  title,
  menuButton,
  footer,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonDisabled,
}: PageLayoutProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);

  const handleOnBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (backButton && currentPath) {
        const { backPath, updateRedux } = getBackRoute(currentPath, {
          store: {stateCache},
        });
        updateReduxState(
          backPath.pathname,
          { store: {stateCache}, },
          dispatch,
          updateRedux
        );
        history.push(backPath.pathname);
      }
    }
  };

  return (
    <>
      {header && (
        <IonHeader
          translucent={true}
          className="ion-no-border page-header"
        >
          <IonToolbar color="light">
            <IonButtons slot="start">
              {backButton && (
                <IonButton
                  slot="icon-only"
                  fill="clear"
                  onClick={handleOnBack}
                  className="back-button"
                  data-testid="back-button"
                >
                  <IonIcon
                    icon={arrowBackOutline}
                    color="primary"
                  />
                </IonButton>
              )}

              {closeButton && !closeButtonLabel && (
                <IonButton
                  shape="round"
                  className="close-button"
                  onClick={closeButtonAction}
                  data-testid="close-button"
                >
                  <IonIcon
                    slot="icon-only"
                    icon={closeOutline}
                    color="primary"
                  />
                </IonButton>
              )}

              {closeButton && closeButtonLabel && (
                <IonButton
                  className="close-button-label"
                  onClick={closeButtonAction}
                  data-testid="close-button"
                >
                  {closeButtonLabel}
                </IonButton>
              )}
            </IonButtons>

            {title && (
              <IonTitle>
                <h2>{title}</h2>
              </IonTitle>
            )}

            {progressBar && (
              <div className="progress-bar-container">
                <IonProgressBar
                  value={progressBarValue}
                  buffer={progressBarBuffer}
                />
              </div>
            )}

            {!progressBar && (
              <IonButtons slot="end">
                {menuButton && (
                  <IonButton
                    shape="round"
                    className="menu-button"
                    data-testid="menu-button"
                  >
                    <IonIcon
                      slot="icon-only"
                      icon={menuOutline}
                      color="primary"
                    />
                  </IonButton>
                )}

                {actionButton && !actionButtonLabel && (
                  <IonButton
                    shape="round"
                    disabled={actionButtonDisabled}
                    className="action-button"
                    onClick={actionButtonAction}
                    data-testid="action-button"
                  >
                    <IonIcon
                      slot="icon-only"
                      icon={actionButtonIcon}
                      color="primary"
                    />
                  </IonButton>
                )}

                {actionButton && actionButtonLabel && (
                  <IonButton
                    disabled={actionButtonDisabled}
                    className="action-button-label"
                    onClick={actionButtonAction}
                    data-testid="action-button"
                  >
                    {actionButtonLabel}
                  </IonButton>
                )}
              </IonButtons>
            )}
          </IonToolbar>
        </IonHeader>
      )}

      <IonContent className="page-content">{children}</IonContent>

      {footer && (
        <IonFooter
          collapse="fade"
          className="ion-no-border"
        >
          <IonToolbar
            color="light"
            className="page-footer"
          >
            <IonButton
              shape="round"
              expand="block"
              className="ion-primary-button"
              data-testid={`continue-button${id ? `-${id}` : ""}`}
              onClick={primaryButtonAction}
              disabled={primaryButtonDisabled}
            >
              {primaryButtonText}
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </>
  );
};

export { PageLayout };
