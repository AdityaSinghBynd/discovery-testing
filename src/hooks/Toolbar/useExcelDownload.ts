import axios from "axios";
import { getSession } from "next-auth/react";
import { Id, toast } from "react-toastify";
import * as XLSX from "xlsx";

declare global {
  interface Window {
    combinedWorkbook?: XLSX.WorkBook | null;
  }
}

export const useExcelDownload = () => {
  const downloadExcel = async (contentToCopy: any, tableTitle: string) => {
    const toastId = toast.loading("Processing Table...");

    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = contentToCopy;

      const session = await getSession();
      const response = await axios.post(
        "https://excel-table-function.azurewebsites.net/api/http_trigger",
        {
          data: [
            {
              title: tableTitle,
              content: tempDiv.innerHTML,
            },
          ],
          is_excel: true,
        },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (response.status === 200) {
        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${tableTitle}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.update(toastId, {
          render: "Download has been Started.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "Failed to download Excel file: ",
          err.response?.data || err.message,
        );

        toast.update(toastId, {
          render: "Failed to download file",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        console.error("Unexpected error: ", err);

        toast.update(toastId, {
          render: "Oops, something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    }
  };

  const downloadMultipleExcel = async (contentToCopy: string[], tableTitles: string[]) => {
    const toastId = toast.loading("Processing Table...");

    try {
      const session = await getSession();

      if (!window.combinedWorkbook) {
        window.combinedWorkbook = XLSX.utils.book_new();
      }

      const data = contentToCopy.map((content, index) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = content;
        return {
          title: tableTitles[index],
          content: tempDiv.innerHTML,
        };
      });

      const response = await axios.post(
        "https://excel-table-function.azurewebsites.net/api/http_trigger",
        {
          data: data,
          is_excel: true,
        },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        const arrayBuffer = await response.data.arrayBuffer();
        const tableWorkbook = XLSX.read(arrayBuffer, { type: "array" });
        
        tableWorkbook.SheetNames.forEach((sheetName, index) => {
          const worksheet = tableWorkbook.Sheets[sheetName];
          const validSheetName = tableTitles[index].slice(0, 31);

          if (!window.combinedWorkbook) {
            throw new Error("Workbook is not initialized");
          }

          XLSX.utils.book_append_sheet(
            window.combinedWorkbook,
            worksheet,
            validSheetName
          );
        });

        toast.update(toastId, {
          render: `Added ${tableTitles.length} tables to the workbook.`,
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });

        return true;
      } else {
        throw new Error(`Failed to generate Excel files`);
      }
    } catch (err) {
      console.error("Error combining Excel files:", err);
      toast.update(toastId, {
        render: "Failed to process tables",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      throw err;
    }
  };

  const finalizeDownload = async () => {
    const toastId = toast.loading("Finalizing Download...");

    try {
      if (!window.combinedWorkbook) {
        throw new Error("No workbook created.");
      }

      const combinedExcelArrayBuffer = XLSX.write(window.combinedWorkbook, {
        bookType: "xlsx",
        type: "array",
      });

      const combinedExcelBlob = new Blob([combinedExcelArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(combinedExcelBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Combined_Tables.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.update(toastId, {
        render: "Download started.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error finalizing the workbook:", err);
      toast.update(toastId, {
        render: "Failed to finalize the download.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      throw err;
    } finally {
      // Clear the workbook after download
      window.combinedWorkbook = null;
    }
  };

  return { downloadExcel, finalizeDownload, downloadMultipleExcel };
};
