import { IonCol, IonCard, IonIcon, IonLabel } from "@ionic/react";
import { MenuItemProps } from "../Menu.types";

const MenuItem = ({
  itemKey,
  icon,
  label,
  onClick,
  subLabel,
}: MenuItemProps) => {
  return (
    <IonCol size="6">
      <IonCard
        onClick={() => onClick(itemKey)}
        data-testid={`menu-input-item-${itemKey}`}
        className="menu-input"
      >
        <div className="menu-item-icon">
          <IonIcon
            icon={icon}
            color="primary"
          />
          {subLabel && <span className="sub-label">{subLabel}</span>}
        </div>
        <IonLabel>{label}</IonLabel>
      </IonCard>
    </IonCol>
  );
};

export default MenuItem;
