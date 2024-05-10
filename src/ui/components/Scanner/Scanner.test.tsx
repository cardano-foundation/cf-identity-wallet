import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { OperationType, ToastMsgType } from "../../globals/types";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { Scanner } from "./Scanner";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) => (
    <div
      style={{ display: isOpen ? "block" : "none" }}
      {...props}
    >
      {children}
    </div>
  ),
  IonInput: (props: any) => {
    return (
      <input
        data-testid={props["data-testid"]}
        onChange={(e) => {
          props.onIonInput(e);
        }}
      />
    );
  },
}));

describe("Scanner wallet connect", () => {
  const mockStore = configureStore();

  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.IDENTIFIERS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
      },
      currentOperation: OperationType.SCAN_WALLET_CONNECTION,
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  const setIsValueCaptured = jest.fn();

  test("Renders content", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Scanner setIsValueCaptured={setIsValueCaptured} />
      </Provider>
    );

    expect(getByTestId("qr-code-scanner")).toBeVisible();

    expect(getByText(EN_TRANSLATIONS.scan.tab.title)).toBeVisible();

    expect(getByTestId("paste-meerkat-id-btn")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("paste-meerkat-id-btn"));
    });

    await waitFor(() => {
      expect(getByTestId("pid-input")).toBeVisible();
    });

    act(() => {
      fireEvent.change(getByTestId("pid-input"), {
        target: { value: "11111" },
      });
      fireEvent.click(getByTestId("action-button"));
    });

    expect(dispatchMock).toBeCalledWith(
      setToastMsg(ToastMsgType.PEER_ID_SUCCESS)
    );
  });
});
