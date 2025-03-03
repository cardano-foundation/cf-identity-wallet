import * as React from "react";
import { Toolbar, Typography, IconButton, Tooltip } from "@mui/material";
import { Delete, FilterList } from "@mui/icons-material";
import { i18n } from "../../../../i18n";

interface EnhancedTableToolbarProps {
  numSelected: number;
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = (props) => {
  const { numSelected } = props;
  return (
    <Toolbar className="connection-table-toolbar">
      <div className="table-left">
        <Tooltip title="Filter list">
          <IconButton>
            <FilterList />
            <Typography
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {i18n.t("pages.connections.filter")}
            </Typography>
          </IconButton>
        </Tooltip>
      </div>
      <div className="table-right">
        {numSelected > 0 && (
          <>
            <Typography
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {numSelected} {i18n.t("pages.connections.selected")}
            </Typography>
            <Tooltip title="Delete">
              <IconButton>
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        )}
      </div>
    </Toolbar>
  );
};

export { EnhancedTableToolbar };
