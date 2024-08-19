import { archiveOutline } from "ionicons/icons";
import { useParams } from "react-router-dom";
import { i18n } from "../../../i18n";
import { CredentialOptionsProps } from "./CredentialOptions.types";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";
import { OptionItem, OptionModal } from "../OptionsModal";
import { Agent } from "../../../core/agent/agent";

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

  // Temporary button for grant present ACDC
  const params: { id: string } = useParams();
  const handleGrant = async (id: string) => {
    await Agent.agent.ipexCommunications.admitGrantAcdcById(params.id);
    setOptionsIsOpen(false);
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
    {
      icon: archiveOutline,
      label: "Grant credential",
      onClick: () => {
        handleGrant(params.id);
      },
      testId: "creds-options-grant-button",
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
