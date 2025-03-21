import {
  Box,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { AppTableBaseData, EnhancedTableProps } from "./AppTable.types";

const EnhancedTableHead = <T extends AppTableBaseData = AppTableBaseData>({
  order,
  orderBy,
  headers,
  onRequestSort,
}: EnhancedTableProps<T>) => {
  const createSortHandler = (property: keyof T) => {
    onRequestSort(property);
  };

  return (
    <TableHead>
      <TableRow
        sx={(theme) => ({
          background: theme.palette.primary.light,
        })}
      >
        {headers.map((headCell) => {
          console.log(headCell.id, orderBy, order);

          return (
            <TableCell
              key={headCell.id as string}
              align="left"
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{
                padding: headCell.disablePadding ? 0 : "0.375rem 1rem",
                lineHeight: "2.5rem",
                fontWeight: 700,
              }}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={() => {
                  createSortHandler(headCell.id);
                  headCell.onClick?.(headCell.id);
                }}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                {orderBy === headCell.id ? (
                  <Box
                    component="span"
                    sx={visuallyHidden}
                  >
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
                {headCell.label}
              </TableSortLabel>
            </TableCell>
          );
        })}
        <TableCell padding="normal" />
      </TableRow>
    </TableHead>
  );
};

export { EnhancedTableHead };
