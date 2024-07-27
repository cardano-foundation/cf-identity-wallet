import { IonIcon, IonItem, IonLabel, IonNote } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import { SettingsItemProps } from "../Settings.types";

const SettingsItem = ({ item, handleOptionClick }: SettingsItemProps) => {
  return (
    <IonItem
      onClick={() => handleOptionClick(item)}
      className="settings-item"
      data-testid={`settings-item-${item.index}`}
    >
      <IonIcon
        aria-hidden="true"
        icon={item.icon}
        slot="start"
      />
      <IonLabel>{item.label}</IonLabel>
      {item.actionIcon ? (
        item.actionIcon
      ) : item.note ? (
        <IonNote slot="end">{item.note}</IonNote>
      ) : (
        <IonIcon
          aria-hidden="true"
          icon={chevronForward}
          slot="end"
        />
      )}
    </IonItem>
  );
};

export { SettingsItem };
