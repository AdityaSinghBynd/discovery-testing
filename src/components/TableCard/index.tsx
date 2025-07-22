import { ChevronRight, Plus, Trash, ExternalLink, Table2, CircleCheck } from 'lucide-react'
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import ToolBar from '@/components/ToolBar';
import { TableCardProps, ChunksTableCardProps, SearchTableCardProps, WorkspaceTableCardProps } from './TableCard.interface';
import { useSectionAndSubheading } from '@/hooks/useSectionAndSubheading';
import { RootState } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import { useCardInteractions } from '@/hooks/useCardInteractions';
import extractedTableStyles from "@/styles/ExtractedTableStyles.module.scss";
import HTMLToTable from "@/components/Html/Table";
import { useToggleView } from '@/hooks/Toolbar/useToggleView';
import { selectTableChunks } from '@/redux/chunks/selector';
import { setSelectedTableIds, updateElementDetails, removeElementDetails } from '@/redux/element/elementSlice';

const isChunksVariant = (props: TableCardProps): props is ChunksTableCardProps => {
   return props.variant === 'chunks';
};

const isSearchVariant = (props: TableCardProps): props is SearchTableCardProps => {
   return props.variant === 'search';
};

const isWorkspaceVariant = (props: TableCardProps): props is WorkspaceTableCardProps => {
   return props.variant === 'workspace';
};

export default function TableCard(props: TableCardProps) {
   const { tableData, variant, onAddToWorkspace, index } = props;
   const [isExpanded, setIsExpanded] = useState(false);
   const [isAdded, setIsAdded] = useState(false);
   const dispatch = useDispatch();
   const { getSectionAndSubheading: getSection } = useSectionAndSubheading();
   const tableChunksData = useSelector(selectTableChunks);
   const activeDocument = useSelector((state: RootState) => state.projectDocuments.activeDocument);
   const selectedTableIds = useSelector((state: RootState) => state.elements.selectedTableIds);
   const [tableIds, setTableIds] = useState<Set<string>>(new Set());
   const [hoveredCard, setHoveredCard] = useState(false);

   const {
      handleSearchClick,
      handleAddTableToWorkspace,
      handleTableAskAI,
      selectedDocuments
   } = useCardInteractions({ variant });

   useEffect(() => {
      if (isWorkspaceVariant(props)) {
         setTableIds(new Set(selectedTableIds));
      }
   }, [selectedTableIds, props]);

   const getTitle = () => {
      if (isWorkspaceVariant(props)) {
         return props.tableData.contentTitle;
      }
      return props.tableData.title;
   };

   const getPageNumber = () => {
      if (isWorkspaceVariant(props)) {
         return props.tableData.pageNumber;
      }
      if (isSearchVariant(props)) {
         return props.tableData.page_num;
      }
      return null;
   };

   const getTableImage = () => {
      if (isChunksVariant(props)) {
         return {
            withCaption: props.tableData.table_with_caption,
            withoutCaption: props.tableData.table_without_caption
         };
      }
      if (isSearchVariant(props)) {
         return {
            withCaption: props.tableData.table_with_caption,
            withoutCaption: props.tableData.table_without_caption
         };
      }
      if (isWorkspaceVariant(props)) {
         return {
            withCaption: props.tableData.imageCaption,
            withoutCaption: props.tableData.imageCaption
         };
      }
      return { withCaption: '', withoutCaption: '' };
   };

   const tableImage = getTableImage();
   const pageNumber = getPageNumber();
   const title = getTitle();

   const {
      nodeViewStates: hookNodeViewStates,
      nodeHtmlContent,
      handleToggleView,
      getTableHtmlContent,
   } = useToggleView({
      tableChunksData,
      responses: isSearchVariant(props) ? [{ table_nodes: [props.tableData] }] : [],
   });

   const nodeViewStates = useMemo(() => {
      if (isSearchVariant(props) && props.nodeViewStates) {
         return props.nodeViewStates;
      }
      if (isWorkspaceVariant(props)) {
         return { [props.tableData.id]: hookNodeViewStates[props.tableData.id] || false };
      }
      return hookNodeViewStates;
   }, [props, hookNodeViewStates]);

   const handleToggleViewClick = useCallback((isTableActive: boolean) => {
      if (isSearchVariant(props)) {
         const pageNum = props.tableData.page_num;
         const nodeId = props.tableData.node_id;

         handleToggleView(
            nodeId,
            isTableActive,
            pageNum,
            props.tableData.title,
         );

         if (props.onToggleView) {
            props.onToggleView(isTableActive);
         }
      } else if (isWorkspaceVariant(props)) {
         const pageNum = props.tableData.pageNumber;
         const nodeId = props.tableData.id;

         handleToggleView(
            nodeId,
            isTableActive,
            pageNum,
            props.tableData.contentTitle,
         );
      }
   }, [props, handleToggleView]);

   const handleAddToWorkspace = useCallback(async () => {
      const content = isChunksVariant(props) ? props.tableData.description :
         isSearchVariant(props) ? props.tableData.text :
            props.tableData.content;

      const pageNumber = isChunksVariant(props)
         ? activeDocument?.lockedPage
         : isSearchVariant(props)
            ? props.tableData.page_num
            : props.tableData.pageNumber;

      let htmlContent: string | null = null;

      if (isChunksVariant(props) && props.tableData.table_html && props.tableData.table_html.length > 0) {
         htmlContent = props.tableData.table_html[0];
      } else if (isSearchVariant(props)) {
         const nodeId = props.tableData.node_id;
         console.log('Search variant adding to workspace:', {
            nodeId,
            hasViewState: !!nodeViewStates[nodeId],
            hasHtmlContent: !!nodeHtmlContent[nodeId],
            tableHtml: props.tableData.table_html
         });

         if (nodeViewStates[nodeId] && nodeHtmlContent[nodeId]) {
            htmlContent = nodeHtmlContent[nodeId];
         }
         else if ('table_html' in props.tableData && props.tableData.table_html) {
            htmlContent = Array.isArray(props.tableData.table_html)
               ? props.tableData.table_html[0]
               : props.tableData.table_html as string;
         }
         else {
            const imgUrl = props.tableData.table_without_caption;
            if (imgUrl) {
               htmlContent = `<div><img src="${imgUrl}" alt="${props.tableData.title}" /></div>`;
            }
         }
      }

      await handleAddTableToWorkspace(
         props.tableData,
         isSearchVariant(props) ? props.tableData.title : getTitle(),
         pageNumber,
         content,
         tableImage.withoutCaption,
         htmlContent,
      );

      setIsAdded(true);
      setTimeout(() => {
         setIsAdded(false);
      }, 2000);
   }, [props, handleAddTableToWorkspace, activeDocument?.lockedPage, tableImage, getTitle, nodeViewStates, nodeHtmlContent]);

   const handleAskAI = useCallback(() => {
      if (isChunksVariant(props)) {
         props.onAskAI?.(props.tableData, index, "table");
      } else if (isSearchVariant(props)) {
         const { tableData } = props;

         const htmlContent = Array.isArray(tableData.table_html)
            ? tableData.table_html[0]
            : typeof tableData.table_html === 'string'
               ? tableData.table_html
               : "";

         handleTableAskAI(
            tableData,
            index,
            tableData.title || "Untitled Table",
            tableData.text || tableData.title || "",
            tableData.page_num || tableData.pageNumber,
            tableData.table_without_caption || "",
            htmlContent
         );
      } else if (isWorkspaceVariant(props)) {
         const { tableData } = props;
         console.log('tableData', tableData)
         const htmlContent = Array.isArray(tableData.table_html)
            ? tableData.table_html[0]
            : typeof tableData.table_html === 'string'
               ? tableData.table_html
               : "";

         handleTableAskAI(
            tableData,
            index,
            tableData.contentTitle || "Untitled Table",
            tableData.content || "Table content",
            tableData.pageNumber,
            tableData.imageCaption || "",
            htmlContent
         );
      }
   }, [props, index, handleTableAskAI]);

   const handleCheckboxChange = useCallback(async (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation();

      if (!isWorkspaceVariant(props)) return;

      const element = props.tableData;
      const newTableIds = new Set(tableIds);

      if (!newTableIds.has(element.id)) {
         newTableIds.add(element.id);
         const htmlContent = element.table_html ?
            (Array.isArray(element.table_html) ? element.table_html[0] : element.table_html) :
            nodeHtmlContent[element.id] || '';

         dispatch(
            updateElementDetails({
               id: element.id,
               pageNumber: element.pageNumber,
               contentTitle: element.contentTitle,
               html: htmlContent,
            })
         );
      } else {
         newTableIds.delete(element.id);
         dispatch(removeElementDetails(element.id));
      }

      setTableIds(newTableIds);
      dispatch(setSelectedTableIds(Array.from(newTableIds)));
   }, [tableIds, dispatch, props, nodeHtmlContent]);

   const renderContent = () => {
      if (isSearchVariant(props)) {
         return (
            <></>
         );
      }

      if (isWorkspaceVariant(props)) {
         return (
            <p className='text-sm text-[#4e5971]'>
               {props.tableData.content}
            </p>
         );
      }

      if (isChunksVariant(props)) {
         return (
            <p className='text-sm text-[#4e5971]'>
               {props.tableData.description}
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
                     props.onDelete(props.tableData.id);
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
                        let htmlContent: string | null = null;
                        const elementId = props.tableData.id.toString();
                        const isTableView = nodeViewStates[elementId];
                        
                        if (isTableView) {
                           // First try to get HTML from nodeHtmlContent if available
                           htmlContent = nodeHtmlContent[elementId] || null;
                           
                           // If not found in nodeHtmlContent, try table_html from props
                           if (!htmlContent && props.tableData.table_html) {
                              htmlContent = Array.isArray(props.tableData.table_html) 
                                 ? props.tableData.table_html[0] 
                                 : props.tableData.table_html as string;
                           }
                        }
                        
                        props.onAddContent(
                           props.tableData.content, 
                           !isTableView ? props.tableData.imageCaption : undefined,
                           props.tableData.contentTitle,
                           props.tableData.pageNumber,
                           isTableView ? htmlContent : null
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
                  {props.tableData.sectionName}
                  <ChevronRight className='w-5 h-5 text-[#9babc7]' />
                  <span className='text-sm text-[#001742] font-medium'>
                     Page: {props.tableData.pageNumber}
                  </span>
               </p>
            )}
         </>
      );
   };

   return (
      <div className='flex flex-col w-full'>
         <main
            className={`rounded p-2 w-full border-1 ${isWorkspaceVariant(props) && tableIds.has(props.tableData.id) ? 'border-[#d0e3ff]' : 'border-transparent'}
               flex flex-col group cursor-pointer gap-1 transition-all duration-200 ease-in
               ${isChunksVariant(props)
                  ? `${isExpanded ? 'bg-[#ffffff] shadow-custom-blue' : 'bg-[#f7f9fe] hover:bg-[#ffffff] hover:shadow-custom-blue'}`
                  : isSearchVariant(props)
                     ? `hover:bg-[#f7f9fe] ${isExpanded ? 'bg-[#f7f9fe] shadow-custom-blue' : 'bg-[#ffffff] hover:shadow-custom-blue'}`
                     : isWorkspaceVariant(props)
                        ? `${isExpanded
                           ? 'bg-[#ffffff] shadow-custom-blue'
                           : tableIds.has(props.tableData.id)
                              ? 'bg-[#f0f7ff] hover:bg-[#ffffff] hover:shadow-custom-blue'
                              : 'bg-[#f7f9fe] hover:bg-[#ffffff] hover:shadow-custom-blue'}`
                        : ''
               }
             `}
            onClick={() => setIsExpanded(!isExpanded)}
            onMouseEnter={() => setHoveredCard(true)}
            onMouseLeave={() => setHoveredCard(false)}
         >
            <header
               className='flex items-center justify-start gap-2 w-full flex-none'
            >
               <div className={`flex flex-none items-center self-start justify-center p-1 rounded ${isWorkspaceVariant(props) ? '' : 'bg-[#eaecf5]'}`}>
                  {isWorkspaceVariant(props) ? (
                     hoveredCard || tableIds.has(props.tableData.id) ? (
                        <input
                           type="checkbox"
                           checked={tableIds.has(props.tableData.id)}
                           onChange={() => { }}
                           onClick={handleCheckboxChange}
                           className="h-5 w-5 cursor-pointer"
                           aria-label="Select table for export"
                        />
                     ) : (
                        <Table2 className='w-5 h-5' />
                     )
                  ) : (
                     <Table2 className='w-5 h-5' />
                  )}
               </div>

               <div className='flex flex-col flex-grow gap-[2px] w-full'>
                  <p className='text-md text-[#001742] font-medium flex items-center justify-start gap-1'>
                     {title}
                     <label className='cursor-pointer'>
                        {variant === 'search' && <ExternalLink className='w-4 h-4' onClick={() => handleSearchClick(props.tableData.page_num, index)} />}
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
                  <div className="absolute -top-8 right-0 z-50">
                     <ToolBar
                        context={{
                           isTable: true,
                           contentToCopy: isChunksVariant(props)
                              ? props.tableData.table_html[0]
                              : isSearchVariant(props)
                                 ? (Array.isArray(props.tableData.table_html)
                                    ? props.tableData.table_html[0]
                                    : props.tableData.table_html || "")
                                 : isWorkspaceVariant(props) && tableChunksData
                                    ? getTableHtmlContent(props.tableData.pageNumber, props.tableData.contentTitle)?.[0] ||
                                    (Array.isArray(props.tableData.table_html)
                                       ? props.tableData.table_html[0]
                                       : props.tableData.table_html || "")
                                    : (Array.isArray(props.tableData.table_html)
                                       ? props.tableData.table_html[0]
                                       : props.tableData.table_html || ""),
                           tableTitle: isWorkspaceVariant(props)
                              ? props.tableData.contentTitle
                              : props.tableData.title,
                           tableId: isSearchVariant(props)
                              ? props.tableData.node_id
                              : isWorkspaceVariant(props)
                                 ? props.tableData.id
                                 : undefined,
                           pageNumber: isSearchVariant(props)
                              ? props.tableData.page_num
                              : isWorkspaceVariant(props)
                                 ? props.tableData.pageNumber
                                 : activeDocument?.lockedPage,
                           pdfUrl: activeDocument?.url,
                           ImageUrl: tableImage.withCaption,
                        }}
                        isSearch={isSearchVariant(props)}
                        isWorkspace={isWorkspaceVariant(props)}
                        onAddToWorkspace={handleAddToWorkspace}
                        onAskAI={handleAskAI}
                        onToggleView={isSearchVariant(props) || isWorkspaceVariant(props) ? handleToggleViewClick : undefined}
                        nodeViewStates={nodeViewStates}
                        features={{
                           showViewToggle: isSearchVariant(props) || isWorkspaceVariant(props),
                           showModifyButton: !isWorkspaceVariant(props),
                           showActionButtons: true,
                           showSimilarTables: isChunksVariant(props)
                        }}
                     />
                  </div>
               )}

               <div
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`ml-[38px] mt-2 transition-all duration-500 ease-in-out`}
               >
                  {!isChunksVariant(props) && (
                     <div className={`
                       rounded overflow-hidden transition-all duration-500 ease-in-out
                       flex items-start justify-start w-full
                       ${isExpanded ? 'max-h-[250px] overflow-y-auto' : 'max-h-[150px]'}
                     `}>
                        <div className="relative w-full">
                           {/* HTMLToTable with fade transition */}
                           <div className={`
                             absolute w-full top-0 left-0 transition-opacity duration-300 ease-in-out
                             ${((isSearchVariant(props) && nodeViewStates[props.tableData.node_id]) ||
                                 (isWorkspaceVariant(props) && nodeViewStates[props.tableData.id]))
                                 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}
                           `}>
                              <HTMLToTable
                                 htmlContent={
                                    isSearchVariant(props)
                                       ? nodeHtmlContent[props.tableData.node_id] || props.tableData.table_html?.toString() || ""
                                       : nodeHtmlContent[props.tableData.id] ||
                                       (Array.isArray(props.tableData.table_html)
                                          ? props.tableData.table_html[0]
                                          : props.tableData.table_html as string) || ""
                                 }
                                 className="table-auto border-collapse w-full h-full text-[12px] [&_th]:bg-[#fbfdff] [&_th]:font-bold [&_th]:text-[#4e5971] [&_th]:border-b [&_th]:border-[#eaf0fc] [&_td]:border-b [&_td]:border-[#eaf0fc] [&_td]:text-[#4e5971] [&_td]:p-1 [&_td]:text-left [&_tr:last-child_&td]:border-none sm:text-[14px] sm:[&_th]:p-2 sm:[&_td]:p-2"
                              />
                           </div>

                           {/* Image with fade transition */}
                           <div className={`
                            w-full transition-opacity duration-300 ease-in-out
                            ${((isSearchVariant(props) && nodeViewStates[props.tableData.node_id]) ||
                                 (isWorkspaceVariant(props) && nodeViewStates[props.tableData.id]))
                                 ? 'opacity-0 z-0 pointer-events-none' : 'opacity-100 z-10'}
                           `}>
                              <img
                                 src={tableImage.withoutCaption}
                                 alt={title}
                                 className={`
                                 w-full transition-all duration-500 ease-in-out transform border-1 border-[#eaf0fc] rounded
                                 ${isExpanded
                                       ? 'h-auto w-auto object-cover'
                                       : 'h-auto w-auto object-cover'
                                    }
                                 `}
                              />
                           </div>
                        </div>
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
                        <HTMLToTable
                           htmlContent={props.tableData.table_html[0]}
                           className={extractedTableStyles.styledTable}
                        />
                     </div>
                  )}
               </div>
            </div>
         </main>
      </div>
   );
}