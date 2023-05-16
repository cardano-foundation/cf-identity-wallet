import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { RoutePath } from "../index";
import { RootState } from "../../store";
import {
  removeCurrentRoute,
  setCurrentRoute,
} from "../../store/reducers/stateCache";
import { clearSeedPhraseCache } from "../../store/reducers/seedPhraseCache";
import { DataProps, PayloadProps } from "../nextRoute/nextRoute.types";

const getBackRoute = (
  currentPath: string,
  data: DataProps
): {
  backPath: { pathname: string };
  updateRedux: (() => ThunkAction<void, RootState, undefined, AnyAction>)[];
} => {
  const { backPath: backPath, updateRedux } = backRoute[currentPath];

  return {
    backPath: backPath(data),
    updateRedux: updateRedux.map((fn: (data: DataProps) => void) => fn(data)),
  };
};

const backRoute: Record<string, any> = {
  "/": {
    backPath: (data: DataProps) => getPreviousRoute(data.store),
    updateRedux: [],
  },
  "/generateseedphrase": {
    backPath: (data: DataProps) => getPreviousRoute(data.store),
    updateRedux: [
      () => () => removeCurrentRoute(),
      (data: DataProps) => () => updateStoreSetCurrentRoute(data.store),
    ],
  },
  "/verifyseedphrase": {
    backPath: (data: DataProps) => getPreviousRoute(data.store),
    updateRedux: [
      () => () => removeCurrentRoute(),
      (data: DataProps) => () => updateStoreSetCurrentRoute(data.store),
      () => () => clearSeedPhraseCache(),
    ],
  },
  "/setpasscode": {
    backPath: (data: DataProps) => getPreviousRoute(data.store),
    updateRedux: [
      () => () => removeCurrentRoute(),
      (data: DataProps) => () => updateStoreSetCurrentRoute(data.store),
    ],
  },
};

const updateStoreSetCurrentRoute = (store: RootState) => {
  const prevPath = calcPreviousRoute(store.stateCache.routes);
  let path;
  if (prevPath) {
    path = prevPath.path;
  } else {
    path = store.stateCache.routes[0].path;
  }

  return setCurrentRoute({ path });
};
const getPreviousRoute = (store: RootState) => {
  const { routes } = store.stateCache;

  const prevPath = calcPreviousRoute(routes);
  let path;
  if (routes.length === 0) {
    path = RoutePath.ROOT;
  } else if (prevPath) {
    path = prevPath.path;
  } else {
    path = routes[0].path;
  }
  return { pathname: path };
};

const calcPreviousRoute = (
  routes: { path: string; payload?: PayloadProps }[]
) => {
  return routes
    .slice(1)
    .find((element) => element.path !== RoutePath.PASSCODE_LOGIN);
};

export { getBackRoute, calcPreviousRoute };
