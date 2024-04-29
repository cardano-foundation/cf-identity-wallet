import { pencilOutline, trashOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { ConnectionOptionsProps } from "./ConnectionOptions.types";
import "./ConnectionOptions.scss";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";
import { useAppDispatch } from "../../../store/hooks";
import { OptionItem, OptionModal } from "../OptionsModal";

const ConnectionOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  handleEdit,
  handleDelete,
}: ConnectionOptionsProps) => {
  const dispatch = useAppDispatch();

  const options: OptionItem[] = [
    {
      icon: pencilOutline,
      label: i18n.t("connections.details.options.labels.manage"),
      onClick: () => {
        setOptionsIsOpen(false);
        handleEdit(true);
      },
      testId: "connection-options-manage-button",
    },
    {
      icon: trashOutline,
      label: i18n.t("connections.details.options.labels.delete"),
      onClick: () => {
        handleDelete();
        dispatch(setCurrentOperation(OperationType.DELETE_CONNECTION));
      },
      testId: "delete-button-connection-options",
    },
  ];

  return (
    <OptionModal
      modalIsOpen={optionsIsOpen}
      componentId="connection-options-modal"
      onDismiss={() => setOptionsIsOpen(false)}
      header={{
        title: `${i18n.t("connections.details.options.title")}`,
      }}
      items={options}
    />
  );
};

export { ConnectionOptions };
