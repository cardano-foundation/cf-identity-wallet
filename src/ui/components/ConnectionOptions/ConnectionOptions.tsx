import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { pencilOutline, trashOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { ConnectionOptionsProps } from "./ConnectionOptions.types";
import "./ConnectionOptions.scss";
import { getBackRoute } from "../../../routes/backRoute";
import { RoutePath } from "../../../routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getStateCache } from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { TabsRoutePath } from "../navigation/TabsMenu";
import {
  getConnectionsCache,
  setConnectionsCache,
} from "../../../store/reducers/connectionsCache";
import { Alert } from "../Alert";
import { VerifyPassword } from "../VerifyPassword";

const ConnectionOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  connectionDetails,
  setConnectionDetails,
}: ConnectionOptionsProps) => {
  const connectionsData = useAppSelector(getConnectionsCache);
  const stateCache = useAppSelector(getStateCache);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [actionType, setActionType] = useState("");

  const handleDismiss = () => {
    setEditIsOpen(false);
    setOptionsIsOpen(false);
  };

  const handleDelete = () => {
    setActionType("delete");
    setOptionsIsOpen(false);
    setAlertIsOpen(true);
  };

  const handleDone = () => {
    const { backPath, updateRedux } = getBackRoute(
      RoutePath.CONNECTION_DETAILS,
      {
        store: { stateCache },
      }
    );

    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    if (actionType === "delete") {
      history.push(TabsRoutePath.CREDS);
    }
  };

  const verifyAction = () => {
    handleDismiss();
    if (actionType === "edit") {
      // @TODO - sdisalvo: Handle edit
    } else if (actionType === "delete") {
      // @TODO - sdisalvo: Update core
      const updatedConnections = connectionsData.filter(
        (item) => item.id !== connectionDetails.id
      );
      dispatch(setConnectionsCache(updatedConnections));
    }
    handleDone();
  };

  return (
    <>
      <IonModal
        isOpen={optionsIsOpen}
        initialBreakpoint={0.25}
        breakpoints={[0, 0.25]}
        className="page-layout"
        data-testid="connection-options-modal"
        onDidDismiss={() => setOptionsIsOpen(false)}
      >
        <div className="connection-options modal menu">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonTitle data-testid="connection-options-title">
                <h2>{i18n.t("connections.details.options.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="edit-connection-body"
            color="light"
          >
            <IonGrid className="edit-connection-main">
              <IonRow>
                <IonCol size="12">
                  <span
                    className="edit-connection-option"
                    data-testid="edit-connection-edit-button"
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={pencilOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="edit-connection-label">
                      {i18n.t("connections.details.options.labels.edit")}
                    </span>
                  </span>
                  <span
                    className="edit-connection-option"
                    data-testid="edit-connection-delete-button"
                    onClick={handleDelete}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={trashOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="edit-connection-label">
                      {i18n.t("connections.details.options.labels.delete")}
                    </span>
                  </span>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </div>
      </IonModal>
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-confirm"
        headerText={i18n.t("connections.details.options.alert.title")}
        confirmButtonText={`${i18n.t(
          "connections.details.options.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "connections.details.options.alert.cancel"
        )}`}
        actionConfirm={() => setVerifyPasswordIsOpen(true)}
      />
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={verifyAction}
      />
    </>
  );
};

export { ConnectionOptions };
