export interface FinancialTableRow {
  particulars: string;
  note?: string;
  currentYear: string | number;
  previousYear: string | number;
}

export interface FinancialData {
  [key: string]: {
    currency: string;
    unit: string;
    data: FinancialTableRow[];
  };
}

export interface RawFinancialData {
  message: string;
  data: {
    [key: string]: string[];
  };
}

export type StatementType = "standalone" | "consolidated";
