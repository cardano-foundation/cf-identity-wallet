import { IonSpinner } from "@ionic/react";
import { useEffect, useState } from "react";
import { i18n } from "../../../../i18n";
import { ScrollablePageLayout } from "../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../components/PageFooter";
import { RequestProps } from "../IncomingRequest.types";
import { PageHeader } from "../../../components/PageHeader";
import { IdentifierThemeSelector } from "../../../components/CreateIdentifier/components/IdentifierThemeSelector";
import { CustomInput } from "../../../components/CustomInput";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { AriesAgent } from "../../../../core/agent/agent";

const MultiSigRequestStageTwo = ({
  pageId,
  activeStatus,
  blur,
  setBlur,
  requestData,
  handleAccept,
  setRequestStage,
}: RequestProps) => {
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const [displayNameValue, setDisplayNameValue] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(4);
  const displayNameValueIsValid =
    displayNameValue.length > 0 && displayNameValue.length <= 32;

  const handleRequest = async () => {
    setBlur && setBlur(true);
    if (requestData.event) {
      await AriesAgent.agent.identifiers.joinMultisig(requestData.event, {
        theme: selectedTheme,
        colors: ["#000000", "#000000"],
        displayName: displayNameValue,
      });
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
            identifierType={1}
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
