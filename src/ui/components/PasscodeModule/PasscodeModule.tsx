import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { backspaceSharp } from "ionicons/icons";
import { PasscodeModuleProps } from "./PasscodeModule.types";
import "./PasscodeModule.scss";

const PasscodeModule = ({
  error,
  passcode,
  handlePinChange,
  handleRemove,
}: PasscodeModuleProps) => {
  const RenderButtons = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const labels = [
      [""],
      ["A B C"],
      ["D E F"],
      ["G H I"],
      ["J K L"],
      ["M N O"],
      ["P Q R S"],
      ["T U V"],
      ["W X Y Z"],
    ];
    const rows = [];
    let currentRow: number[] = [];

    numbers.forEach((number, index) => {
      if (index % 3 === 0) {
        rows.push(currentRow);
        currentRow = [];
      }

      currentRow.push(number);
    });

    rows.push(currentRow);

    return (
      <>
        {rows.map((row, rowIndex) => (
          <IonRow
            className="passcode-module-numbers-row"
            key={rowIndex}
          >
            {row.map((number, colIndex) => (
              <IonCol key={colIndex}>
                <IonButton
                  data-testid={`passcode-button-${number}`}
                  className="passcode-module-board-button"
                  onClick={() => handlePinChange(number)}
                >
                  <div className="passcode-module-number-button">
                    {number}
                    {labels[number - 1]?.map((label, labelIndex) => (
                      <div
                        className="passcode-module-number-labels"
                        key={labelIndex}
                      >
                        {label.split("").map((char, charIndex) => (
                          <span key={charIndex}>{char}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </IonButton>
              </IonCol>
            ))}
          </IonRow>
        ))}
      </>
    );
  };

  return (
    <IonGrid className="passcode-module-container">
      <IonRow className="passcode-module-circle-row">
        {Array.from({ length: 6 }, (_, index) => {
          return (
            <div
              key={index}
              data-testid={`circle-${index}`}
              className={`passcode-module-circle ${
                passcode.length <= index ? "" : "passcode-module-circle-fill"
              }`}
            />
          );
        })}
      </IonRow>
      <IonRow>
        <IonCol className="passcode-module-pin-error">{error}</IonCol>
      </IonRow>
      <RenderButtons />
      <IonRow className="passcode-module-numbers-row">
        <IonCol />
        <IonCol>
          <IonButton
            data-testid="passcode-button-0"
            className="passcode-module-board-button"
            onClick={() => handlePinChange(0)}
          >
            <div className="passcode-module-number-button">0</div>
          </IonButton>
        </IonCol>
        <IonCol>
          {passcode.length ? (
            <IonButton
              className="passcode-module-backspace-button"
              data-testid="setpasscode-backspace-button"
              onClick={() => handleRemove()}
            >
              <IonIcon
                slot="icon-only"
                className="passcode-module-backspace-icon"
                icon={backspaceSharp}
              />
            </IonButton>
          ) : null}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export { PasscodeModule };
