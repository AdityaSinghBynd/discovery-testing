import React, { useState, useRef, useEffect } from "react";
import { Eye, LetterText, Table2, ChevronDown, CheckSquare, Square, X, Loader2 } from "lucide-react";
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ExcelIcon from "../../../../../public/images/excelIcon.svg";
import { ChartMessage } from "@/interface/components/aiModal.interface";

interface HeaderProps {
    activeTab: 'preview' | 'datatable';
    onTabChange: (tab: 'preview' | 'datatable') => void;
    hasChartData: boolean;
    modifyType: 'table' | 'text' | undefined;
    onExportChart: (selectedCharts: ChartMessage[]) => void;
    isLoading: boolean;
    availableCharts: ChartMessage[];
}

export default function Header({ activeTab, onTabChange, hasChartData, modifyType, onExportChart, isLoading, availableCharts }: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCharts, setSelectedCharts] = useState<{ [key: string]: boolean }>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isDropdownOpen) {
            setSelectedCharts({});
        }
    }, [isDropdownOpen]);

    const handleToggleChart = (messageId: string | undefined) => {
        if (!messageId) return;

        setSelectedCharts(prev => ({
            ...prev,
            [messageId]: !prev[messageId]
        }));
    };

    const handleExportSelected = () => {
        const chartsToExport = availableCharts.filter(chart =>
            chart.messageId && selectedCharts[chart.messageId]
        );

        if (chartsToExport.length > 0) {
            onExportChart(chartsToExport);
            setIsDropdownOpen(false);
        }
    };


    return (
        <>
            {(modifyType === 'table' || modifyType === 'text') && (
                <div className="flex justify-between items-center w-full gap-2 py-1 px-2">
                    {/* Toggle Buttons */}
                    <div className="flex items-center gap-2 bg-[#f7f9fe] rounded p-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className={`flex items-center gap-2 rounded p-2 hover:bg-[#fff] border-none ${modifyType === 'text' ? '' : !hasChartData ? 'opacity-50 cursor-not-allowed' : ''
                                            } ${activeTab === 'preview' ? 'bg-[#fff]' : 'text-[#9babc7]'}`}
                                        onClick={() => (modifyType === 'text' || hasChartData) && onTabChange('preview')}
                                        disabled={modifyType === 'table' && !hasChartData}
                                    >
                                        <Eye width={18} height={18} />
                                        <span className="text-sm font-medium">
                                            {modifyType === 'table' ? 'Chart Preview' : 'Transformed Text'}
                                        </span>
                                    </button>
                                </TooltipTrigger>
                                {modifyType === 'table' && !hasChartData && (
                                    <TooltipContent className="bg-white rounded border-0 shadow-custom-blue">
                                        <p>No chart data available to preview</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        <button
                            className={`flex items-center gap-2 rounded p-2 hover:bg-[#fff] border-none ${activeTab === 'datatable' ? 'bg-[#fff]' : 'text-[#9babc7]'}`}
                            onClick={() => onTabChange('datatable')}
                        >
                            {modifyType === 'table' ? <Table2 width={18} height={18} /> : <LetterText width={18} height={18} />}
                            <span className="text-sm font-medium">{modifyType === 'table' ? 'Source table' : 'Original Text'}</span>
                        </button>
                    </div>

                    {modifyType === 'table' && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className={`flex items-center gap-2 bg-[#ECF7F4] hover:bg-[#D9F7F0] text-sm p-2 rounded border-none ${!hasChartData || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !isLoading && setIsDropdownOpen(prev => !prev)}
                                disabled={!hasChartData || isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 text-[#004ce6] animate-spin" />
                                ) : (
                                    <Image src={ExcelIcon} alt="Excel Icon" width={24} height={24} />
                                )}
                                {isLoading ? 'Preparing chart...' : 'Export charts'}
                                {!isLoading && <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isDropdownOpen && availableCharts.length > 0 && (
                                <div className="absolute right-0 top-full mt-1 w-72 bg-white shadow-custom-blue rounded border-1 border-[#eaf0fc] z-50">
                                    <div className="flex justify-between items-center px-3 py-2 border-b-2 border-[#eaf0fc]">
                                        <p className="text-sm font-medium text-[#001742]">Select charts to export</p>
                                    </div>

                                    <div className="max-h-60 overflow-y-auto py-1">
                                        {availableCharts.map((chart, index) => (
                                            <div
                                                key={chart.messageId || `chart-${index}`}
                                                className="px-3 py-2 hover:bg-[#f7f9fe] cursor-pointer border-b border-[#eaf0fc] last:border-b-0"
                                                onClick={() => handleToggleChart(chart.messageId)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {chart.messageId && selectedCharts[chart.messageId] ? (
                                                        <CheckSquare className="w-4 h-4 text-[#004ce6]" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-[#9babc7]" />
                                                    )}
                                                    <div className="flex-1 flex items-center gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-[#001742] truncate max-w-[220px]">
                                                                {chart.originalMessage?.filename?.replace(/_/g, ' ') || chart.title || `Chart ${index + 1}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-[#eaf0fc] p-3">
                                        <button
                                            className={`w-full flex justify-center items-center gap-2 bg-[#ECF7F4] hover:bg-[#D9F7F0] text-sm p-2 rounded border-none`}
                                            onClick={handleExportSelected}
                                        >
                                            <Image src={ExcelIcon} alt="Excel Icon" width={20} height={20} />
                                            Export
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}