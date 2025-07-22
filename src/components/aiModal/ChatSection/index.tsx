import React, { useState, useEffect } from "react";
import { ArrowUpIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import MaximizeIcon from "../../../../public/images/arrows-maximize.svg";
import MinimizeIcon from "../../../../public/images/arrows-minimize.svg";
import Bynd from "../../../../public/images/ByndLogoFavicon.svg";
import { getSelectedData } from "@/redux/askAi/selector";
import { useSelector } from "react-redux";
import { Message } from "@/interface/components/aiModal.interface";
import { getSession } from "next-auth/react";
import ApiService from "@/services/service";
import ChartCard from "./ChartCard";
import { RootState } from "@/store/store";
import { toast } from "react-toastify";

const SuggestionCard = ({ text, onClick }: { text: string; onClick: () => void }) => (
    <div
        onClick={onClick}
        className="p-3 rounded border-1 border-[#eaf0fc] bg-[#fff] cursor-pointer hover:shadow-custom-blue"
    >
        <p className="text-sm text-[#001742]">{text}</p>
    </div>
);

export default function ChatSection() {
    const [prompt, setPrompt] = useState("");
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [isImageEnlarged, setIsImageEnlarged] = useState(false);
    const selectedContent = useSelector(getSelectedData);
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [currentLoadingMessageId, setCurrentLoadingMessageId] = useState<string | null>(null);
    const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const activeDocument = useSelector(
        (state: RootState) => state.projectDocuments.activeDocument,
    );
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (selectedContent?.type === "table" && selectedContent?.table_with_caption) {
                setIsLoadingSuggestions(true);
                try {
                    const session = await getSession();
                    const response = await fetch('https://backend-staging.bynd.ai/django/api/suggestions/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.accessToken}`,
                        },
                        body: JSON.stringify({
                            table_with_caption: selectedContent.table_with_caption
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch suggestions');
                    }

                    const data = await response.json();

                    const parsedSuggestions = data.suggestions && typeof data.suggestions === 'object' ?
                        Object.values(data.suggestions) :
                        Array.isArray(data.suggestions) ?
                            data.suggestions : [];

                    setDynamicSuggestions(parsedSuggestions);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);

                    setDynamicSuggestions([
                        "Can you analyze this data and create a visualization?",
                        "What are the key insights from this information?",
                        "Can you explain this in simpler terms?",
                        "What trends do you notice in this data?"
                    ]);
                } finally {
                    setIsLoadingSuggestions(false);
                }
            }
        };

        fetchSuggestions();
    }, [selectedContent?.type, selectedContent?.table_with_caption]);

    // Add listener to share chat messages with ResponseSection
    useEffect(() => {
        const handleRequestChatMessages = () => {
            window.dispatchEvent(new CustomEvent('chatMessagesUpdate', {
                detail: { messages: chatMessages }
            }));
        };

        window.addEventListener('requestChatMessages', handleRequestChatMessages);
        
        return () => {
            window.removeEventListener('requestChatMessages', handleRequestChatMessages);
        };
    }, [chatMessages]);

    // useEffect(() => {
    //     // Cleanup function for WebSocket
    //     return () => {
    //         if (socket) {
    //             socket.close();
    //             setSocket(null);
    //         }
    //     };
    // }, [socket]);

    const initializeWebSocket = async (messageId: string, transformation: string) => {
        try {
            // Close existing socket if any
            if (socket) {
                socket.close();
                setSocket(null);
            }

            // Dispatch event that connection is being established
            window.dispatchEvent(new CustomEvent('connectionStarted', {
                detail: { messageId, isConnecting: true }
            }));

            const session = await getSession();
            const wsUrl = "wss://chunking-orchestration.bynd.ai/ws/ask_ai";

            const ws = new WebSocket(wsUrl);

            ws.addEventListener('open', () => {
                console.log('WebSocket connection established');

                const payload = {
                    text: selectedContent?.content || "",
                    transformation: transformation,
                    token: session?.accessToken
                };
                console.log("payload", payload);
                ws.send(JSON.stringify(payload));
            });

            ws.addEventListener('message', (event) => {
                try {
                    const dataStr = event.data;
                    let content = "";
                    let isComplete = false;

                    if (dataStr.startsWith('data: ')) {
                        try {
                            const jsonStr = dataStr.replace('data: ', '');
                            const jsonData = JSON.parse(jsonStr);
                            content = jsonData.content || "";
                            isComplete = jsonData.type === 'done' || jsonData.type === 'end' || dataStr.includes('[DONE]');
                        } catch (e) {
                            // If JSON parsing fails, use the raw content
                            content = dataStr.replace('data: ', '');
                        }
                    } else {
                        // Try to parse as JSON if it's a JSON string
                        try {
                            const jsonData = JSON.parse(dataStr);
                            content = jsonData.content || "";
                        } catch (e) {
                            content = dataStr;
                        }
                    }

                    window.dispatchEvent(new CustomEvent('textStreaming', {
                        detail: {
                            content,
                            isComplete,
                            messageId: messageId
                        }
                    }));

                    if (isComplete) {
                        ws.close();
                    }
                } catch (error) {
                    console.error('Error handling WebSocket message:', error);
                }
            });

            ws.addEventListener('close', () => {
                console.log('WebSocket connection closed');
                setStreamingMessageId(null);
                setSocket(null);
            });

            ws.addEventListener('error', (error) => {
                console.error('WebSocket error:', error);
                toast.error("WebSocket connection lost. Retrying...");
                setChatMessages(prevMessages => [
                    ...prevMessages,
                    {
                        id: messageId,
                        text: "Sorry, there was an error connecting to the server. Please try again.",
                        isUser: false
                    }
                ]);
            });

            setSocket(ws);
            return ws;
        } catch (error) {
            console.error('Error initializing WebSocket:', error);
            toast.error("WebSocket connection lost. Retrying...");
            throw error;
        }
    };

    const TypingIndicator = () => {
        return (
            <div className="flex flex-col gap-2 p-2">
                <div className="flex justify-start items-start gap-2">
                    <Image src={Bynd} alt="ByndAI" className="w-8 h-8 p-1 rounded-full bg-white border-1 border-[#eaf0fc]" />
                    <div className="p-1 gap-2 flex justify-start items-center max-w-max bg-white rounded border-1 border-[#eaf0fc] cursor-not-allowed">
                        <div className=" h-full py-2 px-3 bg-[#f7f9fe] rounded flex items-center justify-center">
                            <Loader2 className="w-7 h-7 text-[#004ce6] animate-spin" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[#001742] text-sm font-medium">Generating...</span>
                            <span className="text-[#9babc7] text-xs font-normal">Please wait</span>
                        </div>
                    </div>
                </div>

            </div>
        );
    };

    console.log('selectedContent', selectedContent)
    const handleSendMessage = async (text: string, userPrompt: string) => {
        const session = await getSession();
        const messageId = Date.now().toString();

        let userMessage = {
            id: messageId,
            text: userPrompt,
            isUser: true,
        };

        setChatMessages((prevMessages) => [...prevMessages, userMessage]);
        setPrompt("");
        setCurrentLoadingMessageId(messageId);
        setIsTyping(true);

        // Reset streaming content and notify ResponseSection
        window.dispatchEvent(new CustomEvent('resetStreaming', {
            detail: { messageId }
        }));

        window.dispatchEvent(new CustomEvent('chartLoading', {
            detail: { isLoading: true }
        }));

        try {
            if (selectedContent?.type === "table") {
                const payload = {
                    table_html: selectedContent?.table_html[0]?.replace(/\n/g, ''),
                    table_with_caption: selectedContent?.table_with_caption,
                    user_prompt: userPrompt,
                    pdf_blob_url: activeDocument.url,
                    page_number: selectedContent.pageNumber,
                };
                console.log('payload', payload)
                const response = await ApiService.apiCall(
                    "POST",
                    `https://backend-staging.bynd.ai/django/api/table-to-chart/`,
                    payload,
                    session?.accessToken,
                );

                if (response && response?.data?.chart_base64) {
                    const chartMessage = {
                        id: messageId,
                        isUser: false,
                        filename: response?.data?.filename,
                        chartImage: response?.data?.chart_base64,
                        chartExcel: response?.data?.excel_base64,
                        title: selectedContent?.title,
                        messageId: messageId
                    };

                    setChatMessages((prevMessages) => [...prevMessages, chartMessage]);
                    handleChartSelect(chartMessage);
                } else {
                    throw new Error('Invalid chart response');
                }
            } else {
                const messageId = Date.now().toString();
                setStreamingMessageId(messageId);

                const initialMessage = {
                    id: messageId,
                    text: <div dangerouslySetInnerHTML={{ __html: "" }} />,
                    isUser: false,
                    transformedText: "",
                    filename: 'Transformed Text',
                    messageId: messageId
                };

                setChatMessages(prevMessages => [...prevMessages, initialMessage]);

                try {
                    await initializeWebSocket(messageId, userPrompt);
                } catch (error) {
                    console.error("WebSocket initialization error:", error);
                    setChatMessages(prevMessages => [
                        ...prevMessages,
                        {
                            id: messageId,
                            text: "Failed to establish connection. Please try again.",
                            isUser: false
                        }
                    ]);
                }
            }
        } catch (error) {
            console.error("Error getting AI response:", error);
            const errorMessage = {
                id: messageId,
                text: selectedContent?.type === "table"
                    ? "Sorry, I couldn't convert this table to a chart. Please try a different prompt."
                    : "Sorry, I couldn't process that request. Please try again.",
                isUser: false,
            };
            setChatMessages((prevMessages) => [...prevMessages, errorMessage]);

            if (selectedContent?.type === "table") {
                window.dispatchEvent(new CustomEvent('chartError', {
                    detail: {
                        error: "No graph conversion available for this request"
                    }
                }));
            } else {
                window.dispatchEvent(new CustomEvent('textError', {
                    detail: {
                        error: "Could not transform the text"
                    }
                }));
            }
        } finally {
            setCurrentLoadingMessageId(null);
            setIsTyping(false);

            window.dispatchEvent(new CustomEvent('chartLoading', {
                detail: { isLoading: false }
            }));
        }
    };

    const handleChartSelect = (chartMessage: any) => {
        if (selectedContent?.type === 'table') {
            const chartImage = chartMessage.chartImage.startsWith('data:')
                ? chartMessage.chartImage.split(',')[1]
                : chartMessage.chartImage;

            const messageId = chartMessage.id || chartMessage.messageId || Date.now().toString();

            window.dispatchEvent(new CustomEvent('chartSelected', {
                detail: {
                    chartImage: chartImage,
                    chartExcel: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${chartMessage.chartExcel}`,
                    title: chartMessage.title,
                    description: `Generated chart from table: ${chartMessage.title || 'Untitled'}`,
                    messageId: messageId,
                    originalMessage: chartMessage 
                }
            }));
        } else {
            window.dispatchEvent(new CustomEvent('textTransformed', {
                detail: {
                    transformedText: chartMessage.transformedText || "",
                    title: selectedContent?.title || 'Transformed Text',
                    description: `Transformed text: ${chartMessage.filename}`,
                    messageId: chartMessage.messageId || chartMessage.id || ""
                }
            }));
        }
    };

    const handleSuggestionClick = async (suggestion: string) => {
        setPrompt(suggestion);
        await handleSendMessage(selectedContent?.content || "", suggestion);
        setShowSuggestions(false);
    };

    const toggleImageSize = () => {
        setIsImageEnlarged((prev) => !prev);
    };

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-[100px]">

                {/* Original Table/Graph Image */}
                {selectedContent && selectedContent.imageSrc && (
                    <div className="flex justify-end items-center w-full relative mb-4">
                        <div className={`relative ${isImageEnlarged ? 'w-full' : 'w-1/2'} transition-all duration-300`}>
                            <button
                                className={`absolute bottom-[4%] left-[2%] flex items-center justify-center p-1.5 rounded ${isImageEnlarged ? 'bg-[#004CE6] border-[#EAF0FC]' : 'bg-white border-transparent'
                                    } z-10 cursor-pointer`}
                                onClick={toggleImageSize}
                                aria-label={isImageEnlarged ? "Minimize image" : "Maximize image"}
                            >
                                <Image
                                    src={isImageEnlarged ? MinimizeIcon : MaximizeIcon}
                                    alt={isImageEnlarged ? "Minimize" : "Maximize"}
                                    width={20}
                                    height={20}
                                />
                            </button>
                            <img
                                src={selectedContent.imageSrc}
                                alt="Selected Content"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                <div className="space-y-4">
                    {chatMessages.map((message, index) => (
                        <div key={message.id || index}>
                            <div className={`flex gap-1.5 ${message.isUser ? 'justify-end' : 'justify-start items-start'}`}>
                                {!message.isUser && (
                                    <Image
                                        src={Bynd}
                                        alt="ByndAI"
                                        className="w-8 h-auto p-1 rounded-full bg-white border-1 border-[#eaf0fc]"
                                    />
                                )}
                                {message.isUser ? (
                                    <div className={`max-w-[400px] p-2 rounded ${message.isUser
                                        ? 'bg-[#F7FAFC] text-[#1A1D1F]'
                                        : 'bg-white border-1 border-[#eaf0fc]'
                                        } text-sm break-words`}>
                                        {typeof message.text === 'string' ? message.text.replace(/_/g, " ") : message.text}
                                    </div>
                                ) : (
                                    message?.filename && (
                                        <ChartCard
                                            onClick={() => handleChartSelect(message)}
                                            filename={message.filename}
                                            modifyType={selectedContent?.type}
                                        />
                                    )
                                )}
                            </div>
                            {!message.isUser && !message.filename && (
                                <div className="ml-10 mt-2 max-w-[400px] p-2 rounded bg-white border-1 border-[#eaf0fc] text-sm break-words">
                                    {message.text}
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && <TypingIndicator />}
                </div>
            </div>

            {/* Chat Input Field */}
            <div className="sticky bottom-0 bg-white pt-1 pb-2">
                {selectedContent?.type === "table" && showSuggestions && chatMessages.length === 0 && (
                    <div className="space-y-1 mb-4">
                        {isLoadingSuggestions ? (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="h-12 bg-gray-200 rounded w-full" />
                                <div className="h-12 bg-gray-200 rounded w-full" />
                                <div className="h-12 bg-gray-200 rounded w-full" />
                                <div className="h-12 bg-gray-200 rounded w-full" />

                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {dynamicSuggestions.map((suggestion, index) => (
                                    <SuggestionCard
                                        key={index}
                                        text={suggestion}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {selectedContent?.type === "table" ? (
                    <div className="flex items-start gap-3 p-2 px-3 rounded-[12px] border-1 border-[#eaf0fc] bg-white">
                        <textarea
                            placeholder="Enter a prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && prompt.length > 0) {
                                    e.preventDefault();
                                    handleSendMessage(selectedContent.content, prompt);
                                }
                            }}
                            // disabled={isTyping}
                            className="flex-1 text-sm outline-none border-none bg-transparent text-[#001742] pr-10 h-[80px] resize-none py-2"
                        />
                        <button
                            onClick={() => handleSendMessage(selectedContent.content, prompt)}
                            className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${prompt.trim() === ""
                                ? "bg-[#e5e7eb] cursor-not-allowed"
                                : "bg-[#004ce6] hover:bg-[#0039b3]"
                                }`}
                            disabled={prompt.trim() === ""}
                        >
                            <ArrowUpIcon className={`w-5 h-5 ${prompt.trim() === "" ? "text-[#9babc7]" : "text-white"}`} />
                        </button>
                    </div>
                ) : (
                    selectedContent.type === "text" && (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => handleSuggestionClick("shorter")}
                                className="px-4 py-2 rounded border-1 border-[#F3F6FF] bg-[#fbfdff] text-[#001742] text-sm hover:bg-[#edf1fb] hover:border-[#dee6f5]"
                            >
                                Make shorter
                            </button>
                            <button
                                onClick={() => handleSuggestionClick("simpler")}
                                className="px-4 py-2 rounded border-1 border-[#F3F6FF] bg-[#fbfdff] text-[#001742] text-sm hover:bg-[#edf1fb] hover:border-[#dee6f5]"
                            >
                                Make simpler
                            </button>
                            <button
                                onClick={() => handleSuggestionClick("bullets")}
                                className="px-4 py-2 rounded border-1 border-[#F3F6FF] bg-[#fbfdff] text-[#001742] text-sm hover:bg-[#edf1fb] hover:border-[#dee6f5]"
                            >
                                Make bullets
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
