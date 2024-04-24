import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { ResponsiveModal } from "../layout/ResponsiveModal";
import { PageHeader } from "../PageHeader";
import { OptionModalProps } from "./OptionsModal.types";
import { combineClassNames } from "../../utils/style";
import "./OptionsModal.scss";

const OptionModal = ({
  header,
  items,
  children,
  customClasses,
  ...props
}: OptionModalProps) => {
  const getOptionItemClass = (className?: string) =>
    combineClassNames("option-item", className);
  const modalClass = combineClassNames("options-modal", customClasses);

  return (
    <ResponsiveModal
      customClasses={modalClass}
      {...props}
    >
      <PageHeader {...header} />
      {items && items.length > 0 && (
        <IonList
          className="option-list"
          lines="none"
        >
          {items.map((item) => (
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
      )}
      {children}
    </ResponsiveModal>
  );
};

export { OptionModal };
