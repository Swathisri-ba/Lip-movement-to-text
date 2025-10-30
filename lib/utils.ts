export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return inputs
    .flat()
    .filter((x) => typeof x === "string")
    .join(" ")
    .trim()
}
