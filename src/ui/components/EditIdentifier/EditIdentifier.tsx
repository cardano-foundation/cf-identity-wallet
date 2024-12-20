import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { IonModal, IonSpinner } from "@ionic/react";
import { useEffect, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { DISPLAY_NAME_LENGTH } from "../../globals/constants";
import { ToastMsgType } from "../../globals/types";
import { createThemeValue, getTheme } from "../../utils/theme";
import { IdentifierColorSelector } from "../CreateIdentifier/components/IdentifierColorSelector";
import { IdentifierThemeSelector } from "../CreateIdentifier/components/IdentifierThemeSelector";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { ScrollablePageLayout } from "../layout/ScrollablePageLayout";
import { PageFooter } from "../PageFooter";
import { PageHeader } from "../PageHeader";
import "./EditIdentifier.scss";
import { EditIdentifierProps } from "./EditIdentifier.types";
import { showError } from "../../utils/error";
import { IdentifierService } from "../../../core/agent/services";
import { nameChecker } from "../../utils/nameChecker";

const EditIdentifier = ({
  modalIsOpen,
  setModalIsOpen,
  cardData,
  setCardData,
}: EditIdentifierProps) => {
  const pageId = "edit-identifier";
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [isLoading, setLoading] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(cardData.displayName);
  const [newSelectedTheme, setNewSelectedTheme] = useState(0);
  const [newSelectedColor, setNewSelectedColor] = useState(0);
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);

  const [duplicateName, setDuplicateName] = useState(false);
  const [inputChange, setInputChange] = useState(false);
  const localValidateMessage = inputChange ? nameChecker.getError(newDisplayName) : undefined;

  useEffect(() => {
    if (Capacitor.isNativePlatform() && modalIsOpen) {
      Keyboard.addListener("keyboardWillShow", () => {
        setKeyboardIsOpen(true);
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardIsOpen(false);
      });

      return () => {
        Keyboard.removeAllListeners();
      };
    }
  }, [modalIsOpen]);

  const handleCancel = async () => {
    setModalIsOpen(false);
  };

  const verifyDisplayName =
    newDisplayName.length > 0 &&
    newDisplayName.length <= DISPLAY_NAME_LENGTH &&
    (newDisplayName !== cardData.displayName ||
      createThemeValue(newSelectedColor, newSelectedTheme) !== cardData.theme);

  useEffect(() => {
    setNewDisplayName(cardData.displayName);
  }, [cardData.displayName]);

  useEffect(() => {
    const theme = getTheme(cardData.theme);

    setNewSelectedColor(Number(theme.color));
    setNewSelectedTheme(Number(theme.layout));
  }, [cardData.theme]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const updatedIdentifiers = [...identifiersData];
      const index = updatedIdentifiers.findIndex(
        (identifier) => identifier.id === cardData.id
      );
      const theme = Number(`${newSelectedColor}${newSelectedTheme}`);
      updatedIdentifiers[index] = {
        ...updatedIdentifiers[index],
        displayName: newDisplayName,
        theme,
      };
      await Agent.agent.identifiers.updateIdentifier(cardData.id, {
        displayName: newDisplayName,
        theme,
      });
      setCardData({
        ...cardData,
        displayName: newDisplayName,
        theme,
      });
      handleCancel();
      dispatch(setIdentifiersCache(updatedIdentifiers));
      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_UPDATED));
    } catch (e) {
      if((e as Error).message.includes(IdentifierService.IDENTIFIER_NAME_TAKEN)) {
        setDuplicateName(true);
        return;
      }

      showError(
        "Unable to edit identifier",
        e,
        dispatch,
        ToastMsgType.UNABLE_EDIT_IDENTIFIER
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeName = (value: string) => {
    setNewDisplayName(value);
    setInputChange(true);
    setDuplicateName(false);
  }

  const hasError = localValidateMessage || duplicateName;
  const errorMessage = localValidateMessage || `${i18n.t("nameerror.duplicatename")}`;

  return (
    <IonModal
      isOpen={modalIsOpen}
      className={`${pageId}-modal full-page-modal ${isLoading ? "blur" : ""}`}
      data-testid={`${pageId}-modal`}
    >
      <ScrollablePageLayout
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleCancel}
            closeButtonLabel={`${i18n.t(
              "tabs.identifiers.details.options.cancel"
            )}`}
            title={`${i18n.t("tabs.identifiers.details.options.edit")}`}
          />
        }
        pageId={pageId}
        footer={
          <PageFooter
            customClass={keyboardIsOpen ? "ion-hide" : undefined}
            pageId={pageId}
            primaryButtonText={`${i18n.t(
              "tabs.identifiers.details.options.inner.confirm"
            )}`}
            primaryButtonAction={handleSubmit}
            primaryButtonDisabled={!verifyDisplayName}
          />
        }
      >
        <div
          className={`indentifier-input${
            hasError ? " has-error" : ""
          }`}
        >
          <CustomInput
            dataTestId="edit-name-input"
            title={`${i18n.t("tabs.identifiers.details.options.inner.label")}`}
            hiddenInput={false}
            autofocus={true}
            onChangeInput={handleChangeName}
            value={newDisplayName}
          />
          {hasError ? (
            <ErrorMessage
              message={errorMessage}
              timeout={false}
            />
          ) : null}
        </div>
        <span className="theme-input-title">{`${i18n.t(
          "tabs.identifiers.details.options.inner.color"
        )}`}</span>
        <div className="card-theme">
          <IdentifierColorSelector
            value={newSelectedColor}
            onColorChange={setNewSelectedColor}
          />
        </div>
        <span className="theme-input-title">{`${i18n.t(
          "tabs.identifiers.details.options.inner.theme"
        )}`}</span>
        <div className="card-theme">
          <IdentifierThemeSelector
            color={newSelectedColor}
            selectedTheme={newSelectedTheme}
            setSelectedTheme={setNewSelectedTheme}
          />
        </div>
      </ScrollablePageLayout>
      {isLoading && (
        <div
          className="spinner-container"
          data-testid="spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      )}
    </IonModal>
  );
};

export { EditIdentifier };