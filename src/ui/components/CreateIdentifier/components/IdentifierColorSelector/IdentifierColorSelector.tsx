import { IonIcon } from "@ionic/react";
import { checkmark } from "ionicons/icons";
import { combineClassNames } from "../../../../utils/style";
import {
  IdentifierColor,
  IdentifierColorSelectorProps,
} from "./IdentifierColorSelector.types";
import "./IdentifierColorSelector.scss";

const ColorClassMapping = ["green", "dark", "brown", "primary", "secondary"];

const ColorConfigs = [
  IdentifierColor.Green,
  IdentifierColor.Dark,
  IdentifierColor.Brown,
  IdentifierColor.Primary,
  IdentifierColor.Secondary,
];

const Checkmark = () => {
  return (
    <div
      className="selected-theme-checkmark"
      data-testid="selected-theme-checkmark"
    >
      <div className="selected-theme-checkmark-inner">
        <IonIcon
          slot="icon-only"
          icon={checkmark}
        />
      </div>
    </div>
  );
};

const IdentifierColorSelector = ({
  onColorChange,
  value,
}: IdentifierColorSelectorProps) => {
  return (
    <div className="color-selector">
      {ColorConfigs.map((color) => {
        const classes = combineClassNames(
          "color",
          ColorClassMapping[color] || ColorClassMapping[0],
          {
            selected: value === color,
          }
        );
        return (
          <div
            onClick={() => onColorChange(color)}
            data-testid={`color-${color}`}
            key={color}
            className={classes}
          >
            {value === color ? <Checkmark /> : null}
          </div>
        );
      })}
    </div>
  );
};

export { IdentifierColorSelector };
