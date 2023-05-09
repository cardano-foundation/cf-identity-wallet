import React, { useEffect, useState } from "react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import {
  Redirect,
  Route,
  RouteProps,
  useHistory,
  useLocation,
} from "react-router-dom";
import Moment from "moment";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode";
import { PasscodeLogin } from "../ui/pages/PasscodeLogin";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getAuthentication,
  setAuthentication
} from "../store/reducers/StateCache";
import {SecureStorage} from "@aparajita/capacitor-secure-storage";

export const ROUTES = {
  ONBOARDING_ROUTE: "/onboarding",
  SET_PASSCODE_ROUTE: "/setpasscode",
  PASSCODE_LOGIN_ROUTE: "/passcodelogin",
  GENERATE_SEED_PHRASE_ROUTE: "/generateseedphrase",
  VERIFY_SEED_PHRASE_ROUTE: "/verifyseedphrase",
  DIDS_ROUTE: "/dids",
};

const ONBOARDING_ROUTE = "/onboarding";
const SET_PASSCODE_ROUTE = "/setpasscode";
const PASSCODE_LOGIN_ROUTE = "/passcodelogin";
const GENERATE_SEED_PHRASE_ROUTE = "/generateseedphrase";

const MAX_LOCK_TIME = 300000; // 3 sec

const PrivateRoute: React.FC<RouteProps> = (props) => {

  const authentication = useAppSelector(getAuthentication);
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authentication.loggedIn
  );

  useEffect(() => {
    setIsAuthenticated(authentication.loggedIn);
  }, [location.pathname]);

  const sessionExpired = () => {
    // Timeout logic here
    return MAX_LOCK_TIME < Moment().valueOf() - authentication.time;
  };

  return isAuthenticated && !sessionExpired() ? (
    <Route
      {...props}
      component={props.component}
    />
  ) : (
    <Redirect
      from={location.pathname}
      to={{
        pathname: authentication.passcodeIsSet
          ? ROUTES.PASSCODE_LOGIN_ROUTE
          : ROUTES.ONBOARDING_ROUTE,
      }}
    />
  );
};

const Routes = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const authentication = useAppSelector(getAuthentication);
  const [lockTimer, setLockTimer] = useState<
    NodeJS.Timeout | string | number | undefined
  >(undefined);

  useEffect(() => {
    startLockTimer();
    const onInteraction = () => {
      resetLockTimer();
    };
    const interactionEvents = ["onClick", "keypress", "scroll", "touchstart"];
    interactionEvents.forEach((event) => {
      document.addEventListener(event, onInteraction);
    });
    return () => {
      stopLockTimer();
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, onInteraction);
      });
    };
  }, []);

  const startLockTimer = () => {
    const timer = setTimeout(() => {
      lockApp(); // Lock after 5 min
    }, MAX_LOCK_TIME);
    setLockTimer(timer);
  };

  const resetLockTimer = () => {
    clearTimeout(lockTimer);
    startLockTimer();
    /*
    SecureStorage.get("app-login-passcode").then((passcodeIsSet) => {
      dispatch(
          setAuthentication({
            ...authentication,
            time: Moment().valueOf(),
            passcodeIsSet: !!passcodeIsSet
          })
      );
    });*/
  };

  const stopLockTimer = () => {
    clearTimeout(lockTimer);
  };

  const lockApp = () => {
    dispatch(
      setAuthentication({
        ...authentication,
        loggedIn: false,
        time: 0,
      })
    );
    history.push(ROUTES.PASSCODE_LOGIN_ROUTE);
  };

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Redirect
          exact
          from="/"
          to={ONBOARDING_ROUTE}
        />

        <Route
          path={PASSCODE_LOGIN_ROUTE}
          component={PasscodeLogin}
        />

        <Route
          path={SET_PASSCODE_ROUTE}
          component={SetPasscode}
        />

        <Route
          path={ONBOARDING_ROUTE}
          component={Onboarding}
        />

        {/* Private Routes */}
        <PrivateRoute
          path={GENERATE_SEED_PHRASE_ROUTE}
          component={GenerateSeedPhrase}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export {
  Routes,
  ONBOARDING_ROUTE,
  SET_PASSCODE_ROUTE,
  PASSCODE_LOGIN_ROUTE,
  GENERATE_SEED_PHRASE_ROUTE,
};
