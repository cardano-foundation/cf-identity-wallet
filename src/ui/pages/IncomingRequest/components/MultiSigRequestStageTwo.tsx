import { IonSpinner } from "@ionic/react";
import { useState } from "react";
import { i18n } from "../../../../i18n";
import { ScrollablePageLayout } from "../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../components/PageFooter";
import { RequestProps } from "../IncomingRequest.types";
import { PageHeader } from "../../../components/PageHeader";
import { IdentifierThemeSelector } from "../../../components/CreateIdentifier/components/IdentifierThemeSelector";
import { CustomInput } from "../../../components/CustomInput";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { Agent } from "../../../../core/agent/agent";
import { IdentifierShortDetails } from "../../../../core/agent/services/identifierService.types";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../../store/reducers/identifiersCache";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../globals/types";

const MultiSigRequestStageTwo = ({
  pageId,
  activeStatus,
  blur,
  setBlur,
  requestData,
  handleAccept,
  setRequestStage,
}: RequestProps) => {
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [displayNameValue, setDisplayNameValue] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(4);
  const displayNameValueIsValid =
    displayNameValue.length > 0 && displayNameValue.length <= 32;

  const handleRequest = async () => {
    setBlur && setBlur(true);
    if (!(requestData.event && requestData.multisigIcpDetails)) {
      // Do some error thing here... maybe it's just a TODO
    } else {
      const joinMultisigResult = await Agent.agent.identifiers.joinMultisig(
        requestData.event,
        {
          theme: selectedTheme,
          displayName: displayNameValue,
        }
      );

      if (joinMultisigResult) {
        const newIdentifier: IdentifierShortDetails = {
          id: joinMultisigResult.identifier,
          displayName: displayNameValue,
          createdAtUTC: `${requestData.event?.createdAt}`,
          theme: selectedTheme,
          isPending: requestData.multisigIcpDetails.threshold >= 2,
          signifyName: joinMultisigResult.signifyName,
        };
        dispatch(setIdentifiersCache([...identifiersData, newIdentifier]));
        dispatch(
          setToastMsg(
            requestData.multisigIcpDetails.threshold === 1
              ? ToastMsgType.IDENTIFIER_CREATED
              : ToastMsgType.IDENTIFIER_REQUESTED
          )
        );
      }
    }
    handleAccept();
  };

  return (
    <>
      {blur && (
        <div
          className="multisig-spinner-container"
          data-testid="multisig-spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      )}
      <ScrollablePageLayout
        pageId={pageId}
        activeStatus={activeStatus}
        customClass={`setup-identifier ${activeStatus ? "show" : "hide"} ${
          blur ? "blur" : ""
        }`}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={() => setRequestStage && setRequestStage(0)}
            closeButtonLabel={`${i18n.t("request.button.back")}`}
            title={`${i18n.t("request.multisig.stagetwo.title")}`}
          />
        }
      >
        <div className="multisig-request-section">
          <h4>{i18n.t("request.multisig.stagetwo.displayname")}</h4>
          <div
            className={`identifier-name${
              displayNameValue.length !== 0 && !displayNameValueIsValid
                ? " identifier-name-error"
                : ""
            }`}
          >
            <CustomInput
              dataTestId="display-name-input"
              title=""
              placeholder={`${i18n.t(
                "createidentifier.displayname.placeholder"
              )}`}
              hiddenInput={false}
              onChangeInput={setDisplayNameValue}
              value={displayNameValue}
            />
            <div className="error-message-container">
              {displayNameValue.length !== 0 && !displayNameValueIsValid && (
                <ErrorMessage
                  message={`${i18n.t("createidentifier.error.maxlength")}`}
                  timeout={true}
                />
              )}
            </div>
          </div>
        </div>
        <div className="multisig-request-section">
          <h4>{i18n.t("createidentifier.theme.title")}</h4>
          <IdentifierThemeSelector
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
          />
        </div>
        <PageFooter
          pageId={pageId}
          customClass={`multisig-request-footer setup-identifier ${
            blur ? "blur" : ""
          }`}
          primaryButtonText={`${i18n.t("request.button.addidentifier")}`}
          primaryButtonAction={async () => handleRequest()}
          primaryButtonDisabled={!displayNameValueIsValid}
        />
      </ScrollablePageLayout>
    </>
  );
};

export { MultiSigRequestStageTwo };
