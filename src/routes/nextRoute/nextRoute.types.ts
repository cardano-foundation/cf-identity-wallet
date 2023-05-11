import { RootState } from "../../store";

type RouteRulesType = Record<string, any>;

interface PageState {
  [key: string]: any;
}
interface PayloadProps {
  [key: string]: any;
}
interface DataProps {
  store: RootState;
  state?: PageState;
  payload?: PayloadProps;
}

export type { RouteRulesType, PageState, PayloadProps, DataProps };
