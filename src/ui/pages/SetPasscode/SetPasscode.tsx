import { useState } from "react";
import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { backspaceSharp } from "ionicons/icons";
import { randomBytes } from "crypto";
import { Argon2, Argon2Mode } from "@sphereon/isomorphic-argon2";
import { i18n } from "../../../i18n";
import "./SetPasscode.scss";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import {
  SecureStorage,
  KeyStoreKeys,
} from "../../../core/storage/secureStorage";
import { GENERATE_SEED_PHRASE_ROUTE } from "../../../routes";

// Based on OWASP recommendations
const ARGON2ID_OPTIONS = {
  mode: Argon2Mode.Argon2id,
  memory: 19456,
  iterations: 2,
  parallelism: 1,
};

const SetPasscode = () => {
  const history = useHistory();
  const [passcode, setPasscode] = useState("");
  const [originalPassCode, setOriginalPassCode] = useState("");

  const handlePinChange = (digit: number) => {
    const length = passcode.length;
    if (length < 6) {
      if (originalPassCode !== "" && length === 5) {
        if (originalPassCode === passcode + digit) {
          Argon2.hash(originalPassCode, randomBytes(16), ARGON2ID_OPTIONS).then(
            (hash) => {
              SecureStorage.set(KeyStoreKeys.APP_PASSCODE, hash.encoded).then(
                () => {
                  handleClear();
                  history.push(GENERATE_SEED_PHRASE_ROUTE);
                  return;
                }
              );
            }
          );
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

  const handleClear = () => {
    setPasscode("");
    setOriginalPassCode("");
  };

  const handleContinue = () => {
    if (passcode.length === 6) {
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
              {originalPassCode !== ""
                ? i18n.t("setpasscode.reenterpasscode.label")
                : i18n.t("setpasscode.enterpasscode.label")}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className="description">
              {i18n.t("setpasscode.enterpasscode.description")}
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
              {originalPassCode !== "" ? (
                passcode.length === 6 && originalPassCode !== passcode ? (
                  <ErrorMessage
                    message={i18n.t("setpasscode.enterpasscode.error")}
                  />
                ) : null
              ) : null}
            </IonCol>
          </IonRow>
          <IonRow className="numbers-row">
            <IonCol>
              <IonButton
                className="board-button"
                onClick={() => handlePinChange(1)}
              >
                <div className="number-button">1</div>
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
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
        <IonGrid>
          <IonRow>
            <IonCol className="continue-col">
              {!(originalPassCode !== "") ? (
                <IonButton
                  onClick={() => handleContinue()}
                  disabled={passcode.length < 6}
                  shape="round"
                  expand="block"
                  className="ion-primary-button continue-button"
                  data-testid="setpasscode-continue-button"
                >
                  {i18n.t("setpasscode.continue.button")}
                </IonButton>
              ) : (
                <IonButton
                  onClick={() => handleClear()}
                  shape="round"
                  expand="block"
                  fill="outline"
                  className="continue-button"
                >
                  {i18n.t("setpasscode.startover.label")}
                </IonButton>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
    </>
  );
};

export { SetPasscode, ARGON2ID_OPTIONS };
