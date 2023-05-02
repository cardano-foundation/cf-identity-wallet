import { useState } from "react";
import { useIonViewWillEnter } from "@ionic/react";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { useAppDispatch } from "../../../store/hooks";

const AppWrapper = (props: { children: any }) => {
  const dispatch = useAppDispatch();

  const [child, setChild] = useState(null);

  useIonViewWillEnter(() => {
    console.log("heeeey");
    initApp().then(() => {
      setChild(props.children);
    });
  });

  const initApp = async () => {
    const loginPasscode = await SecureStorage.get("app-login-passcode");
    console.log("Hello world!");
    //dispatch(setCache(CacheAPI.get()));
  };

  console.log("im the AppWrapper");
  return <div id="appWrapper">{props.children}</div>;
};

export { AppWrapper };
