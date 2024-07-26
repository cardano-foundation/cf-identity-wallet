import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { store } from "../../../../../store";
import { ShareConnectionProps } from "./ShareConnection.types";
import { ShareConnection } from "./ShareConnection";
import { setToastMsg } from "../../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../../globals/types";
import { identifierFix } from "../../../../__fixtures__/identifierFix";

const setIsOpen = jest.fn();
const props: ShareConnectionProps = {
  isOpen: true,
  onClose: setIsOpen,
  signifyName: identifierFix[0].signifyName,
};

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getOobi: jest.fn(),
      },
    },
  },
}));

describe("Share Connection", () => {
  test("Show toast when copy connection", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const storeMocked = {
      ...mockStore(store.getState()),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <ShareConnection
          isOpen={props.isOpen}
          onClose={props.onClose}
          signifyName={props.signifyName}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("share-connection-modal")).toBeInTheDocument();
      expect(getByTestId("share-connection-copy-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("share-connection-copy-button"));
    });

    await waitFor(() =>
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD)
      )
    );
  });
});
