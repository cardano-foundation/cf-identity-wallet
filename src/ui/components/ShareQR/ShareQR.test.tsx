import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { store } from "../../../store";
import { ShareQR } from "./ShareQR";
import { ShareQRProps } from "./ShareQR.types";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { toastState } from "../../constants/dictionary";

const setIsOpen = jest.fn();
const onRefresh = jest.fn();
const props: ShareQRProps = {
  isOpen: true,
  setIsOpen,
  header: {
    title: "title",
    titlePosition: "center",
    onRefresh,
  },
  content: { QRData: "abc123" },
  moreComponent: <div>More component</div>,
  modalOptions: {
    initialBreakpoint: 0.65,
    breakpoints: [0, 0.65],
  },
};
describe("Share QR component", () => {
  test("It renders share QR component", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <ShareQR
          isOpen={props.isOpen}
          setIsOpen={props.setIsOpen}
          header={props.header}
          content={props.content}
          moreComponent={props.moreComponent}
          modalOptions={props.modalOptions}
        />
      </Provider>
    );

    expect(getByText(props.header.title)).toBeInTheDocument();
    expect(getByTestId("share-qr-modal-qr-code")).toBeInTheDocument();
    expect(getByText("More component")).toBeInTheDocument();
  });

  test("It should refresh QR code successfully", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ShareQR
          isOpen={props.isOpen}
          setIsOpen={props.setIsOpen}
          header={props.header}
          content={props.content}
          moreComponent={props.moreComponent}
          modalOptions={props.modalOptions}
        />
      </Provider>
    );
    const refreshBtn = getByTestId("refresh-button");
    act(() => {
      refreshBtn.click();
    });
    expect(onRefresh).toBeCalled();
  });

  test("It should show copy block and copy successfully", () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const storeMocked = {
      ...mockStore(store.getState()),
      dispatch: dispatchMock,
    };
    const copyBlock = [
      {
        title: "title 1",
        content: "content 1",
      },
      {
        content: "content 2",
      },
    ];
    const { getByText, queryByText, queryAllByTestId } = render(
      <Provider store={storeMocked}>
        <ShareQR
          isOpen={props.isOpen}
          setIsOpen={props.setIsOpen}
          header={props.header}
          content={{
            ...props.content,
            copyBLock: copyBlock,
          }}
          moreComponent={props.moreComponent}
          modalOptions={props.modalOptions}
        />
      </Provider>
    );
    const title1 = getByText(copyBlock[0].title as string);
    const title2 = queryByText("title 2");
    const content2 = getByText(copyBlock[1].content);
    expect(title1).toBeInTheDocument();
    expect(title2).not.toBeInTheDocument();
    expect(content2).toBeInTheDocument();

    const copyBtns = queryAllByTestId("copy-button-type");
    expect(copyBtns.length).toBe(2);
    act(() => {
      copyBtns[0].click();
    });
    expect(dispatchMock).toBeCalledWith(
      setCurrentOperation(toastState.copiedToClipboard)
    );
  });
});
