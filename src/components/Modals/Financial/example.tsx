import type {
  FinancialTableRow,
  FinancialData,
  RawFinancialData,
} from "./types";

const DEFAULT_FINANCIAL_DATA: FinancialData = {};

function validateRawData(data: any): data is RawFinancialData {
  if (!data) return false;
  if (typeof data !== "object") return false;
  if (!data.data || typeof data.data !== "object") return false;

  // Check if data contains financial statement objects with currency, unit and content
  return Object.values(data.data).some(
    (value: any) =>
      typeof value === "object" &&
      !Array.isArray(value) &&
      value.currency &&
      value.unit &&
      value.content,
  );
}

export function parseTableHTML(htmlString: string) {
  if (!htmlString) return [];

  try {
    const div = document.createElement("div");
    div.innerHTML = htmlString.trim();

    const rows = Array.from(div.querySelectorAll("tr"));
    if (rows.length === 0) return [];

    const headers = Array.from(rows[0].querySelectorAll("th"));
    const hasNoteColumn = headers.some((h) =>
      h.textContent?.toLowerCase().includes("note"),
    );

    return rows
      .slice(1)
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length === 0) return null;

        const baseData = {
          particulars: cells[0]?.textContent?.trim() || "",
          currentYear: cells[hasNoteColumn ? 2 : 1]?.textContent?.trim() || "",
          previousYear: cells[hasNoteColumn ? 3 : 2]?.textContent?.trim() || "",
        };

        if (hasNoteColumn) {
          return {
            ...baseData,
            note: cells[1]?.textContent?.trim() || undefined,
          };
        }

        return baseData;
      })
      .filter((row) => row !== null);
  } catch (error) {
    console.error("Error parsing table HTML:", error);
    return [];
  }
}

export function formatFinancialData(rawData: any): FinancialData {
  if (typeof window === "undefined") {
    console.warn("Attempting to parse data on server side");
    return DEFAULT_FINANCIAL_DATA;
  }

  try {
    if (!validateRawData(rawData)) {
      console.error("Invalid data format:", rawData);
      return DEFAULT_FINANCIAL_DATA;
    }

    const formattedData: FinancialData = {};

    Object.entries(rawData.data).forEach(([key, value]: [string, any]) => {
      if (typeof value === "object" && value.content) {
        try {
          const parsedData = parseTableHTML(value.content);
          if (parsedData.length > 0) {
            formattedData[key] = {
              currency: value.currency,
              unit: value.unit,
              data: parsedData,
            };
          }
        } catch (error) {
          console.error(`Error parsing table for key ${key}:`, error);
        }
      }
    });

    if (Object.keys(formattedData).length === 0) {
      console.warn("No valid tables found in data");
      return DEFAULT_FINANCIAL_DATA;
    }

    return formattedData;
  } catch (error) {
    console.error("Error formatting financial data:", error);
    return DEFAULT_FINANCIAL_DATA;
  }
}
