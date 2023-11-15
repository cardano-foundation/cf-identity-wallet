import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { backspaceSharp } from "ionicons/icons";
import { PasscodeModuleProps } from "./PasscodeModule.types";
import "./PasscodeModule.scss";
import { passcodeMapping } from "../../constants/dictionary";

const PasscodeModule = ({
  error,
  passcode,
  handlePinChange,
  handleRemove,
}: PasscodeModuleProps) => {
  const numbers = passcodeMapping.numbers;
  const labels = passcodeMapping.labels;
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
      {rows.map((row, rowIndex) => (
        <IonRow
          className="passcode-module-numbers-row"
          key={rowIndex}
        >
          {row.map((number, colIndex) => (
            <>
              {number === numbers[9] && <IonCol />}
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
              {number === numbers[9] && (
                <IonCol>
                  {passcode !== "" && (
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
                  )}
                </IonCol>
              )}
            </>
          ))}
        </IonRow>
      ))}
    </IonGrid>
  );
};

export { PasscodeModule };
