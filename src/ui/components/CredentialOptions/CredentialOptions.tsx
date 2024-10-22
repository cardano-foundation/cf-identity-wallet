import { archiveOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { OptionItem, OptionModal } from "../OptionsModal";
import { CredentialOptionsProps } from "./CredentialOptions.types";

const CredentialOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  credsOptionAction,
}: CredentialOptionsProps) => {
  const handleCloseOptions = () => setOptionsIsOpen(false);
  const handleDelete = () => {
    handleCloseOptions();
    credsOptionAction();
  };

  const options: OptionItem[] = [
    {
      icon: archiveOutline,
      label: i18n.t("tabs.credentials.details.options.archive"),
      onClick: () => {
        handleDelete();
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
          title: `${i18n.t("tabs.credentials.details.options.title")}`,
        }}
        items={options}
      />
    </>
  );
};

export { CredentialOptions };
