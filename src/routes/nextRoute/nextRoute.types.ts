import { RootState } from "../../store";

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

export type { PageState, PayloadProps, DataProps };
