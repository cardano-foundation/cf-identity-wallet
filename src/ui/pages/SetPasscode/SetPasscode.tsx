import { useEffect, useState } from "react";
import {IonButton, IonCol, IonGrid, IonIcon, IonLabel, IonRow} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { backspaceSharp } from "ionicons/icons";
import "./SetPasscode.scss";
import { PageLayout } from "../../components/common/PageLayout";

const ENTER_PASSCODE_LABEL = "Create a passcode";
const REENTER_PASSCODE_LABEL = "Re-enter your passcode";
const ENTER_PASSCODE_DESCRIPTION =
  "Create a passcode to secure your wallet and to continue setting up your seed phrase";
const ENTER_PASSCODE_ERROR = "Passcode didnt match";

const ErrorMessage = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      data-testid="error-messsage"
      className={`error-message ${visible ? "visible" : ""}`}
    >
      <IonLabel className="text-fadein" color="danger">{message}</IonLabel>
    </div>
  );
};

export default ErrorMessage;

const SetPasscode = () => {
  const history = useHistory();

  const [passcode, setPasscode] = useState("");
  const [originalPassCode, setOriginalPassCode] = useState("");
  const [passcodeIsSet, setPasscodeIsSet] = useState(false);

  const handlePinChange = (digit: number) => {
    const length = passcode.length;
    if (length < 6) {
      if (passcodeIsSet && length === 5) {
        if (originalPassCode === passcode + digit) {
          history.push("/generateseedphrase");
        }
      }
      setPasscode(passcode + digit);
    }
  };

  const handleRemove = () => {
    if (passcode.length >= 1) {
      setPasscode(passcode.substring(0, passcode.length - 1));
    }
  };

  const handleContinue = () => {
    if (passcode.length === 6) {
      setPasscodeIsSet(true);
      setOriginalPassCode(passcode);
      setPasscode("");
    }
  };

  return (
    <>
      <PageLayout
        backButton={true}
        backButtonPath={"/"}
        contentClasses=""
        progressBar={true}
        progressBarValue={0.3}
        progressBarBuffer={1}
      >
        <IonGrid className="passcode-page">
          <IonRow>
            <IonCol className="title">
              {passcodeIsSet ? REENTER_PASSCODE_LABEL : ENTER_PASSCODE_LABEL}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className="description">
              {ENTER_PASSCODE_DESCRIPTION}
            </IonCol>
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
            <IonCol className="pin-error">
              {passcodeIsSet ? (
                passcode.length === 6 && originalPassCode !== passcode ? (
                  <ErrorMessage message={ENTER_PASSCODE_ERROR} />
                ) : null
              ) : null}
            </IonCol>
          </IonRow>
          <IonRow className="numbers-row">
            <IonCol>
              <IonButton className="board-button" onClick={() => handlePinChange(1)}>
                <div className="number-button">1</div>
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton className="board-button" onClick={() => handlePinChange(2)}>
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
              <IonButton className="board-button" onClick={() => handlePinChange(3)}>
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
              <IonButton className="board-button" onClick={() => handlePinChange(4)}>
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
              <IonButton className="board-button" onClick={() => handlePinChange(5)}>
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
              <IonButton className="board-button" onClick={() => handlePinChange(6)}>
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
              <IonButton className="board-button" onClick={() => handlePinChange(7)}>
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
              <IonButton className="board-button" onClick={() => handlePinChange(8)}>
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
              <IonButton className="board-button" onClick={() => handlePinChange(9)}>
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
            <IonCol>
              <IonButton
                className="backspace-button"
                data-testid="backspace-button"
                onClick={() => handleRemove()}
              >
                <IonIcon
                  slot="icon-only"
                  className="backspace-icon"
                  icon={backspaceSharp}
                />
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton className="board-button" onClick={() => handlePinChange(0)}>
                <div className="number-button">0</div>
              </IonButton>
            </IonCol>
            <IonCol />
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol className="continue-col">
              {!passcodeIsSet ? (
                <IonButton
                  onClick={() => handleContinue()}
                  disabled={passcode.length < 6}
                  shape="round"
                  expand="block"
                  className="ion-primary-button continue-button"
                  data-testid="continue-button"
                >
                  Continue
                </IonButton>
              ) : null}
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
    </>
  );
};

export {
  SetPasscode,
  ENTER_PASSCODE_LABEL,
  REENTER_PASSCODE_LABEL,
  ENTER_PASSCODE_DESCRIPTION,
  ENTER_PASSCODE_ERROR,
};
