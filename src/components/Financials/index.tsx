import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody } from "@/components/ui/table";
import { setCurrency, setSelectedCategory, setUnit, setDecimal } from "@/redux/FinancialStatements/financialStatements.slice";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import HTMLToShadcnTable from "@/components/Html/Table";
import { formatStatementName } from "../Modals/Financial/format";
import { AppDispatch, RootState } from "@/store/store";
import { useExcelDownload } from "@/hooks/Toolbar/useExcelDownload";
import amplitude, { track } from "@amplitude/analytics-browser";
import { toast } from "react-hot-toast";

// Constants
const DEFAULT_CURRENCY = "inr";
const DEFAULT_UNIT = "lakhs";
const DEFAULT_DECIMALS = "2";

interface FinancialDataType {
    selectedCategory: string;
    data: {
        data: Record<
            string,
            {
                currency: string;
                unit: string;
                content: string;
                targetCurrency?: string;
                targetUnit?: string;
                decimal?: number;
            }
        >;
    };
    loading: boolean;
}

// Memoized styled components
const StyledSelectTrigger = React.memo(
    ({ children }: { children: React.ReactNode }) => (
        <SelectTrigger className="h-9 w-full bg-white border-[#eaf0fc] text-[#001742] border-1 border-[#eaf0fc] rounded">
            {children}
        </SelectTrigger>
    )
);

const StyledSelectContent = React.memo(
    ({ children }: { children: React.ReactNode }) => (
        <SelectContent className="bg-white shadow-custom-blue rounded">
            {children}
        </SelectContent>
    )
);

// Memoized select components
const CurrencySelect = React.memo(
    ({ onChange }: { onChange: (value: string) => void }) => (
        <SelectGroup label="Currency">
            <Select defaultValue={DEFAULT_CURRENCY} onValueChange={onChange}>
                <StyledSelectTrigger>
                    <SelectValue placeholder="Select currency" />
                </StyledSelectTrigger>
                <StyledSelectContent>
                    {["inr", "usd", "eur", "gbp"].map(currency => (
                        <SelectItem key={currency} value={currency} className="cursor-pointer">
                            {currency.toUpperCase()}
                        </SelectItem>
                    ))}
                </StyledSelectContent>
            </Select>
        </SelectGroup>
    )
);

const SelectGroup = React.memo(
    ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="flex flex-col flex-1 gap-1.5">
            <label className="text-sm font-medium text-neutral-700">{label}</label>
            {children}
        </div>
    )
);

// Memoized state components
const LoadingState = React.memo(() => (
    <div className="flex-1 flex items-center justify-center text-neutral-600">
        Loading financial data...
    </div>
));

const ErrorState = React.memo(({ message }: { message: string }) => (
    <div className="flex-1 flex items-center justify-center text-red-600">
        {message}
    </div>
));

export default function Financials({
    documentId,
    onClose,
}: {
    documentId: string;
    onClose: () => void;
}) {
    // State management
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);
    const [convertedHtml, setConvertedHtml] = useState<string>("");

    // Redux hooks
    const dispatch = useDispatch<AppDispatch>();
    const { downloadMultipleExcel, finalizeDownload } = useExcelDownload();
    const { financialData } = useSelector<RootState, { financialData: Record<string, FinancialDataType> }>(
        state => state.financialStatements
    );

    // Memoized values
    const units = useMemo(() => {
        const targetCurrency = financialData[documentId]?.data?.data?.[financialData[documentId]?.selectedCategory]?.targetCurrency?.toLowerCase();
        return targetCurrency === "inr"
            ? [
                { value: "thousand", label: "Thousand" },
                { value: "lakhs", label: "Lakhs" },
                { value: "millions", label: "Millions" },
                { value: "crores", label: "Crores" },
            ]
            : [
                { value: "thousand", label: "Thousand" },
                { value: "millions", label: "Millions" },
                { value: "billion", label: "Billion" },
            ];
    }, [financialData, documentId]);

    const statements = useMemo(() => {
        const data = financialData[documentId]?.data?.data;
        return data ? Object.keys(data) : [];
    }, [financialData, documentId]);

    const currentData = useMemo(() => (
        financialData[documentId]?.selectedCategory
            ? financialData[documentId]?.data?.data[financialData[documentId]?.selectedCategory]
            : null
    ), [financialData, documentId]);

    const showCurrencyAndUnit = useMemo(() => (
        currentData && currentData.currency !== "N/A" && currentData.unit !== "N/A"
    ), [currentData]);

    // Effects and callbacks
    useEffect(() => {
        if (statements.length > 0 && !financialData[documentId]?.selectedCategory) {
            dispatch(setSelectedCategory({ id: documentId, selectedCategory: statements[0] }));
        }
    }, [statements, financialData, dispatch, documentId]);

    const updateCurrencyAndUnit = useCallback(() => {
        if (!financialData[documentId]?.selectedCategory || !financialData[documentId]?.data?.data[financialData[documentId]?.selectedCategory]) {
            return;
        }

        const { currency: sourceCurrency, unit: sourceUnit } = financialData[documentId].data.data[financialData[documentId]?.selectedCategory];

        if (sourceCurrency && sourceCurrency !== "N/A" && !financialData[documentId]?.data?.data[financialData[documentId]?.selectedCategory]?.targetCurrency) {
            dispatch(setCurrency({ id: documentId, targetedCurrency: sourceCurrency.toLowerCase() }));
        }
        if (sourceUnit && sourceUnit !== "N/A" && !financialData[documentId]?.data?.data[financialData[documentId]?.selectedCategory]?.targetUnit) {
            dispatch(setUnit({ id: documentId, unit: sourceUnit.toLowerCase() }));
        }
    }, [financialData, documentId, dispatch]);

    useEffect(() => {
        updateCurrencyAndUnit();
    }, [updateCurrencyAndUnit]);

    const convertUnits = useCallback(async () => {
        if (!currentData?.content) return;
        const shouldConvert =
            currentData.currency !== "N/A" &&
            currentData.unit !== "N/A" &&
            (currentData.currency.toLowerCase() !== currentData.targetCurrency?.toLowerCase() ||
                currentData.unit.toLowerCase() !== currentData.targetUnit);

        try {
            if (shouldConvert) {
                const response = await fetch("/api/convert", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tableHtml: currentData.content,
                        sourceCurrency: currentData.currency,
                        sourceUnit: currentData.unit,
                        targetCurrency: currentData.targetCurrency?.toUpperCase(),
                        targetUnit: currentData.targetUnit,
                        decimals: parseInt(currentData.decimal?.toString() || DEFAULT_DECIMALS),
                    }),
                });

                if (!response.ok) throw new Error("Failed to convert units");
                const { convertedHtml: newHtml } = await response.json();
                setConvertedHtml(newHtml);
            } else {
                setConvertedHtml(currentData.content);
            }
        } catch (error) {
            console.error("Error converting units:", error);
            setConvertedHtml(currentData.content);
        }
    }, [currentData]);

    useEffect(() => {
        convertUnits();
    }, [convertUnits]);

    const handleCurrencyChange = useCallback((value: string) => {
        dispatch(setCurrency({ id: documentId, targetedCurrency: value.toLowerCase() }));
        dispatch(setUnit({ id: documentId, unit: value.toLowerCase() === "inr" ? "lakhs" : "millions" }));
    }, [dispatch, documentId]);

    const handleDownloadExcel = useCallback(async () => {
        try {
            const htmlContents = statements.map(statement => 
                financialData[documentId]?.data?.data[statement]?.content || ''
            );
            track("download_financials", { documentId });
            await downloadMultipleExcel(htmlContents, statements);
            await finalizeDownload();
        } catch (error) {
            console.error('Error downloading Excel:', error);
            toast.error('Failed to download Excel file');
        }
    }, [statements, financialData, documentId, downloadMultipleExcel, finalizeDownload]);

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="flex flex-col w-full h-[90vh] bg-white rounded-t-[10px] shadow-custom-blue ml-2">
            <div className="px-3 py-2 border-b-2 border-[#eaf0fc] flex flex-row items-center justify-between rounded-t-[10px]">
                <h2 className="text-lg font-medium text-[#001742] leading-6 m-0">
                    Financial Statements
                </h2>
                <X className="h-5 w-5 text-600 mr-2 cursor-pointer" onClick={onClose} />
            </div>

            {showCurrencyAndUnit && (
                <div className="flex flex-col md:flex-row items-start md:items-center px-3 py-2 bg-[#fffff] gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                        <SelectGroup label="Currency">
                            <Select value={currentData?.targetCurrency || currentData?.currency} onValueChange={handleCurrencyChange}>
                                <StyledSelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </StyledSelectTrigger>
                                <StyledSelectContent>
                                    {["inr", "usd", "eur", "gbp"].map(currency => (
                                        <SelectItem key={currency} value={currency} className="cursor-pointer">
                                            {currency.toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </StyledSelectContent>
                            </Select>
                        </SelectGroup>
                        <SelectGroup label="Unit">
                            <Select
                                value={currentData?.targetUnit}
                                onValueChange={(value) => dispatch(setUnit({ id: documentId, unit: value }))}
                            >
                                <StyledSelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                </StyledSelectTrigger>
                                <StyledSelectContent>
                                    {units.map(({ value, label }) => (
                                        <SelectItem
                                            key={value}
                                            value={value}
                                            className="cursor-pointer"
                                        >
                                            {label}
                                        </SelectItem>
                                    ))}
                                </StyledSelectContent>
                            </Select>
                        </SelectGroup>
                        <SelectGroup label="Decimal">
                            <Select value={currentData?.decimal?.toString() || DEFAULT_DECIMALS} onValueChange={(value) => dispatch(setDecimal({ id: documentId, decimal: parseInt(value) }))}>
                                <StyledSelectTrigger>
                                    <SelectValue placeholder="Select decimal" />
                                </StyledSelectTrigger>
                                <StyledSelectContent>
                                    {[0, 1, 2, 3, 4].map(value => (
                                        <SelectItem
                                            key={value}
                                            value={value.toString()}
                                            className="cursor-pointer"
                                        >
                                            {value}
                                        </SelectItem>
                                    ))}
                                </StyledSelectContent>
                            </Select>
                        </SelectGroup>
                    </div>
                </div>
            )}

            <Tabs
                value={financialData[documentId]?.selectedCategory}
                onValueChange={(value) => dispatch(setSelectedCategory({ id: documentId, selectedCategory: value }))}
                className="flex-1 flex flex-col overflow-hidden"
            >
                <div className="flex-1 overflow-auto scrollbar-hide px-3 py-2">
                    <Table>
                        <TableBody>
                            {statements.map((statement) => (
                                <TabsContent
                                    key={statement}
                                    value={statement}
                                    className="p-0 mt-0"
                                >
                                    <HTMLToShadcnTable htmlContent={convertedHtml} />
                                </TabsContent>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between w-full p-3 gap-2 border-t-2 border-[#eaf0fc] bg-white">
                    <div className="relative w-4/5 min-w-0 overflow-hidden">
                        <div className="flex w-full overflow-x-auto scrollbar-hide bg-[#eaf0fc] p-1 rounded-[6px]">
                            {statements.map((statement, index) => (
                                <React.Fragment key={statement}>
                                    <div
                                        onClick={() => dispatch(setSelectedCategory({ id: documentId, selectedCategory: statement }))}
                                        onMouseEnter={() => setHoveredDocumentId(statement)}
                                        onMouseLeave={() => setHoveredDocumentId(null)}
                                        className={`
                                            flex-shrink-0 px-4 py-2 text-[12px] font-medium text-[#4e5971] 
                                            rounded transition-colors duration-200 cursor-pointer
                                            hover:bg-white/80
                                            ${financialData[documentId]?.selectedCategory === statement ? "bg-white text-black" : ""}
                                        `}
                                    >
                                        {formatStatementName(statement)}
                                    </div>
                                    {index < statements.length - 1 && (
                                        <div className="flex items-center h-8">
                                            <div
                                                className={`w-[1px] h-5 bg-[#4e5971] mx-1 transition-opacity duration-300 
                                                    ${financialData[documentId]?.selectedCategory === statement ||
                                                        financialData[documentId]?.selectedCategory === statements[index + 1] ||
                                                        hoveredDocumentId === statement ||
                                                        hoveredDocumentId === statements[index + 1]
                                                        ? "opacity-0"
                                                        : "opacity-35"
                                                    }`}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleDownloadExcel}
                        className="w-1/5 min-w-[150px] bg-[#017736] hover:bg-[#017736]/90 
                                   py-2 px-4 rounded text-white transition-colors duration-200"
                    >
                        Export to Excel
                    </Button>
                </div>
            </Tabs>
        </div>
    );
}
