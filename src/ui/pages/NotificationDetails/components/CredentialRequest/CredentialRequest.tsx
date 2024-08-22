import { IonSpinner } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { Agent } from "../../../../../core/agent/agent";
import { CredentialsMatchingApply } from "../../../../../core/agent/services/ipexCommunicationService.types";
import { useAppSelector } from "../../../../../store/hooks";
import { getNotificationDetailCache } from "../../../../../store/reducers/notificationsCache";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import { ChooseCredential } from "./ChooseCredential";
import "./CredentialRequest.scss";
import { CredentialRequestInformation } from "./CredentialRequestInformation";
import { useOnlineStatusEffect } from "../../../../hooks";
import { Alert } from "../../../../components/Alert";
import { i18n } from "../../../../../i18n";

const CredentialRequest = ({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
}: NotificationDetailsProps) => {
  const notificationDetailCache = useAppSelector(getNotificationDetailCache);
  const [requestStage, setRequestStage] = useState(
    notificationDetailCache?.step || 0
  );
  const [credentialRequest, setCredentialRequest] =
    useState<CredentialsMatchingApply | null>();

  const [isOpenAlert, setIsOpenAlert] = useState(false);

  useEffect(() => {
    if (!notificationDetailCache) {
      return;
    }

    setRequestStage(notificationDetailCache.step || 0);
  }, [notificationDetailCache]);

  const getCrendetialRequest = useCallback(async () => {
    try {
      const request = await Agent.agent.ipexCommunications.getIpexApplyDetails(
        notificationDetails
      );

      setCredentialRequest(request);
    } catch (e) {
      // TODO: handle error
    }
  }, [notificationDetails]);

  useOnlineStatusEffect(getCrendetialRequest);

  const changeToStageTwo = () => {
    if (credentialRequest?.credentials.length === 0) {
      setIsOpenAlert(true);
      return;
    }

    setRequestStage(1);
  };

  const backToStageOne = () => {
    setRequestStage(0);
  };

  const handleClose = () => {
    setIsOpenAlert(false);
  };

  if (!credentialRequest) {
    return (
      <div
        className="cre-request-spinner-container"
        data-testid="cre-request-spinner-container"
      >
        <IonSpinner name="circular" />
      </div>
    );
  }

  return (
    <div className="credential-request-container">
      {requestStage === 0 ? (
        <CredentialRequestInformation
          onAccept={changeToStageTwo}
          pageId={pageId}
          activeStatus={activeStatus}
          notificationDetails={notificationDetails}
          credentialRequest={credentialRequest}
          onBack={handleBack}
        />
      ) : (
        <ChooseCredential
          pageId={pageId}
          activeStatus={activeStatus}
          credentialRequest={credentialRequest}
          notificationDetails={notificationDetails}
          onBack={backToStageOne}
          onClose={handleBack}
        />
      )}
      <Alert
        isOpen={isOpenAlert}
        setIsOpen={setIsOpenAlert}
        dataTestId="alert-empty-cred"
        headerText={i18n.t(
          "notifications.details.credential.request.alert.text"
        )}
        confirmButtonText={`${i18n.t(
          "notifications.details.credential.request.alert.confirm"
        )}`}
        actionConfirm={handleClose}
        actionDismiss={handleClose}
      />
    </div>
  );
};

export { CredentialRequest };
