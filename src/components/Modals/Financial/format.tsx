export function formatStatementName(key: string): string {
  return key
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getStatementType(key: string): string {
  return key.split(" ")[0]; // Returns 'standalone' or 'consolidated'
}

export function getStatementCategory(key: string): string {
  const parts = key.split(" ");
  return parts.slice(1).join(" "); // Returns 'balance sheet', 'profit & loss statement', etc.
}
