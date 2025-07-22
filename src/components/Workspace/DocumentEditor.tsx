import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import styles from "@/styles/workspace.module.scss";
import { getSession } from "next-auth/react";
import debounce from "lodash/debounce";
import { useRouter } from "next/router";
import { BASE_URL } from "@/constant/constant";
import { DocumentEditorProps } from "@/interface/components/documentEditor.interface";

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  onChange,
  onTitleChange,
  initialData,
  documentTitle = "Untitled",
  newContent,
}) => {
  const editorRef = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState(false);
  const [title, setTitle] = useState(documentTitle);
  const previousContentRef = useRef<typeof newContent | null>(null);
  const [editorBlocks, setEditorBlocks] = useState<OutputData | null>(initialData || null);
  const EDITOR_HOLDER_ID = "editorjs";
  const isUpdatingRef = useRef(false);
  const router = useRouter();
  const { slug } = router.query;

  /**
   * Sanitizes and validates the HTML table content
   * @param htmlContent - Raw HTML string containing table markup
   * @returns Cleaned HTML string or null if invalid
   */
  const sanitizeTableHtml = useCallback((htmlContent: string) => {
    try {
      // Check if we have a valid table
      if (!htmlContent || typeof htmlContent !== 'string') {
        console.error("Invalid HTML content:", htmlContent);
        return null;
      }

      // Simple check for table tags
      if (!htmlContent.includes('<table') && !htmlContent.includes('</table>')) {
        // This might be a partial table (just rows without table tag)
        // Let's try to wrap it with table tags
        if (htmlContent.includes('<tr') || htmlContent.includes('</tr>')) {
          htmlContent = `<table>${htmlContent}</table>`;
        } else {
          console.error("HTML does not contain table or row tags:", htmlContent);
          return null;
        }
      } else if (!htmlContent.includes('<table')) {
        // Has closing table tag but no opening tag
        htmlContent = `<table>${htmlContent}`;
      } else if (!htmlContent.includes('</table>')) {
        // Has opening table tag but no closing tag
        htmlContent = `${htmlContent}</table>`;
      }

      // Basic cleaning of potential issues
      let cleaned = htmlContent.trim();
      
      console.log("Sanitized table HTML:", cleaned);
      return cleaned;
    } catch (error) {
      console.error("Error sanitizing table HTML:", error);
      return null;
    }
  }, []);

  /**
   * Parses HTML table content into a 2D array format compatible with EditorJS
   * @param tableHtml - Raw HTML string containing table markup
   * @returns Array of arrays containing table cell contents, or null if invalid
   */
  const parseTableHtml = useCallback((tableHtml: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(tableHtml, "text/html");
      const table = doc.querySelector("table");

      if (!table) {
        console.error("No table element found in HTML string:", tableHtml);
        return null;
      }

      // Collect all rows from the table (including thead and tbody if present)
      const allRows = Array.from(table.querySelectorAll("tr"));
      if (allRows.length === 0) {
        return null;
      }

      // Process rows and cells to create the 2D array
      const tableData = allRows.map((row, rowIndex) => {
        // Get all cells (both th and td) in this row
        const cells = Array.from(row.querySelectorAll("th, td"));
        
        if (cells.length === 0) {
          // If no cells found, add a placeholder to maintain the row structure
          return [""];
        }
        
        // Extract content from each cell
        return cells.map((cell, cellIndex) => {
          let content = cell.textContent?.trim() || "";
          
          // Ensure content is not undefined or null
          if (!content) {
            content = ""; // Use empty string for empty cells
          }
          
          return content;
        });
      });

      // Ensure we have at least one row and one column
      if (tableData.length === 0) {
        console.error("Failed to extract any rows from table");
        return [["No data"]];
      }
      
      // Normalize the table to ensure all rows have the same number of columns
      const maxColumns = Math.max(...tableData.map(row => row.length));
      const normalizedTable = tableData.map(row => {
        // If row has fewer columns than the max, pad with empty strings
        if (row.length < maxColumns) {
          return [...row, ...Array(maxColumns - row.length).fill("")];
        }
        return row;
      });

      console.log("Parsed table data:", normalizedTable);
      return normalizedTable;
    } catch (error) {
      console.error("Error parsing table HTML:", error, tableHtml);
      return null;
    }
  }, []);

  /**
   * Factory functions for creating different types of editor blocks
   * Memoized to prevent unnecessary recreations
   */
  const createBlocks = useMemo(() => ({
    table: (tableData: string[][]) => {
      // Ensure we have valid table data
      if (!tableData || !tableData.length) {
        console.error("Invalid table data:", tableData);
        return {
          type: "table",
          data: {
            withHeadings: false,
            content: [["No data"]]
          }
        };
      }

      // Determine if the first row contains headings (th elements)
      const withHeadings = true; // Default to true as most tables have headers

      return {
        type: "table",
        data: {
          withHeadings,
          content: tableData,
        },
      };
    },
    image: (imageUrl: string) => ({
      type: "image",
      data: {
        url: imageUrl,
        caption: "",
        withBorder: false,
        withBackground: false,
        stretched: false,
        file: {
          url: imageUrl
        }
      },
    }),
    paragraph: (text: string) => ({
      type: "paragraph",
      data: { text },
    }),
  }), []);

  /**
   * Debounced function to save editor content to the backend
   * Prevents excessive API calls during rapid content changes
   * Also handles merging of new content (tables, images) with existing content
   */
  const debouncedSaveContent = useCallback(
    debounce(async (content) => {
      if (isUpdatingRef.current) return;

      try {
        const session = await getSession();
        if (!session?.accessToken) throw new Error("No access token found");

        const newBlocks = [];
        
        if (newContent?.tableHtml) {
          const tableData = parseTableHtml(newContent.tableHtml);
          if (tableData?.length) {
            newBlocks.push(createBlocks.table(tableData));
          }
        }
        if (newContent?.imageCaption) {
          newBlocks.push(createBlocks.image(newContent.imageCaption));
        }

        content.blocks.push(...newBlocks);

        const response = await fetch(`${BASE_URL}/editor-blocks/${slug}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ data: content }),
        });

        if (!response.ok) throw new Error("Failed to save content");
      } catch (error) {
        console.error("Error saving content:", error);
      }
    }, 1000),
    [slug, newContent, parseTableHtml, createBlocks]
  );

  /**
   * Fetches existing editor blocks from the backend
   * Updates the editor state with fetched content
   * Falls back to default content if fetch fails
   */
  const fetchEditorBlocks = useCallback(async () => {
    if (!slug) return;

    try {
      const session = await getSession();
      if (!session?.accessToken) throw new Error("No access token found");

      const response = await fetch(`${BASE_URL}/editor-blocks/${slug}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch editor blocks");

      const data = await response.json();
      if (!data?.data?.blocks) throw new Error("Invalid data format received");

      setEditorBlocks(data.data.blocks);

      if (editorRef.current) {
        await editorRef.current.blocks.clear();
        for (const block of data.data.blocks) {
          await editorRef.current.blocks.insert(block.type, block.data);
        }
      }
    } catch (error) {
      console.error("Error fetching editor blocks:", error);
      setEditorBlocks({
        blocks: [createBlocks.paragraph("Start writing here...")],
      });
    }
  }, [slug, createBlocks]);

  /**
   * Editor configuration object
   * Defines available tools, their settings, and change handlers
   * Memoized to prevent unnecessary recreation on renders
   */
  const editorConfig = useMemo(() => ({
    holder: EDITOR_HOLDER_ID,
    data: editorBlocks || initialData,
    tools: {
      header: {
        class: null,
        inlineToolbar: ["link", "bold", "italic"],
        config: {
          placeholder: "Enter a heading",
          levels: [1, 2, 3],
          defaultLevel: 2,
        },
      },
      list: {
        class: null,
        inlineToolbar: true,
      },
      paragraph: {
        class: null,
        inlineToolbar: true,
      },
      table: {
        class: null,
        inlineToolbar: true,
        config: {
          rows: 2,
          cols: 3,
        },
      },
      image: {
        class: null,
        config: {
          uploader: {
            uploadByFile: null,
            uploadByUrl: null,
            uploadFromUrl: (url: string) => {
              return {
                success: 1,
                file: {
                  url: url
                }
              };
            }
          }
        }
      }
    },
    onReady: () => {
      console.log('Editor.js is ready to work!');
    },
    onChange: async (api: any, event: any) => {
      if (isUpdatingRef.current || !editorRef.current) return;
      
      try {
        const content = await editorRef.current.save();
        setEditorBlocks(content);
        onChange?.(content);
        debouncedSaveContent(content);
      } catch (error) {
        console.error("Error saving editor content:", error);
      }
    },
  }), [editorBlocks, initialData, onChange, debouncedSaveContent]);

  /**
   * Update editorBlocks when initialData changes
   */
  useEffect(() => {
    if (initialData) {
      setEditorBlocks(initialData);
    }
  }, [initialData]);

  /**
   * Effect to initialize the editor when component mounts
   * Also handles cleanup on unmount
   */
  useEffect(() => {
    setIsMounted(true);
    if (slug) {
      fetchEditorBlocks();
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = undefined;
      }
      debouncedSaveContent.cancel();
    };
  }, [slug]);

  /**
   * Effect to handle new content updates
   * Merges new content with existing editor content while preserving previous content
   */
  useEffect(() => {
    const addNewContent = async () => {
      if (
        editorRef.current &&
        newContent &&
        newContent !== previousContentRef.current
      ) {
        try {
          isUpdatingRef.current = true;

          const currentData = await editorRef.current.save();
          const existingBlocks = currentData.blocks || [];

          const newBlocks = [];

          // Add new content block - check element type first
          const isTextElement = newContent.elementType !== "table" && newContent.elementType !== "graph";
          const hasContent = newContent.content;
          const hasTableContent = newContent.tableHtml;
          const hasImageContent = newContent.imageCaption;
          
          if (hasContent && isTextElement) {
            newBlocks.push({
              type: "paragraph",
              data: {
                text: newContent.content,
              },
            });
          } else if (hasTableContent) {
            // First sanitize the HTML
            const sanitizedHtml = sanitizeTableHtml(newContent.tableHtml!);
            
            if (sanitizedHtml) {
              const tableData = parseTableHtml(sanitizedHtml);
              
              if (tableData?.length) {
                // Make sure we have the Table tool properly loaded
                try {
                  // Format table data to ensure it works with EditorJS Table block
                  // Create a proper table structure with headers in first row
                  const formattedTableData = tableData.map(row => 
                    row.map(cell => cell || '')  // Replace nulls/undefined with empty strings
                  );
                  
                  // Create a new table block with configured data
                  const tableBlock = {
                    type: 'table',
                    data: {
                      withHeadings: true,
                      content: formattedTableData
                    }
                  };
                  
                  // Insert the table using the blocks API
                  const index = await editorRef.current.blocks.insert(
                    tableBlock.type, 
                    tableBlock.data
                  );
                  
                  // Ensure the table is rendered properly
                  setTimeout(() => {
                    if (editorRef.current) {
                      // Force a re-render of the block to ensure it displays correctly
                      try {
                        console.log("Attempting to refresh the editor");
                        // Refresh the entire editor to ensure proper rendering
                        editorRef.current.save().then(() => {
                          console.log("Editor state saved and refreshed");
                        });
                      } catch (renderError) {
                        console.error("Error refreshing editor:", renderError);
                      }
                    }
                  }, 100);
                } catch (tableError) {
                  console.error("Error inserting table block:", tableError);
                  // Fallback: create a paragraph with the content
                  newBlocks.push({
                    type: "paragraph",
                    data: {
                      text: `Table could not be inserted. Content: ${newContent.content || "Table content"}`
                    }
                  });
                }
              } else {
                console.error("Failed to parse table HTML after sanitization");
                // Fallback: create a paragraph with the content
                newBlocks.push({
                  type: "paragraph",
                  data: {
                    text: `Table: ${newContent.content || "Table content"}`
                  }
                });
              }
            } else {
              console.error("Failed to sanitize table HTML:", newContent.tableHtml);
              // Fallback: create a paragraph with the content
              newBlocks.push({
                type: "paragraph",
                data: {
                  text: `Table: ${newContent.content || "Table content"}`
                }
              });
            }
          } else if (hasImageContent) {
            newBlocks.push(createBlocks.image(newContent.imageCaption!));
          }

          // Instead of clearing, append new blocks to existing content
          for (const block of newBlocks) {
            await editorRef.current.blocks.insert(block.type, block.data);
          }

          // Save the updated content
          const updatedContent = await editorRef.current.save();
          onChange?.(updatedContent);
          debouncedSaveContent(updatedContent);

          previousContentRef.current = newContent;
          isUpdatingRef.current = false;
        } catch (error) {
          console.error("Error updating editor content:", error);
          isUpdatingRef.current = false;
        }
      }
    };

    addNewContent();
  }, [newContent, parseTableHtml, sanitizeTableHtml, createBlocks, onChange, debouncedSaveContent]);

  // Add debounced save title function
  const debouncedSaveTitle = useCallback(
    debounce((newTitle: string) => {
      if (slug) {
        localStorage.setItem(`document_title_${slug}`, newTitle);
      }
    }, 1000),
    [slug]
  );

  // Load title from localStorage on mount
  useEffect(() => {
    if (slug) {
      const savedTitle = localStorage.getItem(`document_title_${slug}`);
      if (savedTitle) {
        setTitle(savedTitle);
      }
    }
  }, [slug]);

  /**
   * Handles changes to the document title
   * Updates local state and triggers callback
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
    debouncedSaveTitle(newTitle);
  };

  /**
   * Initializes the EditorJS instance
   * Dynamically imports required modules
   * Sets up tools and configuration
   */
  const initEditor = async () => {
    try {
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;
      const Paragraph = (await import("@editorjs/paragraph")).default;
      const Table = (await import("@editorjs/table")).default;
      const Image = (await import("@editorjs/image")).default; 

      if (!document.getElementById(EDITOR_HOLDER_ID)) return;

      // Pre-configure the editor with explicit tool settings
      const editor = new EditorJS({
        holder: EDITOR_HOLDER_ID,
        data: editorBlocks || initialData,
        tools: {
          header: {
            class: Header,
            inlineToolbar: ["link", "bold", "italic"],
            config: {
              placeholder: "Enter a heading",
              levels: [1, 2, 3],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            }
          },
          image: {
            class: Image,
            config: {
              uploader: {
                uploadByFile: null,
                uploadByUrl: null,
                uploadFromUrl: (url: string) => {
                  return {
                    success: 1,
                    file: {
                      url: url
                    }
                  };
                }
              }
            }
          }
        },
        onReady: () => {
          if (Table) {
            console.log('Table tool is available');
          }
        },
        onChange: async (api, event) => {
          try {
            if (isUpdatingRef.current) {
              return;
            }
            if (editorRef.current) {
              const content = await editorRef.current.save();
              onChange?.(content);
              debouncedSaveContent(content);
            }
          } catch (error) {
            console.error("Error saving editor content:", error);
          }
        },
      });

      editorRef.current = editor;
    } catch (error) {
      console.error("Error initializing editor:", error);
    }
  };

  /**
   * Effect to initialize editor when component is mounted
   * Prevents initialization before the component is ready
   */
  useEffect(() => {
    if (isMounted && !editorRef.current) {
      initEditor();
    }
  }, [isMounted, editorBlocks]);

  if (!isMounted) {
    return (
      <div className={styles.documentEditorContainer}>Loading editor...</div>
    );
  }

  /**
   * Main component render
   * Includes title input and editor container
   */
  return (
    <div className={styles.documentEditorContainer}>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className={styles.documentTitle}
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          border: "none",
          outline: "none",
          width: "100%",
          marginBottom: "1rem",
          padding: "0.5rem",
          background: "transparent",
        }}
      />
      <div id={EDITOR_HOLDER_ID} className={styles.editorContent} />
    </div>
  );
};

export default DocumentEditor;
