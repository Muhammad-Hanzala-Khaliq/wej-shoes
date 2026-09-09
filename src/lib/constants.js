export const SIZE_RANGES = {
  WOMEN: [36, 37, 38, 39, 40, 41, 42],
  MEN: [39, 40, 41, 42, 43, 44, 45],
  KIDS: Array.from({ length: 42 - 16 + 1 }, (_, i) => 16 + i),
};

export const GENDERS = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "KIDS", label: "Kids" },
];
