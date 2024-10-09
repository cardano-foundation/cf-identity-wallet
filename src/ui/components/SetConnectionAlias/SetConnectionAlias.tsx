import { IonModal, isPlatform } from "@ionic/react";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { i18n } from "../../../i18n";
import { CustomInput } from "../CustomInput";
import { PageFooter } from "../PageFooter";
import "./SetConnectionAlias.scss";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { StorageMessage } from "../../../core/storage/storage.types";
import { showError } from "../../utils/error";
import { ToastMsgType } from "../../globals/types";
import {
  getMissingAliasUrl,
  removeConnectionCache,
  setMissingAliasUrl,
  setOpenConnectionId,
  updateOrAddConnectionCache,
} from "../../../store/reducers/connectionsCache";
import { Agent } from "../../../core/agent/agent";
import { ConnectionStatus } from "../../../core/agent/agent.types";

const SetConnectionAlias = () => {
  const missingAliasUrl = useAppSelector(getMissingAliasUrl);
  const dispatch = useAppDispatch();
  const componentId = "set-connection-alias";
  const [connectionAlias, setConnectionAlias] = useState("");

  const resolveConnectionOobi = async (content: string) => {
    // Adding a pending connection item to the UI.
    // This will be removed when the create connection process ends.
    const connectionName = new URL(content).searchParams.get("name");

    const pendingId = uuidv4();
    dispatch(
      updateOrAddConnectionCache({
        id: pendingId,
        label: connectionName || pendingId,
        status: ConnectionStatus.PENDING,
        connectionDate: new Date().toString(),
      })
    );

    try {
      await Agent.agent.connections.connectByOobiUrl(content);
    } catch (e) {
      const errorMessage = (e as Error).message;

      const urlId = errorMessage
        .replace(StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG, "")
        .trim();

      if (!urlId) {
        showError("Scanner Error:", e, dispatch, ToastMsgType.SCANNER_ERROR);
        return;
      }

      showError(
        "Scanner Error:",
        e,
        dispatch,
        ToastMsgType.DUPLICATE_CONNECTION
      );

      dispatch(setOpenConnectionId(urlId));
    } finally {
      dispatch(removeConnectionCache(pendingId));
    }
  };

  const handleConfirm = () => {
    if (!missingAliasUrl) return;
    const url = new URL(missingAliasUrl);
    url.searchParams.set("name", connectionAlias);
    resolveConnectionOobi(url.toString());
    dispatch(setMissingAliasUrl(undefined));
    setConnectionAlias("");
  };

  return (
    <IonModal
      isOpen={!!missingAliasUrl}
      id={componentId}
      data-testid={`${componentId}-modal`}
      backdropDismiss={false}
    >
      <div className={`${componentId}-wrapper`}>
        <h3>{i18n.t("setconnectionalias.title")}</h3>
        <CustomInput
          dataTestId={`${componentId}-input`}
          title={`${i18n.t("setconnectionalias.input.title")}`}
          hiddenInput={false}
          autofocus={true}
          onChangeInput={setConnectionAlias}
          value={connectionAlias}
        />
        <PageFooter
          pageId={componentId}
          primaryButtonDisabled={connectionAlias.length === 0}
          primaryButtonText={`${i18n.t("setconnectionalias.button.confirm")}`}
          primaryButtonAction={() => handleConfirm()}
        />
      </div>
    </IonModal>
  );
};

export { SetConnectionAlias };
