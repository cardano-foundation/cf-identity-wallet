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
} from "@ionic/react";
import { useEffect, useState } from "react";
import { combineClassNames } from "../../../../utils/style";
import { AlphabetSelector } from "../AlphabetSelector";
import { AlphabeticList } from "../AlphabeticList";
import { SearchConnectionContent } from "../SearchConnectionContent";
import "./ConnectionsBody.scss";
import { ConnectionsBodyProps } from "./ConnectionsBody.types";
import { SearchInput } from "./SearchInput";

const ConnectionsBody = ({
  mappedConnections,
  handleShowConnectionDetails,
  onSearchFocus,
}: ConnectionsBodyProps) => {
  const [search, setSearch] = useState("");
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.addListener("keyboardWillShow", () => {
        setKeyboardIsOpen(true);
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardIsOpen(false);
      });
    }
  }, []);

  const classes = combineClassNames("connections-tab-center", {
    keyboard: keyboardIsOpen,
  });

  return (
    <>
      <SearchInput
        onInputChange={setSearch}
        value={search}
        onFocus={onSearchFocus}
      />
      <div className={classes}>
        <IonContent className="connections-container">
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                {!search &&
                  mappedConnections.map((alphabeticGroup, index) => {
                    return (
                      <IonItemGroup
                        data-testid={`connection-group-${index}`}
                        className="connections-list"
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
