import { IonChip } from "@ionic/react";
import { FilterChipProps } from "./FilterChip.types";
import "./FilterChip.scss";

const FilterChip = ({ filter, label, isActive, onClick }: FilterChipProps) => (
  <span className="filter-chip">
    <IonChip
      className={isActive ? "selected" : ""}
      onClick={() => onClick(filter)}
      data-testid={`${filter}-filter-btn`}
    >
      {label}
    </IonChip>
  </span>
);

export { FilterChip };
