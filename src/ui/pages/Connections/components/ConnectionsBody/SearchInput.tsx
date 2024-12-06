import { IonSearchbar } from "@ionic/react";
import { useMemo } from "react";
import { i18n } from "../../../../../i18n";
import "./ConnectionsBody.scss";
import { SearchInputProps } from "./ConnectionsBody.types";

const SearchInput = ({ onFocus, onInputChange, value }: SearchInputProps) => {
  const showCancel = useMemo(() => {
    if (value) {
      return "always";
    }

    return value ? "always" : "focus";
  }, [value]);

  const handleBlur = () => {
    if (value) return;
    onFocus?.(false);
  };

  const handleCancer = () => {
    onFocus?.(false);
  };

  return (
    <IonSearchbar
      className="connection-search-input"
      data-testid="search-bar"
      showCancelButton={showCancel}
      onIonCancel={handleCancer}
      debounce={100}
      onIonFocus={() => onFocus?.(true)}
      onIonBlur={handleBlur}
      value={value}
      onIonInput={(e) => {
        onInputChange(e.target.value || "");
      }}
      placeholder={`${i18n.t("connections.page.search.placeholder")}`}
    />
  );
};

export { SearchInput };
