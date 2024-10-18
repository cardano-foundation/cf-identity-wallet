import { IonSpinner } from "@ionic/react";
import { useCallback, useState } from "react";
import { Agent } from "../../../../../core/agent/agent";
import { CredentialsMatchingApply } from "../../../../../core/agent/services/ipexCommunicationService.types";
import { i18n } from "../../../../../i18n";
import { Alert } from "../../../../components/Alert";
import { useOnlineStatusEffect } from "../../../../hooks";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import { ChooseCredential } from "./ChooseCredential";
import "./CredentialRequest.scss";
import { CredentialRequestInformation } from "./CredentialRequestInformation";
import { showError } from "../../../../utils/error";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import { getIdentifiersCache } from "../../../../../store/reducers/identifiersCache";
import { IdentifierType } from "../../../../../core/agent/services/identifier.types";

const CredentialRequest = ({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
}: NotificationDetailsProps) => {
  const dispatch = useAppDispatch();
  const [requestStage, setRequestStage] = useState(0);
  const [credentialRequest, setCredentialRequest] =
    useState<CredentialsMatchingApply | null>();
  const identifiersData = useAppSelector(getIdentifiersCache);

  const [isOpenAlert, setIsOpenAlert] = useState(false);

  const getCrendetialRequest = useCallback(async () => {
    try {
      const request = await Agent.agent.ipexCommunications.getIpexApplyDetails(
        notificationDetails
      );

      const identifier = identifiersData.find(
        (identifier) => identifier.id === request.identifier
      );

      const identifierType =
        identifier?.multisigManageAid || identifier?.multisigManageAid
          ? IdentifierType.Group
          : IdentifierType.Individual;

      setCredentialRequest(request);
    } catch (e) {
      handleBack();
      showError("Unable to get credential request detail", e, dispatch);
    }
  }, [notificationDetails, dispatch, handleBack]);

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
          reloadData={getCrendetialRequest}
        />
      )}
      <Alert
        isOpen={isOpenAlert}
        setIsOpen={setIsOpenAlert}
        dataTestId="alert-empty-cred"
        headerText={i18n.t(
          "tabs.notifications.details.credential.request.alert.text"
        )}
        confirmButtonText={`${i18n.t(
          "tabs.notifications.details.credential.request.alert.confirm"
        )}`}
        actionConfirm={handleClose}
        actionDismiss={handleClose}
      />
    </div>
  );
};

export { CredentialRequest };
