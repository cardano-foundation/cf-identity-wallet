import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RoutePath } from "../index";
import { RootState } from "../../store";
import { DataProps } from "./backRoute.types";

const getBackRoute = (
  currentPath: string,
  data: DataProps
): {
  nextPath: { pathname: string };
  updateRedux: (() => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { nextPath, updateRedux } = BackRoute[currentPath];

  return {
    nextPath: nextPath(data),
    updateRedux: updateRedux.map((fn: (data: DataProps) => void) => fn(data)),
  };
};

const BackRoute: Record<string, any> = {
  "/": {
    nextPath: (data: DataProps) => getBackRootRoute(data.store),
    updateRedux: [],
  },
};

const getBackRootRoute = (store: RootState) => {
  const authentication = store.stateCache.authentication;
  const routes = store.stateCache.routes;
  const initialRoute =
    routes.some((route) => route.path === "/") || routes.length === 0;

  let path;
  if (authentication.passcodeIsSet && !authentication.loggedIn) {
    path = RoutePath.PASSCODE_LOGIN;
  } else {
    if (initialRoute) {
      path = RoutePath.ONBOARDING;
    } else {
      path = routes[0].path;
    }
  }
  return { pathname: path };
};

export { getBackRoute, getBackRootRoute };
