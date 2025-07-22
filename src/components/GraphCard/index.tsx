import { ChevronRight, Plus, Trash, ExternalLink, ChartColumnIcon, CircleCheck } from 'lucide-react'
import React, { useState, useCallback, useMemo } from 'react'
import ToolBar from '@/components/ToolBar';
import { GraphCardProps, ChunksGraphCardProps, SearchGraphCardProps, WorkspaceGraphCardProps } from './GraphCard.interface';
import { useSectionAndSubheading } from '@/hooks/useSectionAndSubheading';
import { useSelector } from 'react-redux';
import { useCardInteractions } from '@/hooks/useCardInteractions';
import { RootState } from '@/store/store';

const isChunksVariant = (props: GraphCardProps): props is ChunksGraphCardProps => {
   return props.variant === 'chunks';
};

const isSearchVariant = (props: GraphCardProps): props is SearchGraphCardProps => {
   return props.variant === 'search';
};

const isWorkspaceVariant = (props: GraphCardProps): props is WorkspaceGraphCardProps => {
   return props.variant === 'workspace';
};

export default function GraphCard(props: GraphCardProps) {
   const { graphData, variant, onAddToWorkspace, index } = props;
   const [isExpanded, setIsExpanded] = useState(false);
   const [isAdded, setIsAdded] = useState(false);
   const { getSectionAndSubheading: getSection } = useSectionAndSubheading();
   const { activeDocument } = useSelector(
      (state: RootState) => state.projectDocuments,
   );

   // Use the card interactions hook instead of implementing handlers directly
   const {
      handleSearchClick,
      handleAddGraphToWorkspace,
      handleGraphAskAI,
      selectedDocuments
   } = useCardInteractions({ variant });

   const getTitle = () => {
      if (isWorkspaceVariant(props)) {
         return props.graphData.contentTitle;
      }
      return props.graphData.title;
   };

   const getPageNumber = () => {
      if (isWorkspaceVariant(props)) {
         return props.graphData.pageNumber;
      }
      if (isSearchVariant(props)) {
         return props.graphData.page_num;
      }
      if (isChunksVariant(props)) {
         return props.pageNumber;
      }
      return null;
   };

   const getGraphImage = () => {
      if (isChunksVariant(props)) {
         return {
            withCaption: props.graphData.figure_with_caption,
            withoutCaption: props.graphData.figure_without_caption
         };
      }
      if (isSearchVariant(props)) {
         return {
            withCaption: props.graphData.graph_with_caption || props.graphData.figure_with_caption,
            withoutCaption: props.graphData.graph_without_caption || props.graphData.figure_without_caption
         };
      }
      if (isWorkspaceVariant(props)) {
         return {
            withCaption: props.graphData.imageCaption,
            withoutCaption: props.graphData.imageCaption
         };
      }
      return { withCaption: '', withoutCaption: '' };
   };

   const graphImage = getGraphImage();
   const pageNumber = getPageNumber();
   const title = getTitle();

   const handleAddToWorkspace = useCallback(async () => {
      const content = isChunksVariant(props) ? props.graphData.description :
         isSearchVariant(props) ? props.graphData.text :
            props.graphData.content;

      await handleAddGraphToWorkspace(
         props.graphData,
         isSearchVariant(props) ? props.graphData.title : getTitle(),
         parseInt(String(pageNumber), 10) || 0,
         content,
         graphImage.withCaption || ""
      );

      setIsAdded(true);
      setTimeout(() => {
         setIsAdded(false);
      }, 2000);
   }, [props, handleAddGraphToWorkspace, pageNumber, graphImage, getTitle]);

   const handleAskAI = useCallback(() => {
      if (isChunksVariant(props) && 'onAskAI' in props) {
         props.onAskAI(props.graphData, index, "graph");
      } else if (isSearchVariant(props) || isWorkspaceVariant(props)) {
         const { graphData } = props;

         let content = "";
         let pageNumber = 0;
         let imageSrc = "";
         let title = "";

         if (isSearchVariant(props)) {
            content = props.graphData.text || "";
            pageNumber = props.graphData.page_num;
            imageSrc = props.graphData.graph_without_caption || props.graphData.figure_without_caption || "";
            title = props.graphData.title;
         } else if (isWorkspaceVariant(props)) {
            content = props.graphData.content || "";
            pageNumber = props.graphData.pageNumber;
            imageSrc = props.graphData.imageCaption || props.graphData.figure_without_caption;
            title = props.graphData.contentTitle;
         }

         if (isWorkspaceVariant(props) && 'onAskAI' in props) {
            props.onAskAI(graphData, index, "graph");
         } else {
            handleGraphAskAI(
               graphData,
               index,
               title,
               content,
               pageNumber,
               imageSrc
            );
         }
      }
   }, [props, index, handleGraphAskAI]);

   {/* RENDER GRAPH CARD DATA */ }

   const renderContent = () => {
      if (isSearchVariant(props)) {
         return (
            <></>
         );
      }

      if (isWorkspaceVariant(props)) {
         return (
            <p className='text-sm text-[#4e5971]'>
               {props.graphData.content}
            </p>
         );
      }

      if (isChunksVariant(props)) {
         return (
            <p className='text-sm text-[#4e5971]'>
               {props.graphData.description}
            </p>
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
                     props.onDelete(props.graphData.id);
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
                           props.graphData.content, 
                           props.graphData.imageCaption,
                           props.graphData.contentTitle,
                           props.graphData.pageNumber,
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

   const renderBreadcrumb = () => {
      if (variant === 'chunks' || !pageNumber) return null;

      return (
         <>
            {variant === 'search' && (
               <p className='text-sm text-[#001742] flex items-center justify-start font-normal'>
                  {getSection(0, pageNumber, selectedDocuments[index]?.id)}
                  <ChevronRight className='w-5 h-5 text-[#9babc7]' />
                  <span className='text-sm text-[#001742] font-medium'>
                     Page: {pageNumber}
                  </span>
               </p>
            )}
            {variant === 'workspace' && (
               <p className='text-sm text-[#001742] flex items-center justify-start font-normal'>
                  {props.graphData.sectionName}
                  <ChevronRight className='w-5 h-5 text-[#9babc7]' />
                  <span className='text-sm text-[#001742] font-medium'>
                     Page: {pageNumber}
                  </span>
               </p>
            )}
         </>
      );
   };

   return (
      <div className='flex flex-col w-full'>
         <main
            className={`rounded p-2 w-full border-1 border-transparent
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
            onClick={() => setIsExpanded(!isExpanded)}
         >
            <header
               className='flex items-center justify-start gap-2 w-full flex-none'
            >
               <div className='flex flex-none items-center self-start justify-center p-1 rounded bg-[#eaecf5]'>
                  <ChartColumnIcon className='w-5 h-5' />
               </div>
               <div className='flex flex-col flex-grow gap-[2px] w-full'>
                  <p className='text-md text-[#001742] font-medium flex items-center justify-start gap-1'>
                     {title}
                     <label className='cursor-pointer'>
                        {variant === 'search' && <ExternalLink className='w-4 h-4' onClick={() => handleSearchClick(props.graphData.page_num, index)} />}
                     </label>
                  </p>
                  {renderBreadcrumb()}
               </div>
               {renderActionButtons()}
            </header>

            <section className='pl-[38px] w-full flex-grow overflow-auto cursor-pointer'>
               {renderContent()}
            </section>

            <div className='relative'>
               {isExpanded && (
                  <div className='absolute z-50 right-0 -top-8'>
                     <ToolBar
                        context={{
                           isGraphChunk: true,
                           pageNumber: isChunksVariant(props)
                              ? props.pageNumber
                              : isSearchVariant(props)
                                 ? props.graphData.page_num
                                 : props.graphData.pageNumber,
                           pdfUrl: activeDocument?.url,
                           ImageUrl: graphImage.withCaption,
                           contentToCopy: isChunksVariant(props)
                              ? props.graphData.figure_with_caption
                              : isSearchVariant(props)
                                 ? props.graphData.graph_with_caption || props.graphData.figure_with_caption
                                 : props.graphData.imageCaption,
                           tableTitle: title,
                        }}
                        onAddToWorkspace={handleAddToWorkspace}
                        onAskAI={handleAskAI}
                        isSearch={isSearchVariant(props)}
                        isWorkspace={isWorkspaceVariant(props)}
                        features={{
                           showActionButtons: true,
                           showModifyButton: true
                        }}
                     />
                  </div>
               )}

               <div
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`ml-[38px] mt-2 transition-all duration-500 ease-in-out border-1 rounded ${isExpanded ? 'bg-white border-[#eaf0f6]' : 'bg-transparent border-transparent'}`}
               >
                  {!isChunksVariant(props) && (
                     <div className={`
                     rounded overflow-hidden transition-all duration-500 ease-in-out
                     flex items-center justify-start
                     ${isExpanded ? 'max-h-[250px] overflow-y-auto' : 'max-h-[150px]'}
                  `}>
                        <img
                           src={graphImage.withCaption}
                           alt={title}
                           className={`
                            object-contain transition-all duration-500 ease-in-out
                           ${isExpanded
                                 ? 'w-auto h-[350px]'
                                 : 'w-auto h-[300px]'
                              }
                        `}
                        />
                     </div>
                  )}

                  {isChunksVariant(props) && (
                     <div className={`
                     rounded overflow-hidden transition-all duration-500 ease-in-out
                     ${isExpanded
                           ? 'max-h-[400px] opacity-100 transform scale-100'
                           : 'max-h-0 opacity-0 transform scale-95'
                        }
                  `}>
                        <img
                           src={graphImage.withCaption}
                           alt={title}
                           className="w-full h-auto object-contain transition-transform duration-500 ease-in-out"
                        />
                     </div>
                  )}
               </div>
            </div>
         </main>
      </div>
   );
}