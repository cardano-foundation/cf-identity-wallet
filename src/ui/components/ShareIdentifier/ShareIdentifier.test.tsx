import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { ShareIdentifierProps } from "./ShareIdentifier.types";
import { ShareIdentifier } from "./ShareIdentifier";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { keriFix } from "../../__fixtures__/identifierFix";

const setIsOpen = jest.fn();
const props: ShareIdentifierProps = {
  isOpen: true,
  setIsOpen,
  cardData: keriFix[0],
};
describe("Share Indentifier (OOBI)", () => {
  test("Show toast when copy identifier", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const storeMocked = {
      ...mockStore(store.getState()),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <ShareIdentifier
          isOpen={props.isOpen}
          setIsOpen={props.setIsOpen}
          cardData={props.cardData}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("share-identifier-modal")).toBeInTheDocument();
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
});
