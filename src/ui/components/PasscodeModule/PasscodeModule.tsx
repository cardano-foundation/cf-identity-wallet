import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { backspaceSharp, fingerPrintSharp } from "ionicons/icons";
import { PasscodeModuleProps } from "./PasscodeModule.types";
import "./PasscodeModule.scss";
import { PASSCODE_MAPPING } from "../../globals/types";
import { useBiometricAuth } from "../../hooks/useBiometrics";

const PasscodeModule = ({
  error,
  passcode,
  handlePinChange,
  handleRemove,
  handleBiometricButtonClick,
}: PasscodeModuleProps) => {
  const { biometricInfo } = useBiometricAuth();
  const numbers = PASSCODE_MAPPING.numbers;
  const labels = PASSCODE_MAPPING.labels;
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

  const handleBiometricButton = () => {
    handleBiometricButtonClick && handleBiometricButtonClick();
  };

  return (
    <>
      <div className="passcode-module-circle-row">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            data-testid={`circle-${index}`}
            className={`passcode-module-circle ${
              passcode.length <= index ? "" : "passcode-module-circle-fill"
            }`}
          />
        ))}
      </div>
      {error}
      <IonGrid className="passcode-module-container">
        {rows.map(
          (row, rowIndex) =>
            rowIndex !== 0 && (
              <IonRow
                className={`passcode-module-numbers-row ${rowIndex}`}
                key={rowIndex}
              >
                {rowIndex === rows.length - 1 && (
                  <IonCol>
                    {handleBiometricButtonClick &&
                    biometricInfo?.isAvailable ? (
                        <IonButton
                          data-testid={"passcode-button-#"}
                          className="passcode-module-number-button"
                          onClick={() => handleBiometricButton()}
                          style={{
                            opacity: biometricInfo.strongBiometryIsAvailable
                              ? 1
                              : 0.3,
                          }}
                        >
                          <IonIcon
                            slot="icon-only"
                            className="passcode-module-fingerprint-icon"
                            icon={fingerPrintSharp}
                          />
                        </IonButton>
                      ) : null}
                  </IonCol>
                )}

                {row.map((number, colIndex) => (
                  <IonCol key={colIndex}>
                    <IonButton
                      data-testid={`passcode-button-${number}`}
                      className="passcode-module-number-button"
                      onClick={() => handlePinChange(number)}
                    >
                      <div className="passcode-module-number-button-inner">
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
                {rowIndex === rows.length - 1 && (
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
              </IonRow>
            )
        )}
      </IonGrid>
    </>
  );
};

export { PasscodeModule };
