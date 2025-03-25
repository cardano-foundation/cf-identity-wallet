import { FormControl, InputLabel } from "@mui/material";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import { i18n } from "../../../../../../i18n";
import { ConnectionUrlFormProps } from "./ConnectionUrlForm.types";

const CustomInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
}));

const ConnectionUrlForm = ({
  inputValue,
  onInputChange,
}: ConnectionUrlFormProps) => {
  return (
    <FormControl
      variant="standard"
      className="connection-url-form"
    >
      <InputLabel
        shrink
        htmlFor="connection-url-input"
      >
        {i18n.t("pages.connections.addConnection.modal.pasteUrl")}
      </InputLabel>
      <CustomInput
        id="connection-url-input"
        value={inputValue}
        onChange={onInputChange}
      />
    </FormControl>
  );
};

export { ConnectionUrlForm };
