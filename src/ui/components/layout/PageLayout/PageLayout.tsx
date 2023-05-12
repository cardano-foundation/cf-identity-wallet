import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonButtons,
  IonProgressBar,
  IonButton,
  IonIcon,
  IonTitle,
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
      <IonHeader
        translucent={true}
        className="ion-no-border page-layout"
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
                ></IonIcon>
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

      <IonContent color="light">{children}</IonContent>
    </>
  );
};

export { PageLayout };
