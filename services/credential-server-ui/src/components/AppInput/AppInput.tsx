import {
  FormControl,
  FormHelperText,
  InputBase,
  InputBaseProps,
  InputLabel,
  styled,
} from "@mui/material";
import { i18n } from "../../i18n";
import "./AppInput.scss";

interface AppInputProps extends InputBaseProps {
  label: string;
  optional?: boolean;
  errorMessage?: string;
}

const CustomInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "&": {
    borderRadius: "0.5rem",
    border: "1px solid var(--color-neutral-400)",
    "& input": {
      padding: "1rem 1.25rem",
    },
    "&.Mui-focused": {
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: theme.palette.primary.main,
    },
    "&.MuiInputBase-adornedStart": {
      paddingLeft: "1rem",
      input: {
        padding: "1rem 0.5rem",
      },
    },
  },
  "&.Mui-error": {
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: theme.palette.error.main,
  },
}));

export const AppInput = ({
  label,
  optional,
  error,
  errorMessage,
  id,
  className,
  ...inputProps
}: AppInputProps) => (
  <FormControl
    variant="standard"
    className={`app-input ${className}`}
  >
    <InputLabel
      shrink
      htmlFor={id}
      sx={(theme) => ({
        color: theme.palette.text.primary,
        "&.Mui-focused": {
          color: theme.palette.text.primary,
        },
      })}
    >
      <span className="app-input-label">{label}</span>
      {optional && (
        <span className="app-input-optional">{i18n.t("general.optional")}</span>
      )}
    </InputLabel>
    <CustomInput
      {...inputProps}
      id={id}
      error={error}
    />
    {error && <FormHelperText error>{errorMessage}</FormHelperText>}
  </FormControl>
);
