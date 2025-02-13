const compareVersion = (version1: string, version2: string) => {
  const version1Numbers = version1.split(".");
  const version2Numbers = version2.split(".");
  const maxLength =
    version1Numbers.length > version2Numbers.length
      ? version1Numbers.length
      : version2Numbers.length;

  for (let i = 0; i < maxLength; i++) {
    const tempNumb1 = Number(version1Numbers[i] || 0);
    const tempNumb2 = Number(version2Numbers[i] || 0);

    if (tempNumb1 > tempNumb2) return 1;
    if (tempNumb2 > tempNumb1) return -1;
  }

  return 0;
};

export { compareVersion };
