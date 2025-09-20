export function toF(c: number) {
  return Math.round(c * 9 / 5 + 32);
}
export function toC(f: number) {
  return Math.round((f - 32) * 5 / 9);
}