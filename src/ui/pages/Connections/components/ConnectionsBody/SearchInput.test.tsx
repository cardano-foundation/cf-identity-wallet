import { ionFireEvent } from "@ionic/react-test-utils";
import { act, render, waitFor } from "@testing-library/react";
import { SearchInput } from "./SearchInput";

describe("Connection search input", () => {
  test("Render", async () => {
    const onFocusChange = jest.fn();

    const { getByTestId } = render(
      <SearchInput
        value="test"
        onInputChange={jest.fn()}
        onFocus={onFocusChange}
      />
    );

    act(() => {
      ionFireEvent.ionCancel(getByTestId("search-bar"));
    });

    await waitFor(() => {
      expect(onFocusChange).toBeCalledWith(false);
    });
  });

  test("Blur search input", async () => {
    const onFocusChange = jest.fn();

    const { getByTestId } = render(
      <SearchInput
        value=""
        onInputChange={jest.fn()}
        onFocus={onFocusChange}
      />
    );

    act(() => {
      ionFireEvent.ionBlur(getByTestId("search-bar"));
    });

    await waitFor(() => {
      expect(onFocusChange).toBeCalledWith(false);
    });
  });

  test("Focus search input", async () => {
    const onFocusChange = jest.fn();

    const { getByTestId } = render(
      <SearchInput
        value=""
        onInputChange={jest.fn()}
        onFocus={onFocusChange}
      />
    );

    act(() => {
      ionFireEvent.ionFocus(getByTestId("search-bar"));
    });

    await waitFor(() => {
      expect(onFocusChange).toBeCalledWith(true);
    });
  });
});
