import { IonButton } from "@ionic/react";
import {
  pencilOutline,
  refreshOutline,
  shareOutline,
  trashOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { Agent } from "../../../core/agent/agent";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { DISPLAY_NAME_LENGTH } from "../../globals/constants";
import { OperationType, ToastMsgType } from "../../globals/types";
import { IdentifierColorSelector } from "../CreateIdentifier/components/IdentifierColorSelector";
import { IdentifierThemeSelector } from "../CreateIdentifier/components/IdentifierThemeSelector";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { OptionItem, OptionModal } from "../OptionsModal";
import "./IdentifierOptions.scss";
import { IdentifierOptionsProps } from "./IdentifierOptions.types";
import { getTheme } from "../../utils/theme";
import { ShareConnection } from "../ShareConnection";

const IdentifierOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  cardData,
  setCardData,
  handleDeleteIdentifier,
  handleRotateKey,
  oobi,
}: IdentifierOptionsProps) => {
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [editorOptionsIsOpen, setEditorIsOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(cardData.displayName);
  const [newSelectedTheme, setNewSelectedTheme] = useState(0);
  const [newSelectedColor, setNewSelectedColor] = useState(0);
  const [isMultiSig, setIsMultiSig] = useState(false);
  const [shareIsOpen, setShareIsOpen] = useState(false);

  useEffect(() => {
    const identifier = identifiersData.find((data) => data.id === cardData.id);
    if (identifier && identifier.multisigManageAid) {
      setIsMultiSig(true);
    }
  }, [identifiersData, cardData.id]);

  const verifyDisplayName =
    newDisplayName.length > 0 &&
    newDisplayName.length <= DISPLAY_NAME_LENGTH &&
    (newDisplayName !== cardData.displayName ||
      newSelectedTheme !== cardData.theme);

  useEffect(() => {
    setNewDisplayName(cardData.displayName);
  }, [cardData.displayName]);

  useEffect(() => {
    const theme = getTheme(cardData.theme);

    setNewSelectedColor(Number(theme.color));
    setNewSelectedTheme(Number(theme.layout));
  }, [cardData.theme, editorOptionsIsOpen]);

  const handleClose = () => {
    setEditorIsOpen(false);
    setOptionsIsOpen(false);
  };

  const handleDelete = () => {
    handleDeleteIdentifier();
    setOptionsIsOpen(false);
  };

  const handleSubmit = async () => {
    setEditorIsOpen(false);
    setOptionsIsOpen(false);
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
    dispatch(setIdentifiersCache(updatedIdentifiers));
    dispatch(setToastMsg(ToastMsgType.IDENTIFIER_UPDATED));
  };

  const rotateKey = () => {
    setOptionsIsOpen(false);
    handleRotateKey();
  };

  const updateIdentifier = () => {
    dispatch(setCurrentOperation(OperationType.UPDATE_IDENTIFIER));
    setNewDisplayName(cardData.displayName);
    setOptionsIsOpen(false);
    setEditorIsOpen(true);
  };

  const deleteIdentifier = () => {
    setOptionsIsOpen(false);
    handleDelete();
    dispatch(setCurrentOperation(OperationType.DELETE_IDENTIFIER));
  };

  const dismissModal = () => {
    setEditorIsOpen(false);
    setNewDisplayName(cardData.displayName);
    setNewSelectedTheme(cardData.theme);
  };

  const closeModal = () => {
    handleClose();
    dispatch(setCurrentOperation(OperationType.IDLE));
  };

  const optionsRotate: OptionItem[] = [
    {
      icon: pencilOutline,
      label: i18n.t("identifiers.details.options.edit"),
      onClick: updateIdentifier,
      testId: "edit-identifier-option",
    },
    {
      icon: refreshOutline,
      label: i18n.t("identifiers.details.options.rotatekeys"),
      onClick: rotateKey,
      testId: "rotate-keys-option",
    },
    {
      icon: shareOutline,
      label: i18n.t("identifiers.details.options.share"),
      onClick: () => setShareIsOpen(true),
      testId: "share-identifier-option",
    },
    {
      icon: trashOutline,
      label: i18n.t("identifiers.details.options.delete"),
      onClick: deleteIdentifier,
      testId: "delete-identifier-option",
    },
  ];

  const optionsNoRotate = optionsRotate.filter(
    (option) => option.testId !== "rotate-keys-option"
  );

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.setResizeMode({
        mode: KeyboardResize.None,
      });

      return () => {
        Keyboard.setResizeMode({
          mode: KeyboardResize.Native,
        });
      };
    }
  }, []);

  return (
    <>
      <OptionModal
        modalIsOpen={optionsIsOpen}
        componentId="identifier-options-modal"
        onDismiss={() => setOptionsIsOpen(false)}
        header={{
          title: `${i18n.t("identifiers.details.options.title")}`,
        }}
        items={isMultiSig ? optionsNoRotate : optionsRotate}
      />
      <OptionModal
        modalIsOpen={editorOptionsIsOpen}
        customClasses="edit-identifier"
        onDismiss={dismissModal}
        componentId="edit-identifier-modal"
        header={{
          closeButton: true,
          closeButtonLabel: `${i18n.t("identifiers.details.options.cancel")}`,
          closeButtonAction: closeModal,
          title: `${i18n.t("identifiers.details.options.edit")}`,
        }}
      >
        <div
          className={`indentifier-input${
            newDisplayName.length > DISPLAY_NAME_LENGTH ? " has-error" : ""
          }`}
        >
          <CustomInput
            dataTestId="edit-name-input"
            title={`${i18n.t("identifiers.details.options.inner.label")}`}
            hiddenInput={false}
            autofocus={true}
            onChangeInput={setNewDisplayName}
            value={newDisplayName}
          />
          {newDisplayName.length > DISPLAY_NAME_LENGTH ? (
            <ErrorMessage
              message={`${i18n.t("identifiers.details.options.inner.error")}`}
              timeout={false}
            />
          ) : null}
        </div>
        <span className="theme-input-title">{`${i18n.t(
          "identifiers.details.options.inner.color"
        )}`}</span>
        <div className="card-theme">
          <IdentifierColorSelector
            value={newSelectedColor}
            onColorChange={setNewSelectedColor}
          />
        </div>
        <span className="theme-input-title">{`${i18n.t(
          "identifiers.details.options.inner.theme"
        )}`}</span>
        <div className="card-theme">
          <IdentifierThemeSelector
            color={newSelectedColor}
            selectedTheme={newSelectedTheme}
            setSelectedTheme={setNewSelectedTheme}
          />
        </div>
        <IonButton
          shape="round"
          expand="block"
          className="primary-button confirm-edit-button"
          data-testid="continue-button"
          onClick={handleSubmit}
          disabled={!verifyDisplayName}
        >
          {i18n.t("identifiers.details.options.inner.confirm")}
        </IonButton>
      </OptionModal>
      <ShareConnection
        isOpen={shareIsOpen}
        setIsOpen={setShareIsOpen}
        oobi={oobi}
      />
    </>
  );
};

export { IdentifierOptions };
