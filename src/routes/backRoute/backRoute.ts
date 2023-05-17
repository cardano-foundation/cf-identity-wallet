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
    updateRedux,
  };
};

const updateStoreSetCurrentRoute = (data: DataProps) => {
  const prevPath = calcPreviousRoute(data.store.stateCache.routes);
  let path;
  if (prevPath) {
    path = prevPath.path;
  } else {
    path = data.store.stateCache.routes[0].path;
  }

  return setCurrentRoute({ path });
};
const getPreviousRoute = (data: DataProps) => {
  const { routes } = data.store.stateCache;

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

const backPath = (data: DataProps) => getPreviousRoute(data);

const backRoute: Record<string, any> = {
  "/": {
    backPath,
    updateRedux: [],
  },
  "/generateseedphrase": {
    backPath,
    updateRedux: [removeCurrentRoute, updateStoreSetCurrentRoute],
  },
  "/verifyseedphrase": {
    backPath,
    updateRedux: [
      removeCurrentRoute,
      updateStoreSetCurrentRoute,
      clearSeedPhraseCache,
    ],
  },
  "/setpasscode": {
    backPath,
    updateRedux: [removeCurrentRoute, updateStoreSetCurrentRoute],
  },
};

export {
  getBackRoute,
  calcPreviousRoute,
  getPreviousRoute,
  updateStoreSetCurrentRoute,
};
