import { routeRules } from "./rules";
import { RootState } from "../../store";

const getNextPath = (
  currentPath: string,
  store: RootState,
  state?: any,
  payload?: any
) => {
  const [nextPath, updateRedux] = routeRules[currentPath];

  return {
    nextPath: nextPath(store, state, payload),
    updateRedux: updateRedux(store, state),
  };
};

export { getNextPath };
