const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-uk", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

export { formatDate };
