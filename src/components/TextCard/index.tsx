import { ChevronRight, List, Plus, Trash, ExternalLink, Check, CircleCheck } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import ToolBar from '@/components/ToolBar';
import { truncateText } from '@/utils/utils';
import { TextCardProps, ChunksTextCardProps, SearchTextCardProps, WorkspaceTextCardProps } from './TextCard.interface';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSectionAndSubheading } from '@/hooks/useSectionAndSubheading';
import { useCardInteractions } from '@/hooks/useCardInteractions';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const isChunksVariant = (props: TextCardProps): props is ChunksTextCardProps => {
    return props.variant === 'chunks';
};

const isSearchVariant = (props: TextCardProps): props is SearchTextCardProps => {
    return props.variant === 'search';
};

const isWorkspaceVariant = (props: TextCardProps): props is WorkspaceTextCardProps => {
    return props.variant === 'workspace';
};

export default function TextCard(props: TextCardProps) {
    const { textData, variant, onAddToWorkspace, index } = props;
    const [isExpanded, setIsExpanded] = useState(false);
    const { getSectionAndSubheading: getSection } = useSectionAndSubheading();
    const [isAdded, setIsAdded] = useState(false);
    const activeDocument = useSelector(
        (state: RootState) => state.projectDocuments.activeDocument,
      );

    const {
        handleSearchClick,
        handleAddTextToWorkspace,
        handleTextAskAI,
        selectedDocuments
    } = useCardInteractions({ variant });

    const getTitle = () => {
        if (isChunksVariant(props)) {
            return props.textData.generated_title;
        }
        if (isSearchVariant(props)) {
            return props.textData.title;
        }
        return props.textData.contentTitle;
    };

    const handleAddToWorkspace = useCallback(async () => {
        const content = isChunksVariant(props) ? props.textData.content :
            isSearchVariant(props) ? props.textData.text :
                props.textData.contentTitle;

        const pageNumber = isSearchVariant(props) ? props.textData.parent_chunk_page_num :
            isWorkspaceVariant(props) ? props.textData.pageNumber : activeDocument?.lockedPage;

        await handleAddTextToWorkspace(
            props.textData,
            isSearchVariant(props) ? props.textData.title : getTitle(),
            pageNumber,
            content
        );

        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    }, [props, handleAddTextToWorkspace, getTitle]);

    const handleAskAI = useCallback(() => {
        if (isChunksVariant(props) && props.onAskAI) {
            props.onAskAI(props.textData, index, "text");
        } else if (isSearchVariant(props) || isWorkspaceVariant(props)) {
            const content = isSearchVariant(props) ? props.textData.text : props.textData.content;
            const pageNumber = isSearchVariant(props) ? props.textData.parent_chunk_page_num : props.textData.pageNumber;

            handleTextAskAI(
                props.textData,
                index,
                getTitle(),
                content,
                pageNumber
            );
        }
    }, [props, index, handleTextAskAI, getTitle]);

    const renderContent = () => {
        if (isSearchVariant(props)) {
            return (
                <p className='text-sm text-[#4e5971]'>
                    {truncateText(props.textData.parent_chunk_content, isExpanded ? Infinity : 400)}
                </p>
            );
        }

        if (isWorkspaceVariant(props)) {
            return (
                <p className='text-sm text-[#4e5971]'>
                    {truncateText(props.textData.content, isExpanded ? Infinity : 400)}
                </p>
            );
        }

        if (isChunksVariant(props)) {
            return (
                <>
                    {props.textData.aiSummary ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ children }) => (
                                    <p style={{ fontSize: "14px", color: "#4E5971" }}>
                                        {children}
                                    </p>
                                ),
                                li: ({ children }) => (
                                    <li style={{
                                        fontSize: "14px",
                                        listStyleType: "disc",
                                        color: "#4E5971",
                                    }}>
                                        {children}
                                    </li>
                                ),
                            }}
                        >
                            {props.textData.aiSummary}
                        </ReactMarkdown>
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ children }) => (
                                    <p style={{ fontSize: "14px", color: "#4E5971" }}>
                                        {children}
                                    </p>
                                ),
                                li: ({ children }) => (
                                    <li style={{
                                        fontSize: "14px",
                                        listStyleType: "disc",
                                        color: "#4E5971",
                                    }}>
                                        {children}
                                    </li>
                                ),
                            }}
                        >
                            {props.messages[index]?.join("") || ""}
                        </ReactMarkdown>
                    )}
                </>
            );
        }

        return null;
    };

    const renderActionButtons = () => {
        if (variant !== 'workspace' && variant !== 'search') return null;

        return (
            <div className={`${isExpanded ? 'flex' : 'hidden group-hover:flex'} items-center justify-end gap-2`}>
                {variant === 'workspace' && (
                    <button onClick={(e) => {
                        e.stopPropagation();
                        if (props.onDelete) {
                            props.onDelete(props.textData.id);
                        }
                    }}>
                        <Trash className='w-4 h-4 hover:text-red-600' />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isAdded) {
                            if (isWorkspaceVariant(props) && props.onAddContent) {
                                props.onAddContent(
                                    props.textData.content, 
                                    undefined,
                                    props.textData.contentTitle,
                                    props.textData.pageNumber,
                                    null
                                );
                            } else {
                                handleAddToWorkspace();
                            }
                            setIsAdded(true);
                            setTimeout(() => {
                                setIsAdded(false);
                            }, 2000);
                        }
                    }}
                    className="transition-all duration-200 ease-in-out"
                >
                    {isAdded ? (
                        <CircleCheck className='w-4 h-4 text-blue-600' />
                    ) : (
                        <Plus className='w-4 h-4' />
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className='flex flex-col w-full'>
            {/* DEFAULT CARD */}
            <main
                onClick={() => setIsExpanded(!isExpanded)}
                className={`rounded p-2 pb-0 w-full border-1 border-transparent
                    flex flex-col group cursor-pointer gap-1 transition-all duration-200 ease-in
                    ${isChunksVariant(props)
                       ? `${isExpanded ? 'bg-[#ffffff] shadow-custom-blue' : 'bg-[#f7f9fe] hover:bg-[#ffffff] hover:shadow-custom-blue'}`
                       : isSearchVariant(props)
                          ? `hover:bg-[#f7f9fe] ${isExpanded ? 'bg-[#f7f9fe] shadow-custom-blue' : 'bg-[#ffffff] hover:shadow-custom-blue'}`
                          : isWorkspaceVariant(props)
                             ? `${isExpanded ? 'bg-[#ffffff] shadow-custom-blue' : 'bg-[#f7f9fe] hover:bg-[#ffffff] hover:shadow-custom-blue'}`
                             : ''
                    }
                  `}
            >
                <header className='flex items-center justify-start gap-2 w-full flex-none'>
                    <div className='flex flex-none items-center self-start justify-center p-1 rounded bg-[#eaecf5]'>
                        <List className='w-5 h-5 text-[#001742]' />
                    </div>
                    <div className='flex flex-col flex-grow gap-[2px] w-full'>
                        <p className='text-md text-[#001742] font-medium flex items-center justify-start gap-1'>
                            {getTitle()}
                            <label className='cursor-pointer'>
                                {variant === 'search' && <ExternalLink className='w-4 h-4' onClick={() => handleSearchClick(props.textData.parent_chunk_page_num, index)} />}
                            </label>
                        </p>
                        {variant === 'search' && (
                            <p className='text-sm text-[#001742] flex items-center justify-start font-normal'>
                                {getSection(0, props.textData.parent_chunk_page_num, selectedDocuments[index]?.id)}
                                <ChevronRight className='w-5 h-5 text-[#9babc7]' />
                                <span className='text-sm text-[#001742] font-medium'>
                                    Page: {isSearchVariant(props) && props.textData.parent_chunk_page_num}
                                </span>
                            </p>
                        )}
                        {variant === 'workspace' && (
                            <p className='text-sm text-[#001742] flex items-center justify-start font-normal'>
                                {props.textData.sectionName}
                                <ChevronRight className='w-5 h-5 text-[#9babc7]' />
                                <span className='text-sm text-[#001742] font-medium'>
                                    Page: {props.textData.pageNumber}
                                </span>
                            </p>
                        )}
                    </div>

                    {renderActionButtons()}
                </header>

                <div className='relative mt-2'>
                    {isExpanded && (
                        <div className={`absolute z-50 ${isChunksVariant(props) ? '-top-8 -right-2' : '-top-10 right-0'}`}>
                            <ToolBar
                                context={{
                                    contentToCopy: isChunksVariant(props) ? props.textData.content :
                                        isSearchVariant(props) ? props.textData.text :
                                            props.textData.content,
                                    tableTitle: getTitle(),
                                    isTable: false,
                                    isTextChunk: true,
                                    tableId: "",
                                    currentPage: isSearchVariant(props) ? props.textData.parent_chunk_page_num :
                                        isWorkspaceVariant(props) ? props.textData.pageNumber : 0,
                                }}
                                onAddToWorkspace={handleAddToWorkspace}
                                isSearch={variant === 'search'}
                                isWorkspace={variant === 'workspace'}
                                onAskAI={handleAskAI}
                                features={{
                                    showActionButtons: true,
                                    showModifyButton: isChunksVariant(props) || isSearchVariant(props) || isWorkspaceVariant(props)
                                }}
                            />
                        </div>
                    )}

                    <section className='pl-[38px] w-full flex-grow overflow-auto cursor-pointer'>
                        {renderContent()}
                    </section>
                </div>
            </main>

            {/* EXPANDED CONTENT FOR CHUNKS VARIANT ONLY */}
            <div className={`
                overflow-hidden transition-all duration-300 ease-in-out relative
                ${isExpanded && isChunksVariant(props) ? 'max-h-[250px] opacity-100' : 'max-h-0 opacity-0'}
            `}>
                {isExpanded && isChunksVariant(props) && (
                    <div className='border-1 border-[#eaf0f6] bg-[#ffffff] rounded mt-1'>
                        <section className='pl-[44px] py-2 w-full max-h-[200px] overflow-y-auto'>
                            <p className='text-sm text-[#4e5971]'>
                                {props.textData.content}
                            </p>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}