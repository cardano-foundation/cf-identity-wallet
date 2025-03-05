import * as React from "react";
import { Toolbar, Typography, IconButton, Button } from "@mui/material";
import { DeleteOutline, FilterList } from "@mui/icons-material";
import { i18n } from "../../../../i18n";

interface EnhancedTableToolbarProps {
  numSelected: number;
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = (props) => {
  const { numSelected } = props;
  const handleOpenModal = () =>
    setState((prevState) => ({ ...prevState, openModal: true }));
  return (
    <>
      <Toolbar className="connection-table-toolbar">
        <div className="table-left">
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
              <Button
                variant="contained"
                aria-label="delete connections"
                startIcon={<DeleteOutline />}
                className="delete-connections-button"
                onClick={handleOpenModal}
              >
                {i18n.t("pages.connections.delete")}
              </Button>
            </>
          )}
        </div>
      </Toolbar>
      {/* <DeleteConnectionModal
        openModal={state.openModal}
        setOpenModal={(open) =>
          setState((prevState) => ({ ...prevState, openModal: open }))
        }
      /> */}
    </>
  );
};

export { EnhancedTableToolbar };
