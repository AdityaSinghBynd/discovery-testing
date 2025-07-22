export const CURRENCY_FORMATS = {
  USD: {
    symbol: "$",
    decimal_places: 2,
    format: (value) => {
      if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)} Billion`;
      } else if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)} Million`;
      } else if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(2)} Thousand`;
      } else {
        return `$${value.toFixed(2)}`;
      }
    },
  },
  EUR: {
    symbol: "€",
    decimal_places: 2,
    format: (value) => {
      if (value >= 1_000_000_000) {
        return `€${(value / 1_000_000_000).toFixed(2)} Billion`;
      } else if (value >= 1_000_000) {
        return `€${(value / 1_000_000).toFixed(2)} Million`;
      } else if (value >= 1_000) {
        return `€${(value / 1_000).toFixed(2)} Thousand`;
      } else {
        return `€${value.toFixed(2)}`;
      }
    },
  },
  GBP: {
    symbol: "£",
    decimal_places: 2,
    format: (value) => {
      if (value >= 1_000_000_000) {
        return `£${(value / 1_000_000_000).toFixed(2)} Billion`;
      } else if (value >= 1_000_000) {
        return `£${(value / 1_000_000).toFixed(2)} Million`;
      } else if (value >= 1_000) {
        return `£${(value / 1_000).toFixed(2)} Thousand`;
      } else {
        return `£${value.toFixed(2)}`;
      }
    },
  },
  INR: {
    symbol: "₹",
    decimal_places: 2,
    format: (value) => {
      if (value >= 10_000_000) {
        return `₹${(value / 10_000_000).toFixed(2)} Crore`;
      } else if (value >= 100_000) {
        return `₹${(value / 100_000).toFixed(2)} Lakh`;
      } else if (value >= 1_000) {
        return `₹${(value / 1_000).toFixed(2)} Thousand`;
      } else {
        return `₹${value.toFixed(2)}`;
      }
    },
  },
};

const CONVERSION_RATES = {
  USD: {
    EUR: 0.85,
    GBP: 0.73,
    INR: 83.12,
    USD: 1,
  },
  EUR: {
    USD: 1.18,
    GBP: 0.86,
    INR: 97.79,
    EUR: 1,
  },
  GBP: {
    USD: 1.37,
    EUR: 1.16,
    INR: 113.71,
    GBP: 1,
  },
  INR: {
    USD: 0.012,
    EUR: 0.01,
    GBP: 0.0088,
    INR: 1,
  },
};

const UNIT_MULTIPLIERS = {
  thousand: 1_000,
  millions: 1_000_000,
  billion: 1_000_000_000,
  lakhs: 100_000,
  crores: 10_000_000,
  lakh: 100_000,
  crore: 10_000_000,
};

export function standardize_unit(unit) {
  return unit.toLowerCase();
}

export function standardize_currency(currency) {
  return currency.toUpperCase();
}

export function is_valid_currency_unit(currency, unit) {
  const validCurrencies = Object.keys(CURRENCY_FORMATS);
  const validUnits = Object.keys(UNIT_MULTIPLIERS);
  return validCurrencies.includes(currency) && validUnits.includes(unit);
}

export function get_conversion_factor(
  sourceCurrency,
  sourceUnit,
  targetCurrency,
  targetUnit,
) {
  sourceCurrency = standardize_currency(sourceCurrency);
  targetCurrency = standardize_currency(targetCurrency);
  sourceUnit = standardize_unit(sourceUnit);
  targetUnit = standardize_unit(targetUnit);

  // Get the multipliers for source and target units
  const sourceMultiplier = UNIT_MULTIPLIERS[sourceUnit];
  const targetDivisor = UNIT_MULTIPLIERS[targetUnit];

  // Get currency conversion rate (will be 1 if same currency)
  const currencyConversion = CONVERSION_RATES[sourceCurrency][targetCurrency];

  // Calculate final conversion factor
  const conversionFactor =
    (sourceMultiplier * currencyConversion) / targetDivisor;

  return conversionFactor;
}

export function is_numeric_cell(value) {
  if (typeof value === "string") {
    value = value.replace(/[₹$€£,\s]/g, "");
    value = value.replace(/(thousand|million|billion|lakh|crore)/gi, "");
  }
  return !isNaN(parseFloat(value)) && isFinite(value);
}

export function convert_html_table(
  htmlTable,
  sourceCurrency,
  sourceUnit,
  targetCurrency,
  targetUnit,
) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlTable, "text/html");
  const rows = doc.querySelectorAll("tr");
  const conversionFactor = get_conversion_factor(
    standardize_currency(sourceCurrency),
    standardize_unit(sourceUnit),
    standardize_currency(targetCurrency),
    standardize_unit(targetUnit),
  );

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    cells.forEach((cell) => {
      const cellText = cell.textContent.trim();
      if (is_numeric_cell(cellText)) {
        const isNegative = cellText.includes("(") || cellText.startsWith("-");
        let value = parseFloat(cellText.replace(/[^0-9.-]+/g, ""));
        if (isNegative) {
          value = -Math.abs(value);
        }

        const convertedValue = value * conversionFactor;
        const format = CURRENCY_FORMATS[targetCurrency];
        cell.textContent = format.format(convertedValue);
      }
    });
  });

  return doc.documentElement.outerHTML;
}
