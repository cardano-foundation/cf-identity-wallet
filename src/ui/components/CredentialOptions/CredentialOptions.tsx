import { useState } from "react";
import { codeSlashOutline, archiveOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { CredentialOptionsProps } from "./CredentialOptions.types";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";
import { OptionItem, OptionModal } from "../OptionsModal";
import { CredentialJsonModal } from "./components";

const CredentialOptions = ({
  cardData,
  optionsIsOpen,
  setOptionsIsOpen,
  credsOptionAction,
}: CredentialOptionsProps) => {
  const [viewIsOpen, setViewIsOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleCloseOptions = () => setOptionsIsOpen(false);
  const handleCloseView = () => setViewIsOpen(false);
  const handleDelete = () => {
    handleCloseView();
    handleCloseOptions();
    credsOptionAction();
  };

  const options: OptionItem[] = [
    {
      icon: codeSlashOutline,
      label: i18n.t("credentials.details.options.view"),
      onClick: () => {
        handleCloseOptions();
        setViewIsOpen(true);
      },
      testId: "creds-options-view-button",
    },
    {
      icon: archiveOutline,
      label: i18n.t("credentials.details.options.archive"),
      onClick: () => {
        handleDelete();
        dispatch(setCurrentOperation(OperationType.ARCHIVE_CREDENTIAL));
      },
      testId: "creds-options-archive-button",
    },
  ];

  return (
    <>
      <OptionModal
        modalIsOpen={optionsIsOpen}
        componentId="creds-options-modal"
        onDismiss={() => handleCloseOptions()}
        header={{
          title: `${i18n.t("credentials.details.options.title")}`,
        }}
        items={options}
      />
      <CredentialJsonModal
        cardData={cardData}
        isOpen={viewIsOpen}
        onDissmiss={handleCloseView}
      />
    </>
  );
};

export { CredentialOptions };
