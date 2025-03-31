import { enqueueSnackbar, VariantType } from "notistack";

const triggerToast = (message: string, variant: VariantType) => {
  enqueueSnackbar(message, {
    variant,
    anchorOrigin: { vertical: "top", horizontal: "center" },
  });
};

export { triggerToast };
