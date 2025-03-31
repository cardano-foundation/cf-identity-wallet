import {
  FormControl,
  FormHelperText,
  InputBase,
  InputBaseProps,
  InputLabel,
  styled,
} from "@mui/material";

interface AppInputProps extends InputBaseProps {
  label: string;
  errorMessage?: string;
}

const CustomInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& input": {
    padding: "1rem 1.25rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--color-neutral-400)",
    "&:focus": {
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: theme.palette.primary.main,
    },
  },
  "&.Mui-error input": {
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: theme.palette.error.main,
  },
}));

export const AppInput = ({
  label,
  error,
  errorMessage,
  id,
  className,
  ...inputProps
}: AppInputProps) => (
  <FormControl
    variant="standard"
    className={className}
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
      {label}
    </InputLabel>
    <CustomInput
      {...inputProps}
      id={id}
      error={error}
    />
    {error && <FormHelperText error>{errorMessage}</FormHelperText>}
  </FormControl>
);
