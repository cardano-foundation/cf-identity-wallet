import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { ResponsiveModal } from "../layout/ResponsiveModal";
import { PageHeader } from "../PageHeader";
import { OptionListProps, OptionModalProps } from "./OptionsModal.types";
import { combineClassNames } from "../../utils/style";
import "./OptionsModal.scss";
import { BackEventPriorityType } from "../../globals/types";

const OptionList = ({ className, data }: OptionListProps) => {
  const classNames = combineClassNames("option-list", className);
  const getOptionItemClass = (className?: string) =>
    combineClassNames("option-item", className);

  return (
    <IonList
      className={classNames}
      lines="none"
    >
      {data.map((item) => (
        <IonItem
          data-testid={item.testId}
          key={item.label}
          onClick={item.onClick}
          className={getOptionItemClass(item.className)}
        >
          <IonIcon
            icon={item.icon}
            slot="start"
          ></IonIcon>
          <IonLabel>{item.label}</IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
};

const OptionModal = ({
  header,
  items,
  children,
  customClasses,
  ...props
}: OptionModalProps) => {
  const modalClass = combineClassNames("options-modal", customClasses);
  const { hardwareBackButtonConfig, ...headerProps } = header;

  return (
    <ResponsiveModal
      customClasses={modalClass}
      {...props}
    >
      <PageHeader
        {...headerProps}
        hardwareBackButtonConfig={
          hardwareBackButtonConfig || {
            prevent: false,
            priority: BackEventPriorityType.Modal,
          }
        }
        onBack={header.onBack || props.onDismiss}
      />
      {items && items.length > 0 && <OptionList data={items} />}
      {children}
    </ResponsiveModal>
  );
};

export { OptionModal, OptionList };
