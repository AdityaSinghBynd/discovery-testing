import { load } from "cheerio";
import {
  standardize_unit,
  standardize_currency,
  is_valid_currency_unit,
  get_conversion_factor,
  is_numeric_cell,
} from "./unitConversion";

const convertHtmlUnits = (
  tableHtml: string,
  sourceCurrency: string,
  sourceUnit: string,
  targetCurrency: string,
  targetUnit: string,
  decimals: number = 2,
) => {
  // Standardize inputs
  const stdSourceCurrency = standardize_currency(sourceCurrency);
  const stdSourceUnit = standardize_unit(sourceUnit);
  const stdTargetCurrency = standardize_currency(targetCurrency);
  const stdTargetUnit = standardize_unit(targetUnit);

  // Validate inputs
  if (!is_valid_currency_unit(stdSourceCurrency, stdSourceUnit)) {
    console.error(
      `Invalid source currency (${stdSourceCurrency}) or unit (${stdSourceUnit})`,
    );
    return tableHtml;
  }

  // Get conversion factor only if currencies are different or units need conversion
  let conversionFactor = 1;
  if (
    stdSourceCurrency !== stdTargetCurrency ||
    stdSourceUnit !== stdTargetUnit
  ) {
    conversionFactor = get_conversion_factor(
      stdSourceCurrency,
      stdSourceUnit,
      stdTargetCurrency,
      stdTargetUnit,
    );
  }

  // Load HTML
  const $ = load(tableHtml);

  // Check if table has Note column
  const hasNoteColumn = $("tr")
    .first()
    .find("th")
    .toArray()
    .some((th) => $(th).text().trim().toLowerCase() === "notes" || "note");

  // Process each cell
  $("tr").each((_, row) => {
    $(row)
      .find("td, th")
      .each((cellIndex, cell) => {
        const $cell = $(cell);
        let cellText = $cell.text().trim();

        // Skip empty cells, "Particulars" cells, or Note column cells
        if (
          !cellText ||
          cellText === "" ||
          cellText.toLowerCase() === "particulars" ||
          (hasNoteColumn && cellIndex === 1)
        ) {
          return;
        }

        // First sanitize the cell text - allow currency symbols ₹$€£
        cellText = cellText.replace(/[^\d\s\(\)\-\.a-zA-Z₹$€£]/g, "");

        // Handle header cells with currency/unit info
        const currencyPattern = `(${stdSourceCurrency}|INR|USD|EUR|GBP|₹|\\$|€|£)`;
        if (
          new RegExp(currencyPattern, "i").test(cellText) &&
          cellText.toLowerCase().includes(stdSourceUnit.toLowerCase())
        ) {
          if (stdSourceCurrency === stdTargetCurrency) {
            // Only replace unit if currencies are same
            $cell.text(
              cellText.replace(
                new RegExp(`${stdSourceUnit}`, "i"),
                stdTargetUnit,
              ),
            );
          } else {
            // Replace both currency and unit
            $cell.text(
              cellText.replace(
                new RegExp(`${currencyPattern}\\s*${stdSourceUnit}`, "i"),
                `${stdTargetCurrency} ${stdTargetUnit}`,
              ),
            );
          }
          return;
        }

        // Check if cell contains a number
        if (is_numeric_cell(cellText)) {
          // Extract number, handling negative values in parentheses
          const isNegative = cellText.includes("(") || cellText.startsWith("-");
          let value = parseFloat(cellText.replace(/[^0-9.-]+/g, ""));

          if (isNegative) {
            value = -Math.abs(value);
          }

          // Convert value
          const convertedValue = value * conversionFactor;

          // Format value with specified decimals and add commas based on currency
          const formattedValue = formatNumber(
            convertedValue,
            decimals,
            stdTargetCurrency,
          );

          // Update cell
          $cell.text(formattedValue);
        }
      });
  });

  return $.html();
};

export function formatNumber(
  value: number,
  decimals: number,
  currency: string,
): string {
  const formatter = new Intl.NumberFormat(
    currency === "INR" ? "en-IN" : "en-US",
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true,
    },
  );
  return formatter.format(value);
}

export default convertHtmlUnits;
