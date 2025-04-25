import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import { Box, Button, Chip, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { DemoItem } from "@mui/x-date-pickers/internals/demo";
import { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { i18n } from "../../i18n";
import { AppInput } from "../AppInput";
import "./FilterBar.scss";
import { DateChipProps, FilterBarProps } from "./FilterBar.types";

const ResultChip = ({ label, data, onDelete }: DateChipProps) => {
  return (
    <Box className="filter-label">
      {label}:&nbsp;
      <Chip
        label={data}
        onDelete={onDelete}
      />
    </Box>
  );
};

export const FilterBar = ({ onChange, totalFound }: FilterBarProps) => {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [search, setSearch] = useState<string>("");

  const clearDate = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const clearFilter = () => {
    clearDate();
    clearSearch();
  };

  useEffect(() => {
    onChange({
      startDate: startDate?.toDate() || null,
      endDate: endDate?.toDate() || null,
      keyword: search,
    });
  }, [endDate, startDate, search, onChange]);

  const hasFilter = startDate || endDate || search;

  const dateChipLabel = useMemo(() => {
    const startDateLabel =
      (startDate && endDate && startDate.year() === endDate.year()
        ? startDate?.format("DD MMM")
        : startDate?.format("DD MMM YYYY")) || "";
    const endDateLabel = endDate?.format("DD MMM YYYY") || "";

    if (startDate && endDate) {
      return `${startDateLabel} - ${endDateLabel}`;
    }

    if (startDate) {
      return startDateLabel;
    }

    return endDateLabel;
  }, [endDate, startDate]);

  return (
    <>
      <Box className="filter-bar">
        <Box className="date-filter">
          <DemoItem label={i18n.t("filterBar.date.from")}>
            <DatePicker
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              format="DD/MM/YYYY"
            />
          </DemoItem>
          <DemoItem label={i18n.t("filterBar.date.to")}>
            <DatePicker
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              format="DD/MM/YYYY"
            />
          </DemoItem>
        </Box>
        <Box className="search-filter">
          <AppInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={<SearchOutlinedIcon />}
            placeholder={i18n.t("filterBar.search.placeholder")}
            label={i18n.t("filterBar.search.label")}
          />
        </Box>
      </Box>
      {!!hasFilter && (
        <>
          <Typography
            variant="body2"
            align="left"
          >
            <span className="total-items">{totalFound}</span>&nbsp;
            {i18n.t("resultBar.results")}
          </Typography>
          <Box className="result-bar">
            {(startDate || endDate) && (
              <ResultChip
                label={i18n.t("resultBar.date")}
                data={dateChipLabel}
                onDelete={clearDate}
              />
            )}
            {search && (
              <ResultChip
                label={i18n.t("resultBar.search")}
                data={search}
                onDelete={clearSearch}
              />
            )}
            <Button
              className="clear-button"
              color="error"
              startIcon={<DeleteForeverOutlinedIcon />}
              onClick={clearFilter}
            >
              {i18n.t("resultBar.clear")}
            </Button>
          </Box>
        </>
      )}
    </>
  );
};
