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
import { arrowBackOutline, closeOutline } from "ionicons/icons";
import "./PageLayout.scss";
import { useHistory } from "react-router-dom";
import { PageLayoutProps } from "./PageLayout.types";
import {useAppDispatch, useAppSelector} from "../../../../store/hooks";
import {getState, setCurrentRoute} from "../../../../store/reducers/stateCache";
import {updateReduxState} from "../../../../store/utils";
import {getBackRoute} from "../../../../routes/backRoute";

const PageLayout = ({
  header,
  backButton,
  backButtonPath,
  currentPath,
  onBack,
  children,
  closeButton,
  closeButtonAction,
  progressBar,
  progressBarValue,
  progressBarBuffer,
  title,
  footer,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonDisabled,
}: PageLayoutProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const storeState = useAppSelector(getState);

  const handleOnBack = () => {
    if (!currentPath) return;
    const { backPath, updateRedux } = getBackRoute(currentPath, {
      store: storeState,
    });
    if (updateRedux?.length) {
      updateReduxState(dispatch, updateRedux);
    }
    dispatch(setCurrentRoute({ path: backPath.pathname }));
    history.push(backPath.pathname);
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
                      slot="start"
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
              {closeButton && (
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
          </IonToolbar>
        </IonHeader>
      )}

      <IonContent
        className="page-content"
        color="light"
      >
        {children}
      </IonContent>

      {footer && (
        <IonFooter collapse="fade">
          <IonToolbar
            color="light"
            className="page-footer"
          >
            <IonButton
              shape="round"
              expand="block"
              className="ion-primary-button"
              data-testid="continue-button"
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
