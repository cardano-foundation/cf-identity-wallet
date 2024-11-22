import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { IdentifierColorSelector } from "./IdentifierColorSelector";
import { IdentifierColor } from "./IdentifierColorSelector.types";

const ColorConfigs = [
  IdentifierColor.Green,
  IdentifierColor.Dark,
  IdentifierColor.Brown,
  IdentifierColor.Primary,
  IdentifierColor.Secondary,
];

describe("Identifier color selector", () => {
  test("Render", async () => {
    const colorChangeEvent = jest.fn();

    const { getByTestId } = render(
      <IdentifierColorSelector
        onColorChange={colorChangeEvent}
        value={IdentifierColor.Green}
      />
    );

    for (const item of ColorConfigs) {
      const color = getByTestId(`color-${item}`);
      expect(color).toBeVisible();

      act(() => {
        fireEvent.click(color);
      });

      expect(colorChangeEvent).toBeCalledWith(item);
    }
  });
});
