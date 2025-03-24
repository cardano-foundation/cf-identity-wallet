import { TablePaginationProps } from "@mui/material";
import { ReactNode } from "react";

interface AppTableBaseData {
  id: string;
}

interface AppTableHeader<T extends AppTableBaseData> {
  id: keyof T;
  label: string;
  disablePadding?: boolean;
  onClick?: (row: keyof T) => void;
}

interface EnhancedTableProps<T extends AppTableBaseData = AppTableBaseData> {
  onRequestSort: (property: keyof T) => void;
  order: "asc" | "desc";
  orderBy: string;
  headers: AppTableHeader<T>[];
}

interface AppTableProps<T extends AppTableBaseData>
  extends EnhancedTableProps<T> {
  rows: T[];
  onRenderRow: (row: T, index: number) => ReactNode;
  pagination?: TablePaginationProps;
}

export type {
  AppTableBaseData,
  AppTableHeader,
  AppTableProps,
  EnhancedTableProps,
};
