import dayjs from "dayjs";
import { AppTableBaseData } from "../AppTable/AppTable.types";
import { FilterData } from "./FilterBar.types";

interface FilterDataKeyConfig<T extends AppTableBaseData> {
  keyword?: (keyof T)[];
  date: keyof T;
}

export const filter = <T extends AppTableBaseData>(
  data: T[],
  filterData: FilterData,
  filterField: FilterDataKeyConfig<T>
) => {
  const returnDAta = data
    .filter((item) => {
      return Object.keys(item).some((key) => {
        return (
          (filterField.keyword?.includes(key as keyof T) ||
            !filterField.keyword) &&
          String(item[key as keyof T]).includes(filterData.keyword)
        );
      });
    })
    .filter((item) => {
      if (!filterData.endDate && !filterData.startDate) return true;

      const date = dayjs(Number(item[filterField.date]));

      if (!date.isValid()) return false;

      const startDate = filterData.startDate
        ? dayjs(filterData.startDate)
        : null;
      const endDate = filterData.endDate ? dayjs(filterData.endDate) : null;
      const compareEndDate = endDate?.add(1, "day");

      const isGreatThanStartDate =
        date.isAfter(startDate) || date.isSame(startDate);
      const isLessThanEndDate = date.isBefore(compareEndDate);

      if (startDate && endDate) {
        return isGreatThanStartDate && isLessThanEndDate;
      }

      if (startDate) {
        return isGreatThanStartDate;
      }

      return isLessThanEndDate;
    });

  return returnDAta;
};
