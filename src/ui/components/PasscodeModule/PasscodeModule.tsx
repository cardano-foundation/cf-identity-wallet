import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { backspaceSharp } from "ionicons/icons";
import { PasscodeModuleProps } from "./PasscodeModule.types";
import "./PasscodeModule.scss";

const PasscodeModule = ({
  title,
  description,
  error,
  passcode,
  handlePinChange,
  handleRemove,
}: PasscodeModuleProps) => {
  return (
    <IonGrid className="passcode-module">
      <IonRow>
        <IonCol className="title">{title}</IonCol>
      </IonRow>
      <IonRow>
        <IonCol className="description">{description}</IonCol>
      </IonRow>
      <IonRow className="circle-row">
        {Array.from({ length: 6 }, (_, index) => {
          return (
            <div
              key={index}
              data-testid={`circle-${index}`}
              className={`circle ${
                passcode.length <= index ? "" : "circle-fill"
              }`}
            />
          );
        })}
      </IonRow>
      <IonRow>
        <IonCol className="pin-error">{error}</IonCol>
      </IonRow>
      <IonRow className="numbers-row">
        <IonCol>
          <IonButton
            data-testid="passcode-button-1"
            className="board-button"
            onClick={() => handlePinChange(1)}
          >
            <div className="number-button">1</div>
          </IonButton>
        </IonCol>
        <IonCol>
          <IonButton
            data-testid="passcode-button-2"
            className="board-button"
            onClick={() => handlePinChange(2)}
          >
            <div className="number-button">
              2
              <div className="number-labels">
                <span>A</span>
                <span>B</span>
                <span>C</span>
              </div>
            </div>
          </IonButton>
        </IonCol>
        <IonCol>
          <IonButton
            data-testid="passcode-button-3"
            className="board-button"
            onClick={() => handlePinChange(3)}
          >
            <div className="number-button">
              3
              <div className="number-labels">
                <span>D</span>
                <span>E</span>
                <span>F</span>
              </div>
            </div>
          </IonButton>
        </IonCol>
      </IonRow>
      <IonRow className="numbers-row">
        <IonCol>
          <IonButton
            data-testid="passcode-button-4"
            className="board-button"
            onClick={() => handlePinChange(4)}
          >
            <div className="number-button">
              4
              <div className="number-labels">
                <span>G</span>
                <span>H</span>
                <span>I</span>
              </div>
            </div>
          </IonButton>
        </IonCol>
        <IonCol>
          <IonButton
            data-testid="passcode-button-5"
            className="board-button"
            onClick={() => handlePinChange(5)}
          >
            <div className="number-button">
              5
              <div className="number-labels">
                <span>J</span>
                <span>K</span>
                <span>L</span>
              </div>
            </div>
          </IonButton>
        </IonCol>
        <IonCol>
          <IonButton
            data-testid="passcode-button-6"
            className="board-button"
            onClick={() => handlePinChange(6)}
          >
            <div className="number-button">
              6
              <div className="number-labels">
                <span>M</span>
                <span>N</span>
                <span>O</span>
              </div>
            </div>
          </IonButton>
        </IonCol>
      </IonRow>
      <IonRow className="numbers-row">
        <IonCol>
          <IonButton
            data-testid="passcode-button-6"
            className="board-button"
            onClick={() => handlePinChange(7)}
          >
            <div className="number-button">
              7
              <div className="number-labels">
                <span>P</span>
                <span>Q</span>
                <span>R</span>
                <span>S</span>
              </div>
            </div>
          </IonButton>
        </IonCol>
        <IonCol>
          <IonButton
            data-testid="passcode-button-8"
            className="board-button"
            onClick={() => handlePinChange(8)}
          >
            <div className="number-button">
              8
              <div className="number-labels">
                <span>T</span>
                <span>U</span>
                <span>V</span>
              </div>
            </div>
          </IonButton>
        </IonCol>
        <IonCol>
          <IonButton
            data-testid="passcode-button-9"
            className="board-button"
            onClick={() => handlePinChange(9)}
          >
            <div className="number-button">
              9
              <div className="number-labels">
                <span>W</span>
                <span>X</span>
                <span>Y</span>
                <span>Z</span>
              </div>
            </div>
          </IonButton>
        </IonCol>
      </IonRow>
      <IonRow className="numbers-row">
        <IonCol />
        <IonCol>
          <IonButton
            data-testid="passcode-button-0"
            className="board-button"
            onClick={() => handlePinChange(0)}
          >
            <div className="number-button">0</div>
          </IonButton>
        </IonCol>
        <IonCol>
          {passcode.length ? (
            <IonButton
              className="backspace-button"
              data-testid="setpasscode-backspace-button"
              onClick={() => handleRemove()}
            >
              <IonIcon
                slot="icon-only"
                className="backspace-icon"
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
