import { archiveOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { CredentialOptionsProps } from "./CredentialOptions.types";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";
import { OptionItem, OptionModal } from "../OptionsModal";

const CredentialOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  credsOptionAction,
}: CredentialOptionsProps) => {
  const dispatch = useAppDispatch();

  const handleCloseOptions = () => setOptionsIsOpen(false);
  const handleDelete = () => {
    handleCloseOptions();
    credsOptionAction();
  };

  const options: OptionItem[] = [
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
    </>
  );
};

export { CredentialOptions };
