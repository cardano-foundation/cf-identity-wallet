import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { informationCircleOutline, scanOutline } from "ionicons/icons";
import {
  MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { ConfigurationService } from "../../../core/configuration";
import { i18n } from "../../../i18n";
import { RoutePath } from "../../../routes";
import { getNextRoute } from "../../../routes/nextRoute";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import {
  clearSSIAgent,
  getSSIAgent,
  setBootUrl,
  setConnectUrl,
} from "../../../store/reducers/ssiAgent";
import {
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { CustomInput } from "../../components/CustomInput";
import { ErrorMessage } from "../../components/ErrorMessage";
import { PageFooter } from "../../components/PageFooter";
import { PageHeader } from "../../components/PageHeader";
import { TermsModal } from "../../components/TermsModal";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { OperationType } from "../../globals/types";
import { useAppIonRouter } from "../../hooks";
import { isValidHttpUrl } from "../../utils/urlChecker";
import "./CreateSSIAgent.scss";
import { SwitchOnboardingMode } from "../../components/SwitchOnboardingMode";
import { OnboardingMode } from "../../components/SwitchOnboardingMode/SwitchOnboardingMode.types";

const SSI_URLS_EMPTY = "SSI url is empty";
const SEED_PHRASE_EMPTY = "Invalid seed phrase";

const InputError = ({
  showError,
  errorMessage,
}: {
  showError: boolean;
  errorMessage: string;
}) => {
  return showError ? (
    <ErrorMessage message={errorMessage} />
  ) : (
    <div className="ssi-error-placeholder" />
  );
};

const CreateSSIAgent = () => {
  const pageId = "create-ssi-agent";
  const ssiAgent = useAppSelector(getSSIAgent);
  const seedPhraseCache = useAppSelector(getSeedPhraseCache);
  const stateCache = useAppSelector(getStateCache);

  const ionRouter = useAppIonRouter();
  const dispatch = useAppDispatch();
  const [connectUrlInputTouched, setConnectUrlTouched] = useState(false);
  const [bootUrlInputTouched, setBootUrlInputTouched] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMismatchError, setHasMismatchError] = useState(false);
  const [isInvalidBootUrl, setIsInvalidBootUrl] = useState(false);
  const [isInvalidConnectUrl, setInvalidConnectUrl] = useState(false);

  const isRecoveryMode = stateCache.authentication.recoveryWalletProgress;

  useEffect(() => {
    if (!ssiAgent.bootUrl && !ssiAgent.connectUrl) {
      dispatch(
        setConnectUrl(ConfigurationService.env?.keri?.keria?.url || undefined)
      );
      dispatch(
        setBootUrl(ConfigurationService.env?.keri?.keria?.bootUrl || undefined)
      );
    }
  }, [dispatch, ssiAgent.bootUrl, ssiAgent.connectUrl]);

  const setTouchedConnectUrlInput = () => {
    setConnectUrlTouched(true);
  };

  const setTouchedBootUrlInput = () => {
    setBootUrlInputTouched(true);
  };

  const validBootUrl = useMemo(() => {
    return (
      isRecoveryMode || (ssiAgent.bootUrl && isValidHttpUrl(ssiAgent.bootUrl))
    );
  }, [isRecoveryMode, ssiAgent.bootUrl]);

  const validConnectUrl = useMemo(() => {
    return ssiAgent.connectUrl && isValidHttpUrl(ssiAgent.connectUrl);
  }, [ssiAgent]);

  const displayBootUrlError =
    !isRecoveryMode &&
    bootUrlInputTouched &&
    ssiAgent.bootUrl &&
    !isValidHttpUrl(ssiAgent.bootUrl);

  const displayConnectUrlError =
    connectUrlInputTouched &&
    ssiAgent.connectUrl &&
    !isValidHttpUrl(ssiAgent.connectUrl);

  const validated = validBootUrl && validConnectUrl;

  const handleClearState = () => {
    dispatch(clearSSIAgent());
  };

  const handleRecoveryWallet = async () => {
    setLoading(true);
    try {
      if (!ssiAgent.connectUrl) {
        throw new Error(SSI_URLS_EMPTY);
      }

      if (!seedPhraseCache.seedPhrase) {
        throw new Error(SEED_PHRASE_EMPTY);
      }

      await Agent.agent.recoverKeriaAgent(
        seedPhraseCache.seedPhrase.split(" "),
        ssiAgent.connectUrl
      );

      const { nextPath, updateRedux } = getNextRoute(RoutePath.SSI_AGENT, {
        store: { stateCache },
      });

      updateReduxState(
        nextPath.pathname,
        {
          store: { stateCache },
        },
        dispatch,
        updateRedux
      );

      Agent.agent.basicStorage.deleteById(MiscRecordId.APP_RECOVERY_WALLET);

      ionRouter.push(nextPath.pathname, "forward", "push");
      handleClearState();
    } catch (e) {
      const errorMessage = (e as Error).message;

      if (
        [SSI_URLS_EMPTY, SEED_PHRASE_EMPTY, Agent.INVALID_MNEMONIC].includes(
          errorMessage
        )
      ) {
        return;
      }

      if (Agent.KERIA_NOT_BOOTED === errorMessage) {
        setHasMismatchError(true);
        return;
      }

      setInvalidConnectUrl(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSSI = async () => {
    setLoading(true);
    try {
      if (!ssiAgent.bootUrl || !ssiAgent.connectUrl) {
        throw new Error(SSI_URLS_EMPTY);
      }

      await Agent.agent.bootAndConnect({
        bootUrl: ssiAgent.bootUrl || "",
        url: ssiAgent.connectUrl,
      });

      const { nextPath, updateRedux } = getNextRoute(RoutePath.SSI_AGENT, {
        store: { stateCache },
      });

      updateReduxState(
        nextPath.pathname,
        {
          store: { stateCache },
        },
        dispatch,
        updateRedux
      );

      ionRouter.push(nextPath.pathname, "forward", "push");
      handleClearState();
    } catch (e) {
      const errorMessage = (e as Error).message;
      if (Agent.KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT === errorMessage) {
        setHasMismatchError(true);
      }

      if (Agent.KERIA_BOOT_FAILED === errorMessage) {
        setIsInvalidBootUrl(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = () => {
    if (isRecoveryMode) {
      handleRecoveryWallet();
    } else {
      handleCreateSSI();
    }
  };

  const scanBootUrl = (event: ReactMouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
    dispatch(setCurrentOperation(OperationType.SCAN_SSI_BOOT_URL));
  };

  const scanConnectUrl = (event: ReactMouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
    dispatch(setCurrentOperation(OperationType.SCAN_SSI_CONNECT_URL));
  };

  const removeLastSlash = (url: string) => {
    let result = url;

    while (result && result.length > 0 && url[result.length - 1] === "/") {
      result = result.substring(0, result.length - 1);
    }

    return result;
  };

  const handleChangeConnectUrl = (connectionUrl: string) => {
    setInvalidConnectUrl(false);
    setHasMismatchError(false);
    dispatch(setConnectUrl(connectionUrl));
  };

  const handleChangeBootUrl = (bootUrl: string) => {
    setIsInvalidBootUrl(false);
    dispatch(setBootUrl(bootUrl));
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={pageId}
        header={
          <PageHeader
            currentPath={RoutePath.SSI_AGENT}
            progressBar={true}
            progressBarValue={1}
            progressBarBuffer={1}
          />
        }
      >
        <div className="content-container ">
          <div>
            <h2
              className="title"
              data-testid={`${pageId}-title`}
            >
              {i18n.t("ssiagent.title")}
            </h2>
            <p
              className="page-paragraph"
              data-testid={`${pageId}-top-paragraph`}
            >
              {i18n.t(
                isRecoveryMode
                  ? "ssiagent.verifydescription"
                  : "ssiagent.description"
              )}
            </p>
            <div>
              <IonButton
                fill="outline"
                className="copy-button secondary-button"
                onClick={() => setOpenInfo(true)}
              >
                <IonIcon
                  slot="start"
                  icon={informationCircleOutline}
                />
                {i18n.t("ssiagent.button.info")}
              </IonButton>
            </div>
            {!isRecoveryMode && (
              <>
                <CustomInput
                  dataTestId="boot-url-input"
                  title={`${i18n.t("ssiagent.input.boot.label")}`}
                  placeholder={`${i18n.t("ssiagent.input.boot.placeholder")}`}
                  actionIcon={scanOutline}
                  action={scanBootUrl}
                  onChangeInput={handleChangeBootUrl}
                  value={ssiAgent.bootUrl || ""}
                  onChangeFocus={(result) => {
                    setTouchedBootUrlInput();

                    if (!result && ssiAgent.bootUrl) {
                      dispatch(
                        setBootUrl(removeLastSlash(ssiAgent.bootUrl.trim()))
                      );
                    }
                  }}
                  error={!!displayBootUrlError || isInvalidBootUrl}
                />
                <InputError
                  showError={!!displayBootUrlError || isInvalidBootUrl}
                  errorMessage={
                    (displayBootUrlError || isInvalidBootUrl) &&
                    !displayConnectUrlError
                      ? `${i18n.t("ssiagent.error.invalidbooturl")}`
                      : `${i18n.t("ssiagent.error.invalidurl")}`
                  }
                />
              </>
            )}
            <CustomInput
              dataTestId="connect-url-input"
              title={`${i18n.t("ssiagent.input.connect.label")}`}
              placeholder={`${i18n.t("ssiagent.input.connect.placeholder")}`}
              actionIcon={scanOutline}
              action={scanConnectUrl}
              onChangeInput={handleChangeConnectUrl}
              onChangeFocus={(result) => {
                setTouchedConnectUrlInput();

                if (!result && ssiAgent.connectUrl) {
                  dispatch(
                    setConnectUrl(removeLastSlash(ssiAgent.connectUrl.trim()))
                  );
                }
              }}
              value={ssiAgent.connectUrl || ""}
              error={
                !!displayConnectUrlError ||
                hasMismatchError ||
                isInvalidConnectUrl
              }
            />
            <InputError
              showError={
                !!displayConnectUrlError ||
                hasMismatchError ||
                isInvalidConnectUrl
              }
              errorMessage={
                hasMismatchError
                  ? `${i18n.t("ssiagent.error.mismatchconnecturl")}`
                  : displayBootUrlError && !isInvalidConnectUrl
                    ? `${i18n.t("ssiagent.error.invalidurl")}`
                    : `${i18n.t("ssiagent.error.invalidconnecturl")}`
              }
            />
            <SwitchOnboardingMode
              mode={
                isRecoveryMode ? OnboardingMode.Create : OnboardingMode.Recovery
              }
            />
          </div>
          <PageFooter
            pageId={pageId}
            primaryButtonText={`${i18n.t("ssiagent.button.validate")}`}
            primaryButtonAction={() => handleValidate()}
            primaryButtonDisabled={!validated || loading}
          />
        </div>
      </ScrollablePageLayout>
      {loading && (
        <div
          className="ssi-spinner-container"
          data-testid="ssi-spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      )}
      <TermsModal
        name="about-ssi-agent"
        isOpen={openInfo}
        setIsOpen={setOpenInfo}
      />
    </>
  );
};

export { CreateSSIAgent };
