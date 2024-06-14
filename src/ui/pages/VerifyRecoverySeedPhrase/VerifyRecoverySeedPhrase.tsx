import { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { closeOutline } from "ionicons/icons";
import { wordlists } from "bip39";
import { IonButton, IonIcon } from "@ionic/react";
import { i18n } from "../../../i18n";
import { RoutePath } from "../../../routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { Alert as AlertFail } from "../../components/Alert";
import "./VerifyRecoverySeedPhrase.scss";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { getStateCache } from "../../../store/reducers/stateCache";
import { getBackRoute } from "../../../routes/backRoute";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { PageHeader } from "../../components/PageHeader";
import { PageFooter } from "../../components/PageFooter";
import { SeedPhraseModule } from "../../components/SeedPhraseModule";
import { useAppIonRouter } from "../../hooks";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { SeedPhraseModuleRef } from "../../components/SeedPhraseModule/SeedPhraseModule.types";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { setSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import { Agent } from "../../../core/agent/agent";

const SEED_PHRASE_LENGTH = 18;
const SUGGEST_SEED_PHRASE_LENGTH = 4;
const MAX_ATTEMPT_FAIL = 5;
const LOCK_TIME = 60000;
const RESET_ATTEMPT_TIME = 600000;
const SELECT_WORD_LIST = wordlists.english;
const INVALID_SEED_PHRASE = "Invalid seed phrase";

const VerifyRecoverySeedPhrase = () => {
  const pageId = "verify-recovery-seed-phrase";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);

  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [clearAlertOpen, setClearAlertOpen] = useState(false);
  const [alertManyAttempOpen, setAlertManyAttempOpen] = useState(false);
  const ionRouter = useAppIonRouter();

  const [seedPhrase, setSeedPhrase] = useState<string[]>([""]);
  const [suggestSeedPhrase, setSuggestSeedPhrase] = useState<string[]>([]);
  const [errorInputIndex, setErrorInputIndex] = useState<number[]>([]);

  const [failAttempt, setFailAttempt] = useState(0);
  const [lastLockTime, setLastLockTime] = useState<Date | null>(null);
  const [lockFailAttempt, setLockFailAttempt] = useState(false);

  const lastFocusIndex = useRef<number | null>(null);
  const seedPhraseRef = useRef<SeedPhraseModuleRef>(null);

  const removeLockAttempt = () => {
    SecureStorage.delete(KeyStoreKeys.RECOVERY_WALLET_LAST_FAIL_ATTEMPT_TIME);
    setFailAttempt(0);
    setLockFailAttempt(false);
  };

  const getLockDuration = useCallback(() => {
    return Date.now() - (!lastLockTime ? 0 : lastLockTime.getTime());
  }, [lastLockTime]);

  useEffect(() => {
    async function getFailAttemptInfo() {
      try {
        const lastFailedTime = await SecureStorage.get(
          KeyStoreKeys.RECOVERY_WALLET_LAST_FAIL_ATTEMPT_TIME
        );
        if (!lastFailedTime) return;

        const lockDuration = Date.now() - Number(lastFailedTime);

        if (lockDuration >= RESET_ATTEMPT_TIME) {
          removeLockAttempt();
          return;
        }

        setFailAttempt(MAX_ATTEMPT_FAIL);
        setLastLockTime(new Date(Number(lastFailedTime)));
      } catch (e) {
        // TODO: handle error
      }
    }

    getFailAttemptInfo();
  }, []);

  // Reset attempt numbers after 10 minutes from last lock period
  useEffect(() => {
    if (!lastLockTime) return;

    const resetAttemptTime = RESET_ATTEMPT_TIME - getLockDuration();

    if (resetAttemptTime <= 0) return;

    const timerId = setTimeout(() => {
      removeLockAttempt();
    }, resetAttemptTime);

    return () => {
      clearTimeout(timerId);
    };
  }, [lastLockTime]);

  useEffect(() => {
    if (!lastLockTime) return;

    const lockTime = LOCK_TIME - getLockDuration();

    if (lockTime <= 0) {
      setLockFailAttempt(false);
      return;
    }

    setLockFailAttempt(true);
    setFailAttempt(MAX_ATTEMPT_FAIL);

    const timerId = setTimeout(() => {
      setLockFailAttempt(false);
    }, lockTime);

    return () => {
      clearTimeout(timerId);
    };
  }, [lastLockTime]);

  const handleClearState = () => {
    setSeedPhrase([""]);
    setSuggestSeedPhrase([]);
    setAlertIsOpen(false);
    seedPhraseRef.current?.focusInputByIndex(0);
  };

  const clearErrorIndex = (errorIndex: number | null) => {
    if (errorIndex === null) return;

    setErrorInputIndex((errorIndexs) => {
      return errorIndexs.filter((index) => index !== errorIndex);
    });
  };

  const renderSuggestSeedPhrase = (inputWord: string) => {
    inputWord = inputWord.toLowerCase().trim();

    if (!inputWord) {
      clearErrorIndex(lastFocusIndex.current);
      setSuggestSeedPhrase([]);
      return;
    }

    const suggestionWords: string[] = [];
    for (let index = 0; index < SELECT_WORD_LIST.length; index++) {
      const word = SELECT_WORD_LIST[index];

      if (word.startsWith(inputWord)) {
        suggestionWords.push(word);
      }

      if (suggestionWords.length >= SUGGEST_SEED_PHRASE_LENGTH) {
        break;
      }
    }

    setErrorInputIndex((errorIndexs) => {
      if (lastFocusIndex.current === null) return errorIndexs;

      if (suggestionWords.length > 0) {
        return errorIndexs.filter((index) => index !== lastFocusIndex.current);
      }

      errorIndexs.push(lastFocusIndex.current);
      return [...errorIndexs];
    });

    setSuggestSeedPhrase(suggestionWords);
  };

  const handleUpdateSeedPhrase = (value: string, index: number) => {
    const currentValue = [...seedPhrase];

    renderSuggestSeedPhrase(value);

    currentValue[index] = value;

    if (!value && index === currentValue.length - 2) {
      currentValue.splice(currentValue.length - 2, 1);
    } else if (
      index + 1 === currentValue.length &&
      index + 1 < SEED_PHRASE_LENGTH
    ) {
      currentValue.push("");
    }

    setSeedPhrase(currentValue);

    return currentValue;
  };

  const addSeedPhraseSelected = (word: string) => {
    if (lastFocusIndex.current === null) return;

    const newValue = handleUpdateSeedPhrase(word, lastFocusIndex.current);
    setSuggestSeedPhrase([]);
    clearErrorIndex(lastFocusIndex.current);

    if (
      lastFocusIndex.current !== SEED_PHRASE_LENGTH - 1 &&
      filledSeedPhrase.length !== SEED_PHRASE_LENGTH
    ) {
      seedPhraseRef.current?.focusInputByIndex(newValue.length - 1);
    }
  };

  const handleContinue = async () => {
    try {
      const seedPhraseText = seedPhrase.join(" ");
      const verifyResult = await Agent.agent.isMnemonicValid(seedPhraseText);

      if (!verifyResult) {
        throw new Error(INVALID_SEED_PHRASE);
      }

      dispatch(
        setSeedPhraseCache({
          seedPhrase: seedPhraseText,
          bran: "",
        })
      );
      handleNavigate();
    } catch (e) {
      setFailAttempt((value) => value + 1);

      if (failAttempt + 1 >= MAX_ATTEMPT_FAIL) {
        const now = new Date();
        SecureStorage.set(
          KeyStoreKeys.RECOVERY_WALLET_LAST_FAIL_ATTEMPT_TIME,
          String(now.getTime())
        );
        setLastLockTime(now);
        setAlertManyAttempOpen(true);
        setLockFailAttempt(true);
      } else {
        setAlertIsOpen(true);
      }
    }
  };

  const handleNavigate = () => {
    const data: DataProps = {
      store: { stateCache },
      state: {
        currentOperation: stateCache.currentOperation,
      },
    };

    const { nextPath, updateRedux } = getNextRoute(
      RoutePath.VERIFY_RECOVERY_SEED_PHRASE,
      data
    );

    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    handleClearState();

    ionRouter.push(nextPath.pathname, "root", "replace");
  };

  const handleBack = () => {
    handleClearState();
    const { backPath, updateRedux } = getBackRoute(
      RoutePath.VERIFY_SEED_PHRASE,
      {
        store: { stateCache },
      }
    );
    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    history.push({
      pathname: backPath.pathname,
    });
  };

  const closeFailAlert = () => {
    setAlertIsOpen(false);
  };

  const closeClearAlert = () => {
    setClearAlertOpen(false);
  };

  const onFocusInput = (index: number) => {
    lastFocusIndex.current = index;
    const word = seedPhrase[index];
    renderSuggestSeedPhrase(word);
  };

  const checkMatchWithSuggestion = (selectWord: string | undefined) => {
    return SELECT_WORD_LIST.some(
      (word) => selectWord?.toLowerCase().trim() === word
    );
  };

  const validateOnBlur = (selectWord: string | undefined, index: number) => {
    if (index === seedPhrase.length - 1 && !selectWord) return;

    if (checkMatchWithSuggestion(selectWord)) {
      setErrorInputIndex((errorIndexs) =>
        errorIndexs.filter((errorIndex) => index !== errorIndex)
      );
    } else {
      setErrorInputIndex((errorIndexs) => [...errorIndexs, index]);
    }
  };

  const onBlurInput = (index: number) => {
    const word = seedPhrase[index];
    validateOnBlur(word, index);
    setSuggestSeedPhrase([]);
  };

  const verifyButtonLabel = `${i18n.t(
    lockFailAttempt
      ? "verifyrecoveryseedphrase.button.lock"
      : "verifyrecoveryseedphrase.button.continue"
  )}`;

  const displaySuggestionError = errorInputIndex.length > 0;
  const filledSeedPhrase = seedPhrase.filter((item) => !!item);
  const isMatchAllSuggestion = filledSeedPhrase.every((seedPhrase) =>
    checkMatchWithSuggestion(seedPhrase)
  );

  return (
    <>
      <ScrollablePageLayout
        pageId={pageId}
        header={
          <PageHeader
            backButton={true}
            onBack={() => {
              handleClearState();
              handleBack();
            }}
            currentPath={RoutePath.VERIFY_SEED_PHRASE}
            progressBar={true}
            progressBarValue={0.75}
            progressBarBuffer={1}
          />
        }
      >
        <div className="content-container">
          <div className="page-content">
            <h2 data-testid={`${pageId}-title`}>
              {i18n.t("verifyrecoveryseedphrase.title")}
            </h2>
            <p
              className="paragraph-top"
              data-testid={`${pageId}-paragraph-top`}
            >
              {i18n.t("verifyrecoveryseedphrase.paragraph.top")}
            </p>
            <SeedPhraseModule
              testId="user-input-seed-phrase-container"
              seedPhrase={seedPhrase}
              inputMode
              onInputChange={handleUpdateSeedPhrase}
              onInputFocus={onFocusInput}
              onInputBlur={onBlurInput}
              ref={seedPhraseRef}
              errorInputIndexs={errorInputIndex}
            />
            {(suggestSeedPhrase.length > 0 || displaySuggestionError) && (
              <h3 className="suggestion-title">
                {i18n.t("verifyrecoveryseedphrase.suggestions.title")}
              </h3>
            )}
            {suggestSeedPhrase.length > 0 && (
              <SeedPhraseModule
                testId="suggestion-seed-phrase-container"
                seedPhrase={suggestSeedPhrase}
                addSeedPhraseSelected={addSeedPhraseSelected}
                hideSeedNumber
              />
            )}
            {displaySuggestionError && (
              <p
                className="suggest-error"
                data-testid="no-suggest-error"
              >
                {i18n.t("verifyrecoveryseedphrase.suggestions.error")}
              </p>
            )}
            {seedPhrase.filter((item) => !!item).length > 0 && (
              <IonButton
                onClick={() => setClearAlertOpen(true)}
                fill="outline"
                data-testid="verify-clear-button"
                className="clear-button secondary-button"
              >
                <IonIcon
                  slot="start"
                  icon={closeOutline}
                />
                {i18n.t("verifyrecoveryseedphrase.button.clear")}
              </IonButton>
            )}
          </div>
          <PageFooter
            pageId={pageId}
            primaryButtonText={verifyButtonLabel}
            primaryButtonAction={() => handleContinue()}
            primaryButtonDisabled={
              filledSeedPhrase.length < SEED_PHRASE_LENGTH ||
              lockFailAttempt ||
              displaySuggestionError ||
              !isMatchAllSuggestion
            }
          />
        </div>
      </ScrollablePageLayout>
      <AlertFail
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-fail"
        headerText={i18n.t("verifyrecoveryseedphrase.alert.fail.text")}
        confirmButtonText={`${i18n.t(
          "verifyrecoveryseedphrase.alert.fail.button.confirm"
        )}`}
        actionConfirm={closeFailAlert}
      />
      <AlertFail
        isOpen={clearAlertOpen}
        setIsOpen={setClearAlertOpen}
        dataTestId="alert-fail"
        headerText={i18n.t("verifyrecoveryseedphrase.alert.clear.text")}
        confirmButtonText={`${i18n.t(
          "verifyrecoveryseedphrase.alert.clear.button.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "verifyrecoveryseedphrase.alert.clear.button.cancel"
        )}`}
        actionConfirm={handleClearState}
        actionCancel={closeClearAlert}
        actionDismiss={closeClearAlert}
      />
      <AlertFail
        isOpen={alertManyAttempOpen}
        setIsOpen={setAlertManyAttempOpen}
        dataTestId="alert-fail"
        headerText={i18n.t("verifyrecoveryseedphrase.alert.manyattemp.text")}
        confirmButtonText={`${i18n.t(
          "verifyrecoveryseedphrase.alert.manyattemp.button.confirm"
        )}`}
        actionConfirm={handleClearState}
        actionCancel={closeClearAlert}
        actionDismiss={closeClearAlert}
      />
    </>
  );
};

export { VerifyRecoverySeedPhrase };
