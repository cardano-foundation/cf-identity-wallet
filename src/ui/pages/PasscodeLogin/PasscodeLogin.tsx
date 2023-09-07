import {useEffect, useState} from "react";
import { IonButton, IonCol, IonGrid, IonPage, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {BasicMessageEventTypes, BasicMessageRole, BasicMessageStateChangedEvent} from "@aries-framework/core";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import { PasscodeModule } from "../../components/PasscodeModule";
import { Alert } from "../../components/Alert";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  getStateCache,
  setAuthentication,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import "./PasscodeLogin.scss";
import { getBackRoute } from "../../../routes/backRoute";
import { RoutePath } from "../../../routes";
import {LibP2p} from "../../../core/aries/transports/libp2p/libP2p";
import {AriesAgent} from "../../../core/aries/ariesAgent";

const PasscodeLogin = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const authentication = useAppSelector(getAuthentication);
  const [passcode, setPasscode] = useState("");
  const seedPhrase = localStorage.getItem("seedPhrase");
  const [isOpen, setIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const headerText =
      seedPhrase !== null
          ? i18n.t("passcodelogin.alert.text.verify")
          : i18n.t("passcodelogin.alert.text.restart");
  const confirmButtonText =
      seedPhrase !== null
          ? i18n.t("passcodelogin.alert.button.verify")
          : i18n.t("passcodelogin.alert.button.restart");
  const cancelButtonText = i18n.t("passcodelogin.alert.button.cancel");
  const [inputValueInvitationLink, setInputValueInvitationLink] = useState("");
  const [inputValueID, setInputValueID] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [displayInvitationLink, setDisplayInvitationLink] = useState("");
  const [displayMessage, setDisplayMessage] = useState("");

  const handleInputInvitationLinkChange = (event: any) => {
    setInputValueInvitationLink(event.target.value);
  };

  const handleInputConnectionId = (event: any) => {
    setInputValueID(event.target.value);
  };

  const handleInputMessage = (event: any) => {
    setInputMessage(event.target.value);
  };
  const handleReceiveInvitationClick = async () => {
    // await LibP2p.libP2p.connect(inputValue);
    const agent = await AriesAgent.agent;
    const receiveInvitationFromUrl = await agent.receiveInvitationFromUrl(inputValueInvitationLink);
    console.log(receiveInvitationFromUrl)
  };
  const handleCreateNewInvitationClick = async () => {
    const agent = await AriesAgent.agent;
    const res =  await agent.createNewWebRtcInvitation()
    setDisplayInvitationLink(res);
  };

  useEffect(() => {
        // AriesAgent.agent.onMessage((event: BasicMessageStateChangedEvent) => {
        //   console.log(event);
        //   setDisplayMessage(event.payload.message.content);
        // });
      }
      , []);

  const handleSendMessageClick = async () => {
    const agent = await AriesAgent.agent;
    await agent.sendMessageByConnectionId(inputValueID, inputMessage ?? "Hello");

  };
  const handleClose = async () => {
    const agent = await AriesAgent.agent;
    // await agent.stop();
  };

  const handleClearState = () => {
    setPasscode("");
    setIsOpen(false);
    setPasscodeIncorrect(false);
  };

  const handlePinChange = (digit: number) => {
    if (passcode.length < 6) {
      setPasscode(passcode + digit);
      if (passcode.length === 5) {
        verifyPasscode(passcode + digit)
            .then((verified) => {
              if (verified) {
                const { backPath, updateRedux } = getBackRoute(
                    RoutePath.PASSCODE_LOGIN,
                    {
                      store: { stateCache },
                    }
                );

                updateReduxState(
                    backPath.pathname,
                    { store: { stateCache } },
                    dispatch,
                    updateRedux
                );
                history.push(backPath.pathname);
                handleClearState();
              } else {
                setPasscodeIncorrect(true);
              }
            })
            .catch((e) => e.code === -35 && setPasscodeIncorrect(true));
      }
    }
  };

  const handleRemove = () => {
    if (passcode.length >= 1) {
      setPasscode(passcode.substring(0, passcode.length - 1));
    }
  };

  const verifyPasscode = async (pass: string) => {
    try {
      const storedPass = (await SecureStorage.get(
          KeyStoreKeys.APP_PASSCODE
      )) as string;
      if (!storedPass) return false;
      return storedPass === pass;
    } catch (e) {
      return false;
    }
  };

  const resetPasscode = () => {
    SecureStorage.delete(KeyStoreKeys.APP_PASSCODE).then(() => {
      dispatch(
          setAuthentication({
            ...authentication,
            passcodeIsSet: false,
          })
      );
      dispatch(
          setCurrentRoute({
            path: RoutePath.SET_PASSCODE,
          })
      );
      history.push(RoutePath.SET_PASSCODE);
      handleClearState();
    });
  };

  return (
      <IonPage className="page-layout passcode-login safe-area">
        <center>
          <h1>Input invitation link</h1>
          <input
              type="text"
              placeholder="Enter text..."
              value={inputValueInvitationLink}
              onChange={handleInputInvitationLinkChange}
          />
          <IonButton onClick={handleReceiveInvitationClick}>Set</IonButton>
          <div>---------------------------------------------------------</div>
          <p>Invitation link: {displayInvitationLink}</p>
          <div>---------------------------------------------------------</div>
          <IonButton onClick={handleCreateNewInvitationClick}>Create invitation link</IonButton>
          <div>---------------------------------------------------------</div>
          <p>Connection ID: {inputValueID}</p>
          <div>---------------------------------------------------------</div>
          <h1>Connect ID</h1>
          <input
              type="text"
              placeholder="Enter text..."
              value={inputValueID}
              onChange={handleInputConnectionId}
          />
          <div>---------------------------------------------------------</div>
          <p>Message receive: {displayMessage}</p>
          <div>---------------------------------------------------------</div>
          <h1>Set message</h1>
          <input
              type="text"
              placeholder="Enter text..."
              value={inputMessage}
              onChange={handleInputMessage}
          />
          <div>---------------------------------------------------------</div>
          <IonButton onClick={handleSendMessageClick}>Send test</IonButton>
          <div>---------------------------------------------------------</div>
          <div>---------------------------------------------------------</div>
          <IonButton onClick={handleClose}>Stop</IonButton>
          <div>---------------------------------------------------------</div>
        </center>
        <PageLayout currentPath={RoutePath.PASSCODE_LOGIN}>
          <PasscodeModule
              title={i18n.t("passcodelogin.title")}
              description={i18n.t("passcodelogin.description")}
              error={
                  passcode.length === 6 &&
                  passcodeIncorrect && (
                      <ErrorMessage
                          message={`${i18n.t("passcodelogin.error")}`}
                          timeout={true}
                      />
                  )
              }
              passcode={passcode}
              handlePinChange={handlePinChange}
              handleRemove={handleRemove}
          />
          <IonGrid>
            <IonRow>
              <IonCol className="continue-col">
                <IonButton
                    shape="round"
                    expand="block"
                    fill="outline"
                    className="secondary-button"
                    onClick={() => setIsOpen(true)}
                >
                  {i18n.t("passcodelogin.forgotten.button")}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
          <Alert
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              dataTestId="alert-forgotten"
              headerText={headerText}
              confirmButtonText={confirmButtonText}
              cancelButtonText={cancelButtonText}
              actionConfirm={resetPasscode}
          />
        </PageLayout>
      </IonPage>
  );
};

export { PasscodeLogin };