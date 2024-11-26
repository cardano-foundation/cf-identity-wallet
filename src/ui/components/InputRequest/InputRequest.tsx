import { IonModal, isPlatform } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import {
  MiscRecordId
} from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { StorageMessage } from "../../../core/storage/storage.types";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getMissingAliasUrl,
  setMissingAliasUrl,
  setOpenConnectionId
} from "../../../store/reducers/connectionsCache";
import {
  getAuthentication,
  getCurrentRoute,
  setAuthentication,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { showError } from "../../utils/error";
import { nameChecker } from "../../utils/nameChecker";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { PageFooter } from "../PageFooter";
import "./InputRequest.scss";

const InputRequest = () => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const missingAliasUrl = useAppSelector(getMissingAliasUrl);
  const currentRoute = useAppSelector(getCurrentRoute);

  const componentId = "input-request";
  const [inputChange, setInputChange] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const errorMessage = inputChange ? nameChecker.getError(inputValue) : undefined;

  const showModal = useMemo(() => {
    return (
      (authentication.loggedIn &&
        (authentication.userName === undefined ||
          authentication.userName?.length === 0) &&
        currentRoute?.path?.includes(TabsRoutePath.ROOT)) ||
      !!missingAliasUrl
    );
  }, [
    authentication.loggedIn,
    authentication.userName,
    currentRoute?.path,
    missingAliasUrl,
  ]);

  useEffect(() => {
    if(!showModal) {
      setInputChange(false);
    }
  }, [showModal])

  const resolveConnectionOobi = async (content: string) => {
    try {
      await Agent.agent.connections.connectByOobiUrl(content);
    } catch (e) {
      const errorMessage = (e as Error).message;

      const urlId = errorMessage
        .replace(StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG, "")
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
    }
  };

  const setUserName = () => {
    Agent.agent.basicStorage
      .createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.USER_NAME,
          content: {
            userName: inputValue,
          },
        })
      )
      .then(() => {
        dispatch(
          setAuthentication({
            ...authentication,
            userName: inputValue,
          })
        );

        setInputValue("");
        dispatch(setToastMsg(ToastMsgType.USERNAME_CREATION_SUCCESS));
      })
      .catch((error) => {
        showError(
          "Unable to create user name",
          error,
          dispatch,
          ToastMsgType.USERNAME_CREATION_ERROR
        );
      });
  };

  const handleConfirm = () => {
    if (missingAliasUrl) {
      if (!missingAliasUrl) return;
      const url = new URL(missingAliasUrl);
      url.searchParams.set("name", inputValue);
      resolveConnectionOobi(url.toString());
      dispatch(setMissingAliasUrl(undefined));
      setInputValue("");
      return;
    }

    setUserName();
  };

  const title = useMemo(() => {
    if (missingAliasUrl) {
      return i18n.t("inputrequest.title.connectionalias");
    }

    return i18n.t("inputrequest.title.username");
  }, [missingAliasUrl]);

  return (
    <IonModal
      isOpen={showModal}
      id={componentId}
      data-testid={`${componentId}-modal`}
      className={missingAliasUrl ? "connection-alias" : undefined}
      backdropDismiss={false}
      animated={!isPlatform("ios") || !!missingAliasUrl}
    >
      <div className={`${componentId}-wrapper`}>
        <h3>{title}</h3>
        <CustomInput
          dataTestId={`${componentId}-input`}
          title={`${i18n.t("inputrequest.input.title")}`}
          hiddenInput={false}
          autofocus={true}
          onChangeInput={(value) => {
            setInputValue(value); 
            setInputChange(true);
          }}
          value={inputValue}
          error={!!errorMessage && inputChange}
        />
        <ErrorMessage message={errorMessage}/>
        <PageFooter
          pageId={componentId}
          primaryButtonDisabled={inputValue.length === 0}
          primaryButtonText={`${i18n.t("inputrequest.button.confirm")}`}
          primaryButtonAction={() => handleConfirm()}
        />
      </div>
    </IonModal>
  );
};

export { InputRequest };
