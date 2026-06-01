/** Years available when creating/editing categories in the admin wizard. */
const CATEGORY_YEAR_START = 1947;

export function getCategoryYearOptions(): string[] {
  const endYear = new Date().getFullYear() + 1;
  const years: string[] = [];
  for (let y = endYear; y >= CATEGORY_YEAR_START; y--) {
    years.push(String(y));
  }
  return years;
}
