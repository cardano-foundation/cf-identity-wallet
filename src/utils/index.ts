const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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

export {
  generateUUID,
  formatShortDate,
  formatLongDate,
  formatShortTime,
  formatTimeToSec,
  formatCurrencyUSD,
};
