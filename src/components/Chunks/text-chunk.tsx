import Image from "next/image";
import styles from "@/styles/TextChunk.module.scss";
import List from "../../../public/images/keyTopics.svg";
import ToolBar from "@/components/ToolBar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TextChunkProps {
  chunk: any;
  index: number;
  messages: { [index: number]: string[] };
  activeCardIndex: number | null;
  onToggleExpand: (index: number) => void;
  onAddToWorkspace: (chunk: any) => void;
  onAskAI: (chunk: any, index: number, type: string | null) => void;
  //sectionIndex : any;
  key: string;
}

export default function TextChunk({
  key,
  chunk,
  index,
  messages,
  activeCardIndex,
  onToggleExpand,
  onAddToWorkspace,
  onAskAI,
}: TextChunkProps) {
  const isActive = activeCardIndex === index;

  const divideContentIntoCards = (content: string) => {
    const raw = content;
    const headingRegex = /^#{1,6}\s.+/gm;
    const cards = content.split(headingRegex);
    const headings = content.match(headingRegex) || [];

    return cards
      .map((card, index) => ({
        heading: headings[index] || "",
        content: card.trim(),
        raw: raw,
      }))
      .filter((card) => card.heading && card.content);
  };

  const cards = divideContentIntoCards(chunk.content);
  return (
    <div
      className={`${styles.cardItem} ${isActive ? styles.expandedCard : ""}`}
    >
      <div
        className={`${styles.cardHeader} ${activeCardIndex !== null && !isActive ? styles.hiddenCardHeader : ""}`}
        onClick={() => onToggleExpand(index)}
      >
        <div className={styles.cardHeading}>
          <label>
            <Image src={List} alt="List" />
          </label>
          <h4>{chunk.generated_title}</h4>
        </div>
        <div className={styles.cardDescription}>
          {chunk.aiSummary ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p style={{ fontSize: "14px", color: "#4E5971" }}>
                    {children}
                  </p>
                ),
                li: ({ children }) => (
                  <li
                    style={{
                      fontSize: "14px",
                      listStyleType: "disc",
                      color: "#4E5971",
                    }}
                  >
                    {children}
                  </li>
                ),
              }}
            >
              {chunk.aiSummary}
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
                  <li
                    style={{
                      fontSize: "14px",
                      listStyleType: "disc",
                      color: "#4E5971",
                    }}
                  >
                    {children}
                  </li>
                ),
              }}
            >
              {messages[index]?.join("") || ""}
            </ReactMarkdown>
          )}
        </div>
      </div>

      <div className={styles.expandedContentContainer}>
        {isActive && (
          <div className={styles.toolbarWrapper}>
            <ToolBar
              context={{
                contentToCopy: chunk.content,
                tableTitle: chunk.generated_title,
                isTable: false,
                isTextChunk: true,
                tableId: "",
                currentPage: 0
              }}
              onAddToWorkspace={() => onAddToWorkspace(chunk)}
              onAskAI={() => onAskAI(chunk, index, "text")}
              features={{
                showActionButtons: true,
                showModifyButton: true
              }}
            />
          </div>
        )}

        <div
          className={`${styles.expandedContent} ${isActive ? styles.active : ""}`}
        >
          <p>{chunk.content}</p>
        </div>
      </div>
    </div>
  );
}
