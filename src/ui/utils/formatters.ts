const formatShortDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const formatLongDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatShortTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeToSec = (date: string) => {
  return new Date(date).toLocaleTimeString("en-GB");
};

const formatCurrencyUSD = (amount: number) => {
  const currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
  return currencyFormat.format(amount);
};

const ellipsisText = (raw: string, length: number, suffix = "...") => {
  return raw.substring(0, length || raw.length) + suffix;
};

export {
  formatShortDate,
  formatLongDate,
  formatShortTime,
  formatTimeToSec,
  formatCurrencyUSD,
  ellipsisText,
};
