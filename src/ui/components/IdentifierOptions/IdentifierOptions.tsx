import {
  pencilOutline,
  refreshOutline,
  shareOutline,
  trashOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getIdentifiersCache } from "../../../store/reducers/identifiersCache";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";
import { EditIdentifier } from "../EditIdentifier";
import { OptionItem, OptionModal } from "../OptionsModal";
import { ShareConnection } from "../ShareConnection";
import "./IdentifierOptions.scss";
import { IdentifierOptionsProps } from "./IdentifierOptions.types";

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
  const [isMultiSig, setIsMultiSig] = useState(false);
  const [shareIsOpen, setShareIsOpen] = useState(false);

  useEffect(() => {
    const identifier = identifiersData.find((data) => data.id === cardData.id);
    if (identifier && identifier.multisigManageAid) {
      setIsMultiSig(true);
    }
  }, [identifiersData, cardData.id]);

  const handleDelete = () => {
    handleDeleteIdentifier();
    setOptionsIsOpen(false);
  };

  const rotateKey = () => {
    setOptionsIsOpen(false);
    handleRotateKey();
  };

  const updateIdentifier = () => {
    dispatch(setCurrentOperation(OperationType.UPDATE_IDENTIFIER));
    setOptionsIsOpen(false);
    setEditorIsOpen(true);
  };

  const deleteIdentifier = () => {
    setOptionsIsOpen(false);
    handleDelete();
    dispatch(setCurrentOperation(OperationType.DELETE_IDENTIFIER));
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
      <EditIdentifier
        modalIsOpen={editorOptionsIsOpen}
        setModalIsOpen={setEditorIsOpen}
        setCardData={setCardData}
        cardData={cardData}
      />
      <ShareConnection
        isOpen={shareIsOpen}
        setIsOpen={setShareIsOpen}
        oobi={oobi}
      />
    </>
  );
};

export { IdentifierOptions };
