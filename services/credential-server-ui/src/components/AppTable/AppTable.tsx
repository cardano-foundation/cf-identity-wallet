import {
  Table,
  TableBody,
  TableContainer,
  TablePagination,
} from "@mui/material";
import { AppTableBaseData, AppTableProps } from "./AppTable.types";
import { MIN_TABLE_WIDTH, ROWS_PER_PAGE_OPTIONS } from "./constants";
import { EnhancedTableHead } from "./EnhancedTableHead";

const AppTable = <T extends AppTableBaseData = AppTableBaseData>({
  rows,
  onRenderRow,
  headers,
  order,
  orderBy,
  onRequestSort,
  pagination,
}: AppTableProps<T>) => {
  return (
    <TableContainer>
      <Table
        sx={{ minWidth: MIN_TABLE_WIDTH }}
        aria-labelledby="tableTitle"
      >
        <EnhancedTableHead
          order={order}
          orderBy={orderBy as string}
          onRequestSort={onRequestSort}
          headers={headers}
        />
        <TableBody>{rows.map(onRenderRow)}</TableBody>
      </Table>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          {...pagination}
        />
      )}
    </TableContainer>
  );
};

export { AppTable };
