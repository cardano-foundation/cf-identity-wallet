const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-uk", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

export { generateUUID, formatDate };
