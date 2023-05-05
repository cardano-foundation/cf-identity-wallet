import { routeRules } from "./rules";
import { ROUTES } from "../index";
import { RootState } from "../../store";

export const getNextPath = (
  currentPath: string,
  store: RootState,
  state?: any,
  payload?: any
) => {
  const [nextPath, updateRedux] = routeRules[currentPath];

  return {
    nextPath: nextPath(store, state, payload),
    updateRedux: updateRedux(store),
  };
};
