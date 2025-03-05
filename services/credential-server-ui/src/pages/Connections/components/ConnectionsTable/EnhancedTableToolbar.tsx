import * as React from "react";
import { Toolbar, Typography, IconButton, Button } from "@mui/material";
import { DeleteOutline, FilterList } from "@mui/icons-material";
import { i18n } from "../../../../i18n";
import { useState } from "react";
import { PopupModal } from "../../../../components/PopupModal";
import { handleDeleteContact } from "./helpers";
import { AppDispatch } from "../../../../store";
import { useDispatch } from "react-redux";

interface EnhancedTableToolbarProps {
  numSelected: number;
  setNumSelected: (num: number) => void;
  selected: string[];
  setSelected: (selected: string[]) => void;
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = (props) => {
  const { numSelected, setNumSelected, selected, setSelected } = props;
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    for (const id of selected) {
      await handleDeleteContact(id, dispatch);
    }
    setNumSelected(0);
    setSelected([]);
    setOpenModal(false);
  };

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
                onClick={() => setOpenModal(true)}
              >
                {i18n.t("pages.connections.delete")}
              </Button>
            </>
          )}
        </div>
      </Toolbar>
      <PopupModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={i18n.t("pages.connections.deleteConnections.title")}
        body={i18n.t("pages.connections.deleteConnections.body")}
        footer={
          <>
            <Button
              variant="contained"
              aria-label="cancel delete connections"
              onClick={() => setOpenModal(false)}
            >
              {i18n.t("pages.connections.deleteConnections.cancel")}
            </Button>
            <Button
              variant="contained"
              aria-label="confirm delete connections"
              onClick={handleDelete}
            >
              {i18n.t("pages.connections.deleteConnections.delete")}
            </Button>
          </>
        }
      />
    </>
  );
};

export { EnhancedTableToolbar };
