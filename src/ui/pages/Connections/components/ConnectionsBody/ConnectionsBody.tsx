import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import {
  IonCol,
  IonContent,
  IonGrid,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonRow,
  IonSearchbar,
} from "@ionic/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { i18n } from "../../../../../i18n";
import { combineClassNames } from "../../../../utils/style";
import { AlphabetSelector } from "../AlphabetSelector";
import { AlphabeticList } from "../AlphabeticList";

import "./ConnectionsBody.scss";
import {
  ConnectionsBodyProps,
  SearchInputProps,
} from "./ConnectionsBody.types";
import { SearchConnectionContent } from "../SearchConnectionContent";

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

const ALPHABET_LIST_MAX_HEIGHT = 432;

const ConnectionsBody = ({
  mappedConnections,
  handleShowConnectionDetails,
  onSearchFocus,
}: ConnectionsBodyProps) => {
  const [search, setSearch] = useState("");
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const resizeAlphabet = () => {
    if (!container?.current) return;

    const contentHeight =
      container.current.querySelector(".connections-list")?.clientHeight || 0;

    if (contentHeight > ALPHABET_LIST_MAX_HEIGHT) return;

    const alphaEle = container.current.querySelector(".alphabet-selector");

    if (!alphaEle) return;

    const alphaEleHeight = alphaEle.clientHeight;

    const scale = contentHeight / alphaEleHeight;

    (alphaEle as HTMLDivElement).style.transform = `scaleY(${scale.toFixed(
      2
    )})`;
  };

  const resetAlphabetSize = () => {
    if (!container?.current) return;

    const alphaEle = container.current.querySelector(".alphabet-selector");

    alphaEle?.removeAttribute("style");
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.addListener("keyboardWillShow", () => {
        setKeyboardIsOpen(true);
      });
      Keyboard.addListener("keyboardDidShow", () => {
        resizeAlphabet();
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardIsOpen(false);
        resetAlphabetSize();
      });
    }
  }, []);

  useEffect(() => {
    if (!search) {
      resizeAlphabet();
    }
  }, [search]);

  const classes = combineClassNames("connections-body", {
    keyboard: keyboardIsOpen,
  });

  return (
    <>
      <SearchInput
        onInputChange={setSearch}
        value={search}
        onFocus={onSearchFocus}
      />
      <div
        className={classes}
        ref={container}
      >
        <IonContent className="connections-list">
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                {!search &&
                  mappedConnections.map((alphabeticGroup, index) => {
                    return (
                      <IonItemGroup
                        className="connections-list-alphabetic-block"
                        data-testid={`connection-group-${index}`}
                        key={index}
                      >
                        <IonItemDivider id={alphabeticGroup.key}>
                          <IonLabel>{alphabeticGroup.key}</IonLabel>
                        </IonItemDivider>
                        <AlphabeticList
                          items={Array.from(alphabeticGroup.value)}
                          handleShowConnectionDetails={
                            handleShowConnectionDetails
                          }
                        />
                      </IonItemGroup>
                    );
                  })}
                {search && (
                  <SearchConnectionContent
                    keyword={search}
                    mappedConnections={mappedConnections}
                    onItemClick={handleShowConnectionDetails}
                  />
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
        {!search && <AlphabetSelector />}
      </div>
    </>
  );
};

export { ConnectionsBody };
