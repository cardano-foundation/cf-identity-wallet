import React, { useEffect } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { Box } from "@mui/material";

interface ToastProps {
  message: string;
  severity: "success" | "error" | "info" | "warning";
  visible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  severity,
  visible,
  onClose,
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <Box sx={{ position: "fixed", top: 20, right: 20, zIndex: 1300 }}>
      <Alert severity={severity}>
        <AlertTitle>
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default Toast;
