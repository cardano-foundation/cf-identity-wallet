import { SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";

interface PageHeaderProps {
  onBack?: () => void;
  title: string;
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

export type { PageHeaderProps };
