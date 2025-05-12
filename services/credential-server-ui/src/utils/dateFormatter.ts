const formatDatePart = (date: Date): string =>
  new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

const formatDate = (dateString: string | Date): string =>
  formatDatePart(new Date(dateString));

const formatDateTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const formattedDate = formatDatePart(date);
  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
  return `${formattedDate} - ${formattedTime}`;
};

export { formatDate, formatDateTime };
