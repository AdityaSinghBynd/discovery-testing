"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HtmlToShadcnTableProps {
  htmlContent: string;
  className?: string;
  transformValue?: (value: string) => string;
}

interface TableCellData {
  content: string;
  rowSpan: number;
  colSpan: number;
  isHeader: boolean;
  isPlaceholder: boolean;
}

type TableRowData = TableCellData[];

interface TableData {
  headers: TableRowData[];
  body: TableRowData[];
}

export default function HTMLToShadcnTable({
  htmlContent,
  className,
  transformValue,
}: HtmlToShadcnTableProps) {
  const [tableData, setTableData] = useState<TableData | null>(null);

  useEffect(() => {
    const decodeHtmlEntities = (html: string): string => {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = html;
      return textarea.value;
    };

    const parseHtmlTable = (html: string): TableData => {
      const cleanedHtml = decodeHtmlEntities(html.replace(/\n/g, ""));
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedHtml, "text/html");
      const table = doc.querySelector("table");

      if (!table) {
        throw new Error("No table found in the provided HTML");
      }

      const headers: TableRowData[] = [];
      const body: TableRowData[] = [];

      const parseRow = (
        row: HTMLTableRowElement,
        isHeader: boolean,
      ): TableRowData => {
        return Array.from(row.cells).map((cell) => {
          const content = cell.textContent?.trim() || "";
          return {
            content: content,
            rowSpan: cell.rowSpan,
            colSpan: cell.colSpan,
            isHeader: isHeader || cell.tagName.toLowerCase() === "th",
            isPlaceholder: false,
          };
        });
      };

      // Parse all rows
      const rows = Array.from(table.rows);
      let headerRowCount = 0;

      // Determine header row count
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].querySelector("th")) {
          headerRowCount++;
        } else {
          break;
        }
      }

      // Parse headers and body separately
      for (let i = 0; i < rows.length; i++) {
        const parsedRow = parseRow(rows[i], i < headerRowCount);
        if (i < headerRowCount) {
          headers.push(parsedRow);
        } else {
          body.push(parsedRow);
        }
      }

      // Adjust for rowSpan and colSpan
      const adjustForSpans = (rows: TableRowData[]) => {
        const maxCols = Math.max(...rows.map((row) => row.length));

        for (let i = 0; i < rows.length; i++) {
          for (let j = 0; j < maxCols; j++) {
            if (!rows[i][j] || rows[i][j].isPlaceholder) continue;

            const cell = rows[i][j];
            if (cell.rowSpan > 1 || cell.colSpan > 1) {
              for (let r = 0; r < cell.rowSpan; r++) {
                for (let c = 0; c < cell.colSpan; c++) {
                  if (r === 0 && c === 0) continue;
                  if (!rows[i + r]) rows[i + r] = [];
                  rows[i + r].splice(j + c, 0, {
                    ...cell,
                    rowSpan: 1,
                    colSpan: 1,
                    isPlaceholder: true,
                  });
                }
              }
            }
          }
        }

        // Ensure all rows have the same number of columns
        rows.forEach((row) => {
          while (row.length < maxCols) {
            row.push({
              content: "",
              rowSpan: 1,
              colSpan: 1,
              isHeader: false,
              isPlaceholder: true,
            });
          }
        });
      };

      adjustForSpans(headers);
      adjustForSpans(body);

      return { headers, body };
    };

    try {
      const parsedData = parseHtmlTable(htmlContent);
      setTableData(parsedData);
    } catch (error) {
      console.error("Error parsing table HTML:", error);
    }
  }, [htmlContent]);

  if (!tableData) {
    return (
      <div className="w-full h-full max-w-[1200px] mx-auto flex flex-col gap-2 items-center">
      <Table className="w-full h-full bg-white rounded border-1 border-[#eaf0f6]">
      <TableHeader className="bg-gray-50 p-0">
        <TableRow className="border-b">
          {Array.from({ length: 4 }).map((_, i) => (
            <TableHead key={`header-${i}`} className="border-r last:border-r-0 p-2">
              <div className="h-4 w-full max-w-[120px] rounded-[2px] bg-gray-200 animate-pulse" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <TableRow key={`row-${rowIndex}`} className="border-b last:border-b-0 hover:bg-[#f7f9fe]">
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <TableCell key={`cell-${rowIndex}-${colIndex}`} className="border-r last:border-r-0">
                <div
                  className="h-4 w-full rounded-[2px] bg-gray-200 animate-pulse"
                  style={{
                    animationDelay: `${rowIndex * 0.1 + colIndex * 0.05}s`,
                    maxWidth: colIndex === 0 ? "80px" : "80px",
                  }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
    );
  }

  const renderCell = (
    cell: TableCellData,
    key: string,
    isFirstColumn: boolean,
  ) => {
    if (cell.isPlaceholder) {
      return null;
    }

    const CellComponent = cell.isHeader ? TableHead : TableCell;
    const displayContent =
      cell.isHeader || !transformValue
        ? cell.content
        : transformValue(cell.content);

    return (
      <CellComponent
        key={key}
        rowSpan={cell.rowSpan}
        colSpan={cell.colSpan}
        className={`
          ${isFirstColumn ? "sticky left-0 bg-inherit z-20 w-[200px] xl:w-[300px] !bg-white font-medium break-words text-left" : ""}
          ${cell.isHeader ? "sticky top-0 bg-[#f7f9fe] font-medium text-gray-700 text-center p-[12px] z-30 min-w-[120px]" : "p-2"}
          ${isFirstColumn && cell.isHeader ? "z-40 !bg-[#f7f9fe] border-r border-[#eaf0fc] whitespace-normal break-words" : " "}
          ${!cell.isHeader ? "text-gray-600" : ""}
          transition-colors duration-200
        `}
      >
        {displayContent}
      </CellComponent>
    );
  };

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="w-full border !border-[#eaf0fc] rounded">
        <div className="w-full overflow-auto scrollbar-hide border-[2px] !border-[#eaf0fc] rounded">
          <Table className="w-full border-separate border-spacing-0 bg-white rounded">
            <TableHeader className="sticky top-0 z-30 bg-[#f7f9fe] rounded-t-md">
              {tableData.headers.map((row, rowIndex) => (
                <TableRow
                  key={`header-${rowIndex}`}
                  className="bg-white hover:bg-blue-50/80 transition-colors duration-200 border-b border-[#eaf0fc]"
                >
                  {row.map((cell, cellIndex) =>
                    renderCell(
                      cell,
                      `header-${rowIndex}-${cellIndex}`,
                      cellIndex === 0,
                    ),
                  )}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {tableData.body.map((row, rowIndex) => (
                <TableRow
                  key={`body-${rowIndex}`}
                  className="hover:bg-blue-50/40 transition-colors duration-200 border-b border-[#eaf0fc] text-center last:border-0"
                >
                  {row.map((cell, cellIndex) =>
                    renderCell(
                      cell,
                      `body-${rowIndex}-${cellIndex}`,
                      cellIndex === 0,
                    ),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}