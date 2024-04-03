export const combineClassNames = (
  ...classNames: (string | Record<string, boolean> | undefined | null)[]
) => {
  const classes = classNames
    .map((className) => {
      if (!className) return "";
      if (typeof className === "string") return className;
      return Object.keys(className)
        .filter((key) => !!className[key])
        .join(" ")
        .trim();
    })
    .filter((className) => !!className)
    .join(" ")
    .trim();

  return classes.length > 0 ? classes : undefined;
};
