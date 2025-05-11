import {
  Box,
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { AppTableBaseData, EnhancedTableHeaderProps } from "./AppTable.types";

const EnhancedTableHead = <T extends AppTableBaseData = AppTableBaseData>({
  order,
  orderBy,
  headers,
  selectAllIndeterminate,
  selectAll,
  onRequestSort,
  onSelectAll,
}: EnhancedTableHeaderProps<T>) => {
  const createSortHandler = (property: keyof T) => {
    onRequestSort(property);
  };

  const renderCheckbox = () => {
    if (!onSelectAll) return null;

    return (
      <TableCell padding="checkbox">
        <Checkbox
          className="check-all"
          color="primary"
          indeterminate={selectAllIndeterminate}
          checked={selectAll}
          onChange={onSelectAll}
          slotProps={{
            input: { "aria-labelledby": "select all" },
          }}
          icon={<span className="custom-icon" />}
        />
      </TableCell>
    );
  };

  return (
    <TableHead>
      <TableRow
        sx={(theme) => ({
          background: theme.palette.primary.light,
        })}
      >
        {renderCheckbox()}
        {headers.map((headCell) => {
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
                <span className="table-header-label">{headCell.label}</span>
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
