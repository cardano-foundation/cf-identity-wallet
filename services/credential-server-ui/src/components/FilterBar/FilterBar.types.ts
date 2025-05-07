interface FilterData {
  startDate: Date | null;
  endDate: Date | null;
  keyword: string;
}

interface FilterBarProps {
  onChange: (search: FilterData) => void;
  totalFound: number;
}

interface DateChipProps {
  label: string;
  data: string;
  onDelete?: () => void;
}

export type { DateChipProps, FilterBarProps, FilterData };
