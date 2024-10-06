import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react";
import ENG_trans from "../../../locales/en/en.json";
import { store } from "../../../store";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { ShareConnection } from "./ShareConnection";
import { ShareConnectionProps, ShareType } from "./ShareConnection.types";
mockIonicReact();

const setIsOpen = jest.fn();
const props: ShareConnectionProps = {
  isOpen: true,
  setIsOpen,
  oobi: "http://keria:3902/oobi/EIEm2e5njbFZMUBPOtfRKdOUJ2EEN2e6NDnAMgBfdc3x/agent/ENjGAcU_Zq95OP_BIyTLgTahVd4xh-cVkecse6kaJqYv?name=Frank",
};

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: never) => (
    <div data-testid="share-connection-modal">{children}</div>
  ),
}));

const shareFnc = jest.fn();
jest.mock("@capacitor/share", () => ({
  ...jest.requireActual("@capacitor/share"),
  Share: {
    share: () => shareFnc(),
  },
}));

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getOobi: jest.fn(),
      },
    },
  },
}));

describe("Share Indentifier", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(store.getState()),
    dispatch: dispatchMock,
  };

  test("Show toast when copy identifier", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <ShareConnection
          isOpen={props.isOpen}
          setIsOpen={props.setIsOpen}
          oobi={props.oobi}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(ENG_trans.shareidentifier.subtitle.identifier)
      ).toBeVisible();
      expect(getByTestId("share-connection-modal")).toBeInTheDocument();
      expect(getByTestId("share-identifier-copy-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("share-identifier-copy-button"));
    });

    await waitFor(() =>
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD)
      )
    );
  });

  test("Render on identifier page", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <ShareConnection
          isOpen={props.isOpen}
          setIsOpen={props.setIsOpen}
          oobi={props.oobi}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(ENG_trans.shareidentifier.subtitle.identifier)
      ).toBeVisible();
      expect(getByTestId("share-connection-modal")).toBeInTheDocument();
      expect(getByTestId("share-identifier-copy-button")).toBeInTheDocument();
    });
  });

  test("Render on connection page", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <ShareConnection
          isOpen={props.isOpen}
          setIsOpen={props.setIsOpen}
          shareType={ShareType.Connection}
          oobi={props.oobi}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(ENG_trans.shareidentifier.subtitle.connection)
      ).toBeVisible();
      expect(getByTestId("share-connection-modal")).toBeInTheDocument();
      expect(getByTestId("share-identifier-copy-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("share-identifier-share-button"));
    });

    await waitFor(() => {
      expect(shareFnc).toBeCalled();
    });
  });

  test("Close share connection", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <ShareConnection
          isOpen={props.isOpen}
          setIsOpen={props.setIsOpen}
          shareType={ShareType.Connection}
          oobi={""}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByTestId("share-identifier-qr-code").classList.contains("blur")
      ).toBe(true);
    });

    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });

    await waitFor(() => {
      expect(setIsOpen).toBeCalled();
    });
  });
});
