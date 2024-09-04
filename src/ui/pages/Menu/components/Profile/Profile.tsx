import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { IonCard, IonIcon, IonItem } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { ProfileOptionRef, ProfileProps } from "./Profile.types";
import "./Profile.scss";
import { i18n } from "../../../../../i18n";
import { CustomInput } from "../../../../components/CustomInput";
import { Agent } from "../../../../../core/agent/agent";
import { BasicRecord } from "../../../../../core/agent/records";
import { MiscRecordId } from "../../../../../core/agent/agent.types";
import {
  getAuthentication,
  setAuthentication,
} from "../../../../../store/reducers/stateCache";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import { PROFILE_LINK } from "../../../../globals/constants";

const Profile = forwardRef<ProfileOptionRef, ProfileProps>(
  ({ isEditing }, ref) => {
    const dispatch = useAppDispatch();
    const authentication = useAppSelector(getAuthentication);
    const [userName, setUserName] = useState(authentication.userName);

    useEffect(() => {
      setUserName(authentication.userName);
    }, [authentication.userName]);

    const saveChanges = () => {
      userName.length &&
        userName !== authentication.userName &&
        Agent.agent.basicStorage
          .createOrUpdateBasicRecord(
            new BasicRecord({
              id: MiscRecordId.USER_NAME,
              content: {
                userName,
              },
            })
          )
          .then(() => {
            dispatch(
              setAuthentication({
                ...authentication,
                userName,
              })
            );
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error("Unable to update user name: ", error);
          });
    };

    useImperativeHandle(ref, () => ({
      saveChanges,
    }));
    return (
      <>
        {isEditing ? (
          <CustomInput
            dataTestId="profile-item-edit-name"
            title={`${i18n.t("menu.tab.items.profile.name")}`}
            placeholder={userName}
            hiddenInput={false}
            onChangeInput={setUserName}
            value={userName}
          />
        ) : (
          <>
            <div className="profile-item-title-placeholder" />
            <IonCard>
              <IonItem>
                <div
                  className="profile-item"
                  data-testid="profile-item-view-name"
                >
                  <span>{i18n.t("menu.tab.items.profile.name")}</span>
                  <span>{userName}</span>
                </div>
              </IonItem>
            </IonCard>
          </>
        )}
        <IonCard>
          <IonItem onClick={() => Browser.open({ url: PROFILE_LINK })}>
            <div
              className="profile-item"
              data-testid="profile-item-profile-link"
            >
              <span>{i18n.t("menu.tab.items.profile.watchvideo")}</span>
              <IonIcon
                aria-hidden="true"
                icon={chevronForward}
                slot="end"
              />
            </div>
          </IonItem>
        </IonCard>
      </>
    );
  }
);

export { Profile };
