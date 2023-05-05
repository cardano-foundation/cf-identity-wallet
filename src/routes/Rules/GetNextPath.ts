import { routeRules } from "./index";
import { ROUTES } from "../index";
import { RootState } from "../../store";

export const getNextPath = (
  currentPath: string,
  store: RootState,
  state: any,
  payload: any
) => {
  const [nextPath, updateRedux] = routeRules[currentPath];

  if (nextPath) {
    return {
      nextPath: nextPath(store),
      updateRedux,
    };
  }
  return ROUTES.PASSCODE_LOGIN_ROUTE;
};
