import axios from "axios";
import { getSession } from "next-auth/react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

declare global {
    interface Window {
        combinedWorkbook?: XLSX.WorkBook | null;
    }
}

export const useGraphDownload = () => {
    const downloadGraph = async (ImageUrl: string, pageNumber: number | string, pdfUrl: string) => {
        const toastId = toast.loading("Processing Graph...");

        try {
            const session = await getSession();
            console.log('Sending request with data:', {
                pageNumber,
                pdfUrl,
                figure_with_caption: ImageUrl
            });

            const response = await axios.post(
                "https://backend-staging.bynd.ai/django/api/chart-to-excel/",
                {
                    page_number: pageNumber,
                    pdf_blob_url: pdfUrl,
                    figure_with_caption: ImageUrl,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                }
            );

            if (response.status === 200) {
                const base64Data = response.data.excel_base64;

                if (!base64Data) {
                    throw new Error('The selected graph cannot be downloaded');
                }

                const binaryString = window.atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);

                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const blob = new Blob([bytes.buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });

                if (blob.size === 0) {
                    throw new Error('The selected graph cannot be downloaded');
                }

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "Graph_Download.xlsx");
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                }, 100);

                toast.update(toastId, {
                    render: "Download has been Started.",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error: unknown) {
            console.error("Error details:", error);

            if (axios.isAxiosError(error)) {
                let errorMessage = "Unknown error occurred";

                if (error.response) {
                    console.log('error.response', error.response)
                } else if (error.request) {
                    errorMessage = "No response received from server";
                } else {
                    errorMessage = error.message;
                }

                console.error("Failed to download Graph:", errorMessage);
                toast.update(toastId, {
                    render: `Failed to download Graph: ${errorMessage}`,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            } else if (error instanceof Error) {
                console.error("Unexpected error:", error);
                toast.update(toastId, {
                    render: `Error: ${error.message}`,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            } else {
                toast.update(toastId, {
                    render: "An unexpected error occurred",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        }
    };
    return { downloadGraph };
};