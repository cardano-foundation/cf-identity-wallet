import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
} from "@ionic/react";
import { menuOutline } from "ionicons/icons";
import "./TabLayout.scss";
import { useHistory } from "react-router-dom";
import { TabLayoutProps } from "./TabLayout.types";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { getState } from "../../../../store/reducers/stateCache";

const TabLayout = ({
  currentPath,
  header,
  title,
  menuButton,
  otherButtons,
  children,
}: TabLayoutProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const storeState = useAppSelector(getState);

  return (
    <>
      {header && (
        <IonHeader
          translucent={true}
          className="ion-no-border tab-header"
        >
          <IonToolbar color="light">
            {title && (
              <IonTitle>
                <h2>{title}</h2>
              </IonTitle>
            )}

            <IonButtons slot="end">
              {otherButtons}

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
            </IonButtons>
          </IonToolbar>
        </IonHeader>
      )}

      <IonContent
        className="tab-content"
        color="light"
      >
        {children}
      </IonContent>
    </>
  );
};

export { TabLayout };
