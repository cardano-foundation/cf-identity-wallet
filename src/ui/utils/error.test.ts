import { setToastMsg } from "../../store/reducers/stateCache";
import { ToastMsgType } from "../globals/types";
import { showError } from "./error";

describe("Show error", () => {
  const errorLogMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(global.console, "error").mockImplementation(() => {
      errorLogMock();
    });
  });

  it("Show error log only", () => {
    showError("class1", {});
    expect(errorLogMock).toBeCalled();
  });

  it("Show error log and toast message", () => {
    const dispatchMock = jest.fn();
    showError("class1", {}, dispatchMock, ToastMsgType.USERNAME_CREATION_ERROR);

    expect(errorLogMock).toBeCalled();
    expect(dispatchMock).toBeCalledWith(
      setToastMsg(ToastMsgType.USERNAME_CREATION_ERROR)
    );
  });
});
