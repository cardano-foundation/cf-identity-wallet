import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { Share } from "@capacitor/share";
import { IonButton } from "@ionic/react";
import {
  codeSlashOutline,
  pencilOutline,
  shareOutline,
  trashOutline,
  refreshOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
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
import { IdentifierThemeSelector } from "../CreateIdentifier/components/IdentifierThemeSelector";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { OptionItem, OptionModal } from "../OptionsModal";
import "./IdentifierOptions.scss";
import { IdentifierOptionsProps } from "./IdentifierOptions.types";
import { IdentifierJsonModal } from "./components";
import { RotateKeyModal } from "../../pages/IdentifierDetails/components/RotateKeyModal/RotateKeyModal";

const IdentifierOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  cardData,
  setCardData,
  handleDeleteIdentifier,
  handleRotateKey,
}: IdentifierOptionsProps) => {
  const dispatch = useAppDispatch();
  const identifierData = useAppSelector(getIdentifiersCache);
  const [editorOptionsIsOpen, setEditorIsOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(cardData.displayName);
  const [newSelectedTheme, setNewSelectedTheme] = useState(cardData.theme);
  const [viewIsOpen, setViewIsOpen] = useState(false);
  const [keyboardIsOpen, setkeyboardIsOpen] = useState(false);

  const verifyDisplayName =
    newDisplayName.length > 0 &&
    newDisplayName.length <= DISPLAY_NAME_LENGTH &&
    (newDisplayName !== cardData.displayName ||
      newSelectedTheme !== cardData.theme);

  useEffect(() => {
    setNewDisplayName(cardData.displayName);
  }, [cardData.displayName]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.addListener("keyboardWillShow", () => {
        setkeyboardIsOpen(true);
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setkeyboardIsOpen(false);
      });
    }
  }, []);

  useEffect(() => {
    setNewSelectedTheme(cardData.theme);
  }, [editorOptionsIsOpen]);

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
    const updatedIdentifiers = [...identifierData];
    const index = updatedIdentifiers.findIndex(
      (identifier) => identifier.id === cardData.id
    );
    updatedIdentifiers[index] = {
      ...updatedIdentifiers[index],
      displayName: newDisplayName,
      theme: newSelectedTheme,
    };
    await Agent.agent.identifiers.updateIdentifier(cardData.id, {
      displayName: newDisplayName,
      theme: newSelectedTheme,
    });
    setCardData({
      ...cardData,
      displayName: newDisplayName,
      theme: newSelectedTheme,
    });
    dispatch(setIdentifiersCache(updatedIdentifiers));
    dispatch(setToastMsg(ToastMsgType.IDENTIFIER_UPDATED));
  };

  const options: OptionItem[] = [
    {
      icon: codeSlashOutline,
      label: i18n.t("identifiers.details.options.view"),
      onClick: () => {
        setOptionsIsOpen(false);
        setViewIsOpen(true);
      },
      testId: "view-json-identifier-options",
    },
    {
      icon: pencilOutline,
      label: i18n.t("identifiers.details.options.edit"),
      onClick: () => {
        dispatch(setCurrentOperation(OperationType.UPDATE_IDENTIFIER));
        setNewDisplayName(cardData.displayName);
        setOptionsIsOpen(false);
        setEditorIsOpen(true);
      },
      testId: "edit-identifier-options",
    },
    {
      icon: refreshOutline,
      label: i18n.t("identifiers.details.options.rotatekeys"),
      onClick: () => {
        setOptionsIsOpen(false);
        handleRotateKey();
      },
      testId: "rotate-keys",
    },
    {
      icon: shareOutline,
      label: i18n.t("identifiers.details.options.share"),
      onClick: async () => {
        await Share.share({
          text: cardData.displayName + " " + cardData.id,
        });
      },
      testId: "share-identifier-options",
    },
    {
      icon: trashOutline,
      label: i18n.t("identifiers.details.options.delete"),
      onClick: () => {
        setOptionsIsOpen(false);
        handleDelete();
        dispatch(setCurrentOperation(OperationType.DELETE_IDENTIFIER));
      },
      testId: "delete-identifier-options",
    },
  ];

  return (
    <>
      <OptionModal
        modalIsOpen={optionsIsOpen}
        componentId="identifier-options-modal"
        onDismiss={() => setOptionsIsOpen(false)}
        header={{
          title: `${i18n.t("identifiers.details.options.title")}`,
        }}
        items={options}
      />
      <OptionModal
        modalIsOpen={editorOptionsIsOpen}
        customClasses="edit-identifier"
        onDismiss={() => {
          setEditorIsOpen(false);
          setNewDisplayName(cardData.displayName);
          setNewSelectedTheme(cardData.theme);
        }}
        componentId="edit-identifier-modal"
        header={{
          closeButton: true,
          closeButtonLabel: `${i18n.t("identifiers.details.options.cancel")}`,
          closeButtonAction: () => {
            handleClose();
            dispatch(setCurrentOperation(OperationType.IDLE));
          },
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
          "identifiers.details.options.inner.theme"
        )}`}</span>
        <div className="card-theme">
          <IdentifierThemeSelector
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
      <IdentifierJsonModal
        cardData={cardData}
        isOpen={viewIsOpen}
        onDissmiss={() => setViewIsOpen(false)}
      />
    </>
  );
};

export { IdentifierOptions };
