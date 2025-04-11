interface SymbolModalProps {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
}

const Symbols = [
  {
    key: "",
    labelKey: "space",
  },
  {
    key: "!",
    labelKey: "exclamationmark",
  },
  {
    key: "#",
    labelKey: "numbersign",
  },
  {
    key: "$",
    labelKey: "dollarsign",
  },
  {
    key: "£",
    labelKey: "sterlingsign",
  },
  {
    key: "€",
    labelKey: "eurosign",
  },
  {
    key: "%",
    labelKey: "percent",
  },
  {
    key: "&",
    labelKey: "ampersand",
  },
  {
    key: "’",
    labelKey: "singlequote",
  },
  {
    key: "(",
    labelKey: "leftparenthesis",
  },
  {
    key: ")",
    labelKey: "rightparenthesis",
  },
  {
    key: "*",
    labelKey: "asterisk",
  },
  {
    key: "+",
    labelKey: "plus",
  },
  {
    key: ",",
    labelKey: "comma",
  },
  {
    key: "-",
    labelKey: "minus",
  },
  {
    key: ".",
    labelKey: "fullstop",
  },
  {
    key: "/",
    labelKey: "slash",
  },
  {
    key: ":",
    labelKey: "colon",
  },
  {
    key: ";",
    labelKey: "semicolon",
  },
  {
    key: "<",
    labelKey: "lessthan",
  },
  {
    key: "=",
    labelKey: "equal",
  },
  {
    key: ">",
    labelKey: "greaterthan",
  },
  {
    key: "?",
    labelKey: "questionmark",
  },
  {
    key: "@",
    labelKey: "atsign",
  },
  {
    key: "[",
    labelKey: "leftbracket",
  },
  {
    key: "\\",
    labelKey: "backslash",
  },
  {
    key: "]",
    labelKey: "rightbracket",
  },
  {
    key: "^",
    labelKey: "caret",
  },
  {
    key: "_",
    labelKey: "underscore",
  },
  {
    key: "`",
    labelKey: "graveaccent",
  },
  {
    key: "{",
    labelKey: "leftbrace",
  },
  {
    key: "|",
    labelKey: "verticalbar",
  },
  {
    key: "}",
    labelKey: "rightbrace",
  },
  {
    key: "~",
    labelKey: "tilde",
  },
];

export type { SymbolModalProps };

export { Symbols };
