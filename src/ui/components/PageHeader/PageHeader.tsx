import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { arrowBackOutline, closeOutline, menuOutline } from "ionicons/icons";
import { PageHeaderProps } from "./PageHeader.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getStateCache } from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { getBackRoute } from "../../../routes/backRoute";
import "./PageHeader.scss";

const PageHeader = ({
  backButton,
  beforeBack,
  onBack,
  currentPath,
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
}: PageHeaderProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const hasContent =
    !!backButton ||
    !!closeButton ||
    !!actionButton ||
    !!progressBar ||
    !!title ||
    !!menuButton;

  const handleOnBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (beforeBack) {
        beforeBack();
      }
      if (backButton && currentPath) {
        const { backPath, updateRedux } = getBackRoute(currentPath, {
          store: { stateCache },
        });

        updateReduxState(
          backPath.pathname,
          { store: { stateCache } },
          dispatch,
          updateRedux
        );
        history.push(backPath.pathname);
      }
    }
  };

  return (
    <IonHeader
      translucent={true}
      className={`ion-no-border page-header ${
        hasContent ? "show-header" : "hide-header"
      }`}
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
              <p>{closeButtonLabel}</p>
            </IonButton>
          )}
        </IonButtons>

        {title && (
          <IonTitle>
            <h2
              data-testid={`${title
                .trim()
                .replace(/[^aA-zZ\s]/, "")
                .split(" ")
                .join("-")
                .toLowerCase()}`}
            >
              {title}
            </h2>
          </IonTitle>
        )}

        {progressBar && (
          <div className="progress-bar-container">
            <IonProgressBar
              value={progressBarValue}
              buffer={progressBarBuffer}
              data-testid="progress-bar"
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
                  color="secondary"
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
                <p>{actionButtonLabel}</p>
              </IonButton>
            )}
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  );
};

export { PageHeader };
