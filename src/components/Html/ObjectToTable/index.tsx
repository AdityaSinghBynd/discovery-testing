import { useState, useMemo, memo, useCallback } from "react";
import Image from "next/image";
import Copy from "../../../../public/images/copy.svg";
import ClickedCopy from "../../../../public/images/ClickedCopy.svg";
import { CircleAlert } from "lucide-react";

// Types
interface TableData {
  [key: string]: {
    values: (string | number)[];
    assumed: boolean[];
  };
}

interface DataTableProps {
  data: TableData | null;
}

// Constants
const COPY_TIMEOUT = 2000;
const NO_DATA_MESSAGE = "Couldn't extract table data";

// Reusable Components
const NoDataDisplay = memo(() => (
  <div className="flex items-center justify-center w-full h-[100px] border-1 border-[#eaf0f6] bg-white rounded">
    <p className="text-[#9babc7] flex items-center gap-2"><CircleAlert className="w-4 h-4"/>{NO_DATA_MESSAGE}</p>
  </div>
));

const CopyButton = memo(({ isCopied, onClick }: { isCopied: boolean; onClick: () => void }) => (
  <div className="flex justify-end">
    <Image
      className="cursor-pointer w-6 h-6 p-1 transition-colors duration-200 ease-in-out hover:rounded"
      src={isCopied ? ClickedCopy : Copy}
      alt={isCopied ? "Copied" : "Copy"}
      width={20}
      height={20}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    />
  </div>
));

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!data || typeof data !== "object") {
    return <NoDataDisplay />;
  }

  // Memoized values
  const headers = Object.keys(data) || [];

  const rowCount = !headers.length || !data[headers[0]]?.values 
    ? 0 
    : data[headers[0]].values.length;

  // Memoized cell value getter
  const getCellValue = (header: string, rowIndex: number) => {
    const cellData = data[header]?.values[rowIndex];
    const isAssumed = data[header]?.assumed[rowIndex];
    return isAssumed ? "N/A" : cellData;
  };

  // Optimized copy handler
  const handleCopy = async () => {
    try {
      const tableElement = document.createElement("table");
      // Apply styles directly to the table element
      tableElement.style.minWidth = "100%";
      tableElement.style.border = "1px solid #000000";
      tableElement.style.borderCollapse = "collapse";
      
      // Create header
      const thead = tableElement.createTHead();
      const headerRow = thead.insertRow();
      headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        // Apply styles directly to each header cell
        th.style.backgroundColor = "#C5D9F1";
        th.style.padding = "5px";
        th.style.border = "1px solid #000000";
        headerRow.appendChild(th);
      });
      
      // Create body
      const tbody = tableElement.createTBody();
      Array.from({ length: rowCount }).forEach((_, rowIndex) => {
        const row = tbody.insertRow();
        headers.forEach((header) => {
          const cell = row.insertCell();
          cell.textContent = String(getCellValue(header, rowIndex));
          // Apply styles directly to each body cell
          cell.style.padding = "5px";
          cell.style.border = "1px solid #000000";
        });
      });
      
      // Copy the HTML with all styles applied inline
      await navigator.clipboard.writeText(tableElement.outerHTML);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_TIMEOUT);
    } catch (error) {
      console.error('Failed to copy table:', error);
      // You could add a toast notification here
    }
  };

  return (
    <div className="w-full">
      <CopyButton isCopied={isCopied} onClick={handleCopy} />
      <div className="border-1 border-[#eaf0fc] rounded overflow-x-auto">
        <table className="min-w-full bg-white" role="grid" aria-label="Data table">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="py-2 px-4 border-b bg-[#f7f9fe] text-center"
                  scope="col"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[#fbfdff] text-center">
                {headers.map((header) => (
                  <td key={`${rowIndex}-${header}`} className="py-2 px-4 border-b">
                    {getCellValue(header, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(DataTable); 