import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { backspaceOutline } from "ionicons/icons";
import "./SetPasscode.scss";
import { PageLayout } from "../../components/common/PageLayout";
import { useState } from "react";

const SetPasscode = () => {
  const [passcode, setPasscode] = useState("");
  const [originalPassCode, setOriginalPassCode] = useState("");
  const [passcodeIsSet, setPasscodeIsSet] = useState(false);

  const handlePinChange = (digit: number) => {
    const length = passcode.length;
    if (length < 6) {
      if (passcodeIsSet && length === 5) {
        if (originalPassCode === passcode + digit) {
          console.log("passcode set ok!!");
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
              {passcodeIsSet ? "Re-enter your passcode" : "Create a passcode"}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className="description">
              Create a passcode to secure your wallet and to continue setting up
              your seed phrase
            </IonCol>
          </IonRow>
          <IonRow className="circle-row">
            {Array.from({ length: 6 }, (_, index) => {
              return (
                <div
                  key={index}
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
                  <span className="text-fadein">Passcode didn’t match</span>
                ) : null
              ) : null}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(1)}
                className="number"
              >
                1
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(2)}
                className="number"
              >
                2
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(3)}
                className="number"
              >
                3
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(4)}
                className="number"
              >
                4
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(5)}
                className="number"
              >
                5
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(6)}
                className="number"
              >
                6
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(7)}
                className="number"
              >
                7
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(8)}
                className="number"
              >
                8
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(9)}
                className="number"
              >
                9
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton onClick={() => handleRemove()}>
                <IonIcon
                  slot="icon-only"
                  icon={backspaceOutline}
                />
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                onClick={() => handlePinChange(0)}
                className="number"
              >
                0
              </IonButton>
            </IonCol>
            <IonCol/>
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
                  className="continue-button"
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

export { SetPasscode };
