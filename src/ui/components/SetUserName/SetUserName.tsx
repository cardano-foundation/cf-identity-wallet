import { IonModal } from "@ionic/react";
import { useState } from "react";
import { SetUserNameProps } from "./SetUserName.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import "./SetUserName.scss";
import { i18n } from "../../../i18n";
import { CustomInput } from "../CustomInput";
import { PageFooter } from "../PageFooter";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";

const SetUserName = ({ isOpen, setIsOpen }: SetUserNameProps) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const componentId = "set-user-name";
  const [userName, setUserName] = useState("");

  const handleConfirm = () => {
    Agent.agent.basicStorage
      .save({
        id: MiscRecordId.USER_NAME,
        content: {
          userName,
        },
      })
      .then(() => {
        dispatch(
          setAuthentication({
            ...authentication,
            userName,
          })
        );
        dispatch(setToastMsg(ToastMsgType.USERNAME_CREATION_SUCCESS));
        setIsOpen(false);
      })
      .catch((error) => {
        /*TODO: handle error*/
        dispatch(setToastMsg(ToastMsgType.USERNAME_CREATION_ERROR));
      });
  };

  return (
    <IonModal
      isOpen={isOpen}
      id={componentId}
      data-testid={`${componentId}-modal`}
      backdropDismiss={!isOpen}
    >
      <div className={`${componentId}-wrapper`}>
        <h3>{i18n.t("setusername.title")}</h3>
        <CustomInput
          dataTestId={`${componentId}-input`}
          title={`${i18n.t("setusername.input.title")}`}
          hiddenInput={false}
          autofocus={true}
          onChangeInput={setUserName}
          value={userName}
        />
        <PageFooter
          pageId={componentId}
          primaryButtonDisabled={userName.length === 0}
          primaryButtonText={`${i18n.t("setusername.button.confirm")}`}
          primaryButtonAction={() => handleConfirm()}
        />
      </div>
    </IonModal>
  );
};

export { SetUserName };
