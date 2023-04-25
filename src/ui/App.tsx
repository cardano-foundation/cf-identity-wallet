import { useEffect, useState } from "react";
import { setupIonicReact, IonApp } from "@ionic/react";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./style.scss";

setupIonicReact();

const App = () => {
  const [storedPasscode, setStoredPasscode] = useState("");

  useEffect(() => {
    async function getStoredPasscode() {
      const loginPasscode = await SecureStorage.get("app-login-passcode");
      loginPasscode && setStoredPasscode(`${loginPasscode}`);
    }
    getStoredPasscode();
  }, [storedPasscode]);
  return (
    <IonApp>
      <Routes storedPasscode={storedPasscode} />
    </IonApp>
  );
};

export { App };
