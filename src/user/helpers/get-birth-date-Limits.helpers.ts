export const getBirthDateLimits = () => {
  const today = new Date();

  const minDate = new Date(
    today.getFullYear() - 120,
    today.getMonth(),
    today.getDate(),
  );

  const maxDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate(),
  );

  return { minDate, maxDate };
};
