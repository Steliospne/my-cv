export type RandomStringMode = "alpha" | "alphanumeric" | "numeric";

export type GenerateRandomStringOptions = {
  length: number;
  mode?: RandomStringMode;
};

const CHARSETS: Record<RandomStringMode, string> = {
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  numeric: "0123456789",
};

export function generateRandomString({
  length,
  mode = "alphanumeric",
}: GenerateRandomStringOptions): string {
  const size = Math.max(0, Math.floor(length));
  if (size === 0) return "";

  const charset = CHARSETS[mode];
  let output = "";

  for (let index = 0; index < size; index += 1) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    output += charset[randomIndex];
  }

  return output;
}
