import React, { useState, useEffect, useRef } from "react";
import Header from './Header';
import { useSelector } from "react-redux";
import { getSelectedData } from "@/redux/askAi/selector";
import HTMLToTable from "../../Html/Table";
import DataTable from "../../Html/ObjectToTable";
import extractedTableStyles from "@/styles/ExtractedTableStyles.module.scss";
import styles from "@/styles/AskAimodal.module.scss";
import AnimatedGraphSkeleton from "@/components/Skeleton/GraphPreview";
import { ChartMessage } from "@/interface/components/aiModal.interface";
import { debounce } from "lodash";
import GraphChunkSkeleton from "@/components/Skeleton/GraphSkeleton";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Copy from "../../../../public/images/copy.svg";
import ClickedCopy from "../../../../public/images/ClickedCopy.svg"

export default function ResponseSection() {
    const [activeTab, setActiveTab] = useState<'preview' | 'datatable'>('datatable');
    const [selectedChart, setSelectedChart] = useState<ChartMessage | null>(null);
    const [availableCharts, setAvailableCharts] = useState<ChartMessage[]>([]);
    const chartMessagesRef = useRef<Map<string, ChartMessage>>(new Map());
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const selectedContent = useSelector(getSelectedData);
    const [tableData, setTableData] = useState<{ [key: string]: { values: (string | number)[]; assumed: boolean[]; } } | null>(null);
    const [previousChartUrl, setPreviousChartUrl] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [transformedText, setTransformedText] = useState<string | null>(null);
    const [streamingContent, setStreamingContent] = useState("");
    const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
    const [messageContents, setMessageContents] = useState<{ [key: string]: string }>({});
    const [isConnecting, setIsConnecting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleExportChart = (selectedCharts: ChartMessage[]) => {
        if (selectedCharts.length === 0) return;

        setIsExporting(true);
        exportChartsInSequence(selectedCharts);
    };

    const exportChartsInSequence = async (charts: ChartMessage[]) => {
        try {
            for (const chart of charts) {
                if (!chart?.chartExcel) continue;

                const excelDataUrl = chart.chartExcel.startsWith('data:')
                    ? chart.chartExcel
                    : `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${chart.chartExcel}`;

                const response = await fetch(excelDataUrl);
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                try {
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = `${chart.title || 'chart'}.xlsx`;
                    link.click();

                    await new Promise(resolve => setTimeout(resolve, 500));
                } finally {
                    URL.revokeObjectURL(objectUrl);
                }
            }
        } catch (error) {
            console.error('Error exporting charts:', error);
            toast.error('Failed to export some charts');
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        const handleResetStreaming = (event: CustomEvent<{ messageId: string }>) => {
            const { messageId } = event.detail;
            setActiveMessageId(messageId);
            setStreamingContent("");
            setTransformedText(null);
            setIsLoading(true);
            setIsConnecting(true);
        };

        const handleTextTransformed = (event: CustomEvent<{ transformedText: string; messageId: string }>) => {
            const { transformedText, messageId } = event.detail;
            setActiveMessageId(messageId);
            setTransformedText(transformedText);
            setStreamingContent(messageContents[messageId] || "");
            setActiveTab('preview');
            setError(null);
            setIsLoading(false);
            setIsConnecting(false);
        };

        const handleConnectionStarted = (event: CustomEvent<{ messageId: string; isConnecting: boolean }>) => {
            const { messageId, isConnecting } = event.detail;
            if (messageId) {
                setActiveMessageId(messageId);
                setIsConnecting(isConnecting);
                setActiveTab('preview');
            }
        };

        const handleTextStreaming = (event: CustomEvent<{ content: string; isComplete: boolean; messageId: string }>) => {
            const { content, isComplete, messageId } = event.detail;

            if (isConnecting) {
                setIsConnecting(false);
            }

            let processedContent = content;
            try {
                if (content.startsWith('{') && content.endsWith('}')) {
                    const jsonContent = JSON.parse(content);
                    processedContent = jsonContent.content || '';
                }
            } catch (e) {
                processedContent = content;
            }

            if (isComplete) {
                setActiveTab('preview');
                setIsLoading(false);
                const finalContent = (messageContents[messageId] || "") + processedContent;
                setMessageContents(prev => ({
                    ...prev,
                    [messageId]: finalContent
                }));
                setTransformedText(finalContent);
            } else {
                setMessageContents(prev => ({
                    ...prev,
                    [messageId]: (prev[messageId] || "") + processedContent
                }));
                if (messageId === activeMessageId) {
                    setStreamingContent(prev => prev + processedContent);
                }
            }
        };

        window.addEventListener('resetStreaming', handleResetStreaming as EventListener);
        window.addEventListener('textTransformed', handleTextTransformed as EventListener);
        window.addEventListener('textStreaming', handleTextStreaming as EventListener);
        window.addEventListener('connectionStarted', handleConnectionStarted as EventListener);

        return () => {
            window.removeEventListener('resetStreaming', handleResetStreaming as EventListener);
            window.removeEventListener('textTransformed', handleTextTransformed as EventListener);
            window.removeEventListener('textStreaming', handleTextStreaming as EventListener);
            window.removeEventListener('connectionStarted', handleConnectionStarted as EventListener);
        };
    }, [isLoading, messageContents, activeMessageId, isConnecting]);

    useEffect(() => {
        const handleChatMessagesUpdate = (event: CustomEvent<{ messages: any[] }>) => {
            const { messages } = event.detail;
            if (!messages || !Array.isArray(messages)) return;

            interface ChatMessage {
                id?: string;
                messageId?: string;
                isUser: boolean;
                filename: string;
                chartImage: string;
                chartExcel: string;
                title?: string;
            }

            const uniqueChartMessages = messages.reduce((acc: Map<string, ChatMessage>, msg) => {
                if (!msg.isUser && msg.filename && msg.chartImage && msg.chartExcel) {
                    const messageId = msg.id || msg.messageId;
                    if (messageId && !acc.has(messageId)) {
                        acc.set(messageId, msg);
                    }
                }
                return acc;
            }, new Map());

            chartMessagesRef.current.clear();

            uniqueChartMessages.forEach((msg: ChatMessage, messageId: string) => {
                chartMessagesRef.current.set(messageId, {
                    chartImage: msg.chartImage,
                    chartExcel: msg.chartExcel,
                    title: msg.title || msg.filename,
                    description: `Generated chart from table: ${msg.title || msg.filename || 'Untitled'}`,
                    messageId: messageId
                });
            });

            setAvailableCharts(Array.from(chartMessagesRef.current.values()));
        };

        window.dispatchEvent(new CustomEvent('requestChatMessages'));

        window.addEventListener('chatMessagesUpdate', handleChatMessagesUpdate as EventListener);

        return () => {
            window.removeEventListener('chatMessagesUpdate', handleChatMessagesUpdate as EventListener);
        };
    }, []);

    useEffect(() => {
        const handleChartSelected = (event: CustomEvent<ChartMessage>) => {
            const chartData = event.detail;
            setSelectedChart(chartData);

            const chartExists = chartMessagesRef.current.has(chartData.messageId || '');

            if (!chartExists && chartData.messageId) {
                chartMessagesRef.current.set(chartData.messageId, chartData);
                setAvailableCharts(Array.from(chartMessagesRef.current.values()));
            }

            setActiveTab('preview');
            setError(null);
        };

        const handleChartError = (event: CustomEvent<{ error: string }>) => {
            setError(event.detail.error);
            setActiveTab('preview');
        };

        const handleChartLoading = (event: CustomEvent<{ isLoading: boolean }>) => {
            setIsLoading(event.detail.isLoading);
            if (event.detail.isLoading) {
                setActiveTab('preview');
            }
        };

        const handleTextError = (event: CustomEvent<{ error: string }>) => {
            setError(event.detail.error);
            setActiveTab('preview');
        };

        window.addEventListener('chartSelected', handleChartSelected as EventListener);
        window.addEventListener('chartError', handleChartError as EventListener);
        window.addEventListener('chartLoading', handleChartLoading as EventListener);
        window.addEventListener('textError', handleTextError as EventListener);

        return () => {
            window.removeEventListener('chartSelected', handleChartSelected as EventListener);
            window.removeEventListener('chartError', handleChartError as EventListener);
            window.removeEventListener('chartLoading', handleChartLoading as EventListener);
            window.removeEventListener('textError', handleTextError as EventListener);
        };
    }, []);

    useEffect(() => {
        if (!selectedChart && availableCharts.length > 0) {
            setSelectedChart(availableCharts[availableCharts.length - 1]);
        }
    }, [availableCharts, selectedChart]);

    useEffect(() => {
        if (selectedContent?.extractedData) {
            setTableData(selectedContent.extractedData);
        }

        if (selectedContent?.type === "graph") {
            const chartUrl = `https://byndconsumptionfunctionapp.azurewebsites.net/api/chart_to_table_conversion?chart_url=${selectedContent.imageSrc}`;
            if (chartUrl !== previousChartUrl) {
                setTableData(null);
                setPreviousChartUrl(chartUrl);
            }

            const debouncedFetchData = debounce(async () => {
                setIsLoadingData(true);
                try {
                    const response = await fetch(chartUrl, {
                        method: "POST",
                        headers: {
                            "x-functions-key":
                                "LSxUveo3KBynFoUqlQDlKxMfOwz4T7YSZoRL_cNkctXiAzFuXeC4cQ==",
                            "Content-Type": "application/json",
                        },
                    });
                    const data = await response.json();
                    setTableData(data.source_table);
                } catch (error) {
                    console.error("Error fetching AI response:", error);
                } finally {
                    setIsLoadingData(false);
                }
            }, 300);

            debouncedFetchData();

            return () => {
                debouncedFetchData.cancel();
            };
        }
    }, [selectedContent, previousChartUrl]);

    useEffect(() => {
        if (selectedContent?.type === 'table') {
            window.dispatchEvent(new CustomEvent('requestChatMessages'));
        } else if (selectedContent && selectedContent.type !== 'table') {
            setAvailableCharts([]);
            chartMessagesRef.current.clear();
        }
    }, [selectedContent]);

    const formatText = (text: string) => {
        if (!text) return '';

        let formattedText = text.includes('**') ?
            text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') :
            text;

        formattedText = formattedText.replace(/\n/g, '<br />');

        return formattedText;
    };

    const renderChart = () => {
        if (isConnecting && selectedContent?.type === 'text') {
            return (
                <div className="w-full h-full bg-white rounded p-4">
                    <div className="space-y-4">
                        <div className="h-5 bg-gray-200 rounded-md w-3/4 animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-10/12 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-11/12 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-9/12 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-7/12 animate-pulse" />
                        </div>
                    </div>
                </div>
            );
        }

        if (isLoading && selectedContent?.type === 'text') {
            return (
                <div className="w-full h-full flex flex-col bg-white rounded p-3">
                    <div className="w-full flex-1 overflow-auto">
                        <div
                            className="text-sm text-[#4e5971] whitespace-pre-wrap break-words"
                            dangerouslySetInnerHTML={{ __html: formatText(streamingContent) }}
                        />
                    </div>
                </div>
            );
        }

        if (isLoading) {
            return (
                <>
                    {selectedContent?.type === 'text' ? (
                        <div className="space-y-3 bg-white rounded p-3 w-full h-full">
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-10/12" />
                            <div className="h-4 bg-gray-200 rounded w-8/12" />
                            <div className="h-4 bg-gray-200 rounded w-6/12" />
                        </div>
                    ) : (<AnimatedGraphSkeleton />)}
                </>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                    {error}
                </div>
            );
        }

        if (selectedContent?.type === 'text') {
            const textToDisplay = transformedText || streamingContent;

            if (!textToDisplay && !streamingContent && !isLoading && !isConnecting) {
                return (
                    <div className="w-full h-full bg-white rounded p-4">
                        <div className="space-y-4">
                            <div className="h-5 bg-gray-200 rounded-md w-3/4 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-10/12 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-11/12 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-9/12 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-7/12 animate-pulse" />
                            </div>
                        </div>
                    </div>
                );
            }

            const handleCopyText = () => {
                navigator.clipboard.writeText(textToDisplay)
                    .then(() => {
                        toast.success('Text copied to clipboard')
                        setIsCopied(true)
                        setTimeout(() => {
                            setIsCopied(false)
                        }, 2000)
                    })
                    .catch(() => toast.error('Failed to copy text'));
            };

            return (
                <div className="w-full h-full flex flex-col bg-white rounded-t p-3">
                    <div className="w-full flex-1 overflow-auto relative">
                        {textToDisplay && (
                            <div className="flex justify-end">
                                <Image
                                    className="cursor-pointer w-6 h-6 p-1 transition-colors duration-200 ease-in-out hover:rounded"
                                    src={isCopied ? ClickedCopy : Copy}
                                    alt={isCopied ? "Copied" : "Copy"}
                                    width={20}
                                    height={20}
                                    onClick={handleCopyText}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCopyText()}
                                />
                            </div>
                        )}
                        <div
                            className="text-sm text-[#4e5971] whitespace-pre-wrap break-words pr-3"
                            dangerouslySetInnerHTML={{ __html: formatText(textToDisplay) }}
                        />
                    </div>
                </div>
            );
        }

        if (!selectedChart?.chartImage) {
            return (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                    No chart available to preview
                </div>
            );
        }

        const imageUrl = selectedChart.chartImage.startsWith('data:')
            ? selectedChart.chartImage
            : `data:image/png;base64,${selectedChart.chartImage}`;

        return (
            <div className="w-full h-full flex flex-col items-center bg-white rounded p-3">
                <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={selectedChart.title || "Chart visualization"}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                            console.error('Error loading image:', e);
                            const target = e.target as HTMLImageElement;
                            target.alt = 'Error loading chart';
                        }}
                    />
                </div>
            </div>
        );
    };
    const renderContent = () => {
        if (!selectedContent) {
            return <div className="flex items-center justify-center w-full h-full text-gray-500">No content selected</div>;
        }

        const commonHeader = (
            <div className={styles.tableHeader}>
                <h5 className="text-sm text-[#001742] font-medium">{selectedContent.tableHead || selectedContent?.title}</h5>
                <p className="m-0 text-xs text-[#4e5971]">{selectedContent.content || selectedContent?.description}</p>
            </div>
        );

        switch (selectedContent.type) {
            case 'graph':
                return (
                    <div className='w-full h-full flex flex-col gap-2 bg-transparent rounded px-2 pt-2 pb-[200px] overflow-auto scrollbar-hide'>
                        {commonHeader}
                        {isLoadingData ? (
                            <GraphChunkSkeleton />
                        ) : (
                            selectedContent?.type === "graph" && (
                                <DataTable
                                    data={tableData}
                                    key={previousChartUrl || selectedContent.imageSrc}
                                />
                            )
                        )}
                    </div>
                );

            case 'table':
                return (
                    <div className='w-full h-full flex flex-col gap-2 bg-transparent rounded px-2 pt-2 pb-[200px] overflow-auto scrollbar-hide'>
                        {commonHeader}
                        {(selectedContent?.extractedData?.[0] || selectedContent?.table_html) && (
                            <HTMLToTable
                                htmlContent={
                                    Array.isArray(selectedContent?.table_html)
                                        ? selectedContent.table_html[0]
                                        : typeof selectedContent?.table_html === 'string'
                                            ? selectedContent.table_html
                                            : ''
                                }
                                className={extractedTableStyles.styledTable}
                            />
                        )}
                    </div>
                );

            default: // text type
                return (
                    <div className='w-full h-full flex flex-col gap-2 bg-transparent rounded px-2 pt-2 pb-[200px] overflow-auto scrollbar-hide'>
                        {selectedContent.generated_title && (
                            <h6 className="text-md font-medium text-[#001742]">{selectedContent.generated_title}</h6>
                        )}
                        {selectedContent.messages && selectedContent.messages.length > 0 ? (
                            <h4 className="text-md font-medium text-[#001742]">{selectedContent.messages}</h4>
                        ) : (
                            typeof selectedContent.content === "string" && (
                                <p className="text-gray-500">No AI summary available for this text chunk</p>
                            )
                        )}

                        <div className={styles.content}>
                            {typeof selectedContent.content === "string" ? (
                                <p className="text-sm text-[#4e5971]">{selectedContent.content}</p>
                            ) : (
                                Array.isArray(selectedContent.content) && (
                                    selectedContent.content.map((section: any, index: number) => (
                                        <div key={index} className={styles.subSectionContent}>
                                            <h4>{section.heading}</h4>
                                            <ul>
                                                {section.points.map((point: any, pointIndex: number) => (
                                                    <li key={pointIndex}>{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                )

                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header>
                <Header
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    hasChartData={availableCharts.length > 0 || isLoading}
                    modifyType={selectedContent?.type}
                    onExportChart={handleExportChart}
                    isLoading={isLoading || isExporting}
                    availableCharts={availableCharts}
                />
            </header>
            <main className="flex w-full h-full bg-[#F3F6FF] p-1 pb-0">
                {activeTab === 'preview' ? (
                    renderChart()
                ) : (
                    renderContent()
                )}
            </main>
        </div>
    );
}