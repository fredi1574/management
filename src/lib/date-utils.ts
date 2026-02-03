export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthNameToNumber(name: string): number {
  if (/^\d+$/.test(name)) {
    const num = parseInt(name);
    return num >= 1 && num <= 12 ? num : 1;
  }
  const index = MONTHS.findIndex((m) => m.toLowerCase() === name.toLowerCase());
  return index === -1 ? 1 : index + 1;
}

export function monthNumberToName(num: number): string {
  return MONTHS[num - 1] || MONTHS[0];
}
