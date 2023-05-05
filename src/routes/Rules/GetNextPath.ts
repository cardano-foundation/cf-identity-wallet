
import { RootState } from "../../store";
import {NextRules} from "./NextRules";

const getNextPath = (
  currentPath: string,
  store: RootState,
  state?: any,
  payload?: any
) => {
  const [nextPath, updateRedux] = NextRules[currentPath];

  return {
    nextPath: nextPath(store, state, payload),
    updateRedux: updateRedux(store, state),
  };
};

export { getNextPath };
