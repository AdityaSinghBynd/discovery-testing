// types.ts
export interface CurrencyFormat {
  symbol: string;
  position: "before" | "after";
}

export type SupportedCurrency = "USD" | "INR" | "EUR" | "GBP";
export type SupportedUnit = "Millions" | "Billions" | "Lakhs" | "Crores";

export interface ExchangeRates {
  [key: string]: number;
}

// currency-unit-converter.ts
export const CURRENCY_FORMATS: Record<SupportedCurrency, CurrencyFormat> = {
  USD: { symbol: "$", position: "before" },
  INR: { symbol: "₹", position: "before" },
  EUR: { symbol: "€", position: "before" },
  GBP: { symbol: "£", position: "before" },
};

export const UNIT_MULTIPLIERS: Record<SupportedUnit, number> = {
  Millions: 1000000,
  Billions: 1000000000,
  Lakhs: 100000,
  Crores: 10000000,
};

// Sample exchange rates (you should fetch these from an API)
export const EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  INR: 83.37,
  EUR: 0.92,
  GBP: 0.79,
};

/**
 * Check if cell contains numeric value
 */
export const isNumericCell = (value: string | null | undefined): boolean => {
  if (!value || typeof value !== "string") return false;

  // Remove commas, parentheses, and spaces
  const cleanValue = value.replace(/[,\s()]/g, "");

  // Check if it's a valid number (including negative numbers)
  return !isNaN(Number(cleanValue)) && cleanValue.length > 0;
};

/**
 * Get conversion factor between source and target currencies/units
 */
export const getConversionFactor = (
  sourceCurrency: SupportedCurrency,
  sourceUnit: SupportedUnit,
  targetCurrency: SupportedCurrency,
  targetUnit: SupportedUnit,
): number => {
  // Get currency conversion rate
  const sourceRate = EXCHANGE_RATES[sourceCurrency];
  const targetRate = EXCHANGE_RATES[targetCurrency];
  const currencyFactor = targetRate / sourceRate;

  // Get unit conversion factors
  const sourceMultiplier = UNIT_MULTIPLIERS[sourceUnit];
  const targetMultiplier = UNIT_MULTIPLIERS[targetUnit];
  const unitFactor = sourceMultiplier / targetMultiplier;

  return unitFactor / currencyFactor;
};

/**
 * Convert numeric value using the conversion factor
 */
export const convertValue = (
  value: string,
  conversionFactor: number,
): string => {
  // Handle negative numbers in parentheses
  const isNegative = value.includes("(") || value.startsWith("-");

  // Clean the value
  let cleanValue = value.replace(/[,\s()₹$€£]/g, "").replace("-", "");

  if (!cleanValue) return value;

  try {
    let number = parseFloat(cleanValue);
    if (isNaN(number)) return value; // Return original value if not a number

    if (isNegative) number = -number;

    // Apply conversion
    const convertedValue = number * conversionFactor;

    // Format the converted value
    if (value.includes("(")) {
      return `(${Math.abs(convertedValue).toLocaleString("en-US", { maximumFractionDigits: 2 })})`;
    } else if (isNegative) {
      return `-${Math.abs(convertedValue).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    }
    return convertedValue.toLocaleString("en-US", { maximumFractionDigits: 2 });
  } catch (e) {
    console.error(`Error converting value '${value}':`, e);
    return value;
  }
};

/**
 * Convert cell values in a table
 */
export const convertTableValues = (
  tableData: string[][],
  sourceCurrency: SupportedCurrency,
  sourceUnit: SupportedUnit,
  targetCurrency: SupportedCurrency,
  targetUnit: SupportedUnit,
): string[][] => {
  // Calculate conversion factor
  const conversionFactor = getConversionFactor(
    sourceCurrency,
    sourceUnit,
    targetCurrency,
    targetUnit,
  );

  // Process each cell in the table
  return tableData.map((row) =>
    row.map((cell) => {
      if (isNumericCell(cell)) {
        return convertValue(cell, conversionFactor);
      }
      return cell;
    }),
  );
};
