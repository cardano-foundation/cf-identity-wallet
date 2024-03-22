import { IonAlert } from "@ionic/react";
import { SetUserNameProps } from "./SetUserName.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { PreferencesKeys, PreferencesStorage } from "../../../core/storage";

const SetUserName = ({ isOpen, setIsOpen }: SetUserNameProps) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const componentId = "set-user-name";

  const handleConfirm = (userName: string) => {
    if (userName.length === 0) {
      dispatch(setToastMsg(ToastMsgType.USERNAME_CREATION_ERROR));
    } else {
      setAuthentication({
        ...authentication,
        userName,
      });
      PreferencesStorage.set(PreferencesKeys.APP_USER_NAME, {
        userName,
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
          name: "userName",
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
          handler: (alertData) => handleConfirm(alertData.userName),
        },
      ]}
    />
  );
};

export { SetUserName };
