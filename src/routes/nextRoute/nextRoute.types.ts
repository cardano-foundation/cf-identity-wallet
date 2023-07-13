interface PageState {
  [key: string]: any;
}
interface PayloadProps {
  [key: string]: any;
}
interface DataProps {
  state?: PageState;
  payload?: PayloadProps;
}

export type { PageState, PayloadProps, DataProps };
