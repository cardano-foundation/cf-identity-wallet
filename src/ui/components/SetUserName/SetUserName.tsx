import { AlertInput, IonAlert } from "@ionic/react";
import { useEffect, useState } from "react";
import { SetUserNameProps } from "./SetUserName.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setAuthentication,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { PreferencesKeys, PreferencesStorage } from "../../../core/storage";

const SetUserName = ({ isOpen, setIsOpen }: SetUserNameProps) => {
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const componentId = "set-user-name";

  const handleConfirm = (name: string) => {
    if (name.length === 0) {
      dispatch(setToastMsg(ToastMsgType.USERNAME_CREATION_ERROR));
    } else {
      setAuthentication({
        ...stateCache.authentication,
        userName: name,
      });
      PreferencesStorage.set(PreferencesKeys.APP_USER_NAME, {
        userName: name,
      })
        .then(() => {
          dispatch(setToastMsg(ToastMsgType.USERNAME_CREATION_SUCCESS));
        })
        .catch((error) => {
          /*TODO: handle error*/
        });
    }
    setIsOpen(false);
  };

  return (
    <IonAlert
      isOpen={isOpen}
      backdropDismiss={false}
      data-testid={componentId}
      header="Please enter your info"
      inputs={[
        {
          name: "name",
          id: componentId + "-input",
          placeholder: "Name (max 32 characters)",
          attributes: {
            maxlength: 32,
          },
        },
      ]}
      buttons={[
        {
          text: "Confirm",
          role: "confirm",
          handler: (alertData) => handleConfirm(alertData.name),
        },
      ]}
    />
  );
};

export { SetUserName };
