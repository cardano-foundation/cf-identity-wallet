const isRepeat = (value: string) => {
  const firstLetter = value.charAt(0);
  for (let i = 0; i < value.length; i++) {
    if (firstLetter !== value.charAt(i)) return false;
  }

  return true;
};

const isConsecutive = (value: string) => {
  for (let i = 0; i < value.length - 1; i++) {
    const currentChar = Number(value[i]);
    const nextChar = Number(value[i + 1]);

    if (currentChar !== nextChar - 1) {
      return false;
    }
  }

  return true;
};

const isReverseConsecutive = (value: string) => {
  for (let i = 0; i < value.length - 1; i++) {
    const currentChar = Number(value[i]);
    const nextChar = Number(value[i + 1]);

    if (currentChar !== nextChar + 1) {
      return false;
    }
  }

  return true;
};

export { isRepeat as isRepeat, isConsecutive, isReverseConsecutive };
