import { memo } from "react";
import Image from "next/image";
import styles from "@/styles/toolBar.module.scss";
import Copy from "../../../../public/images/copy.svg";
import Download from "../../../../public/images/download.svg";
import ClickedCopy from "../../../../public/images/ClickedCopy.svg";
import Add from "../../../../public/images/plus.svg";
import Tick from "../../../../public/images/tick.svg";

interface ActionButtonsProps {
  isTextChunk?: boolean;
  isGraphChunk?: boolean;
  isCopied: boolean;
  isAdded: boolean;
  isCopying?: boolean;
  onDownload: () => void;
  onCopy: () => void;
  onAdd: () => void;
  isSearch?: boolean;
  isWorkspace?: boolean;
}

export const ActionButtons = memo(
  ({
    isTextChunk = false,
    isGraphChunk = false,
    isCopied,
    isAdded,
    isCopying = false,
    onDownload,
    onCopy,
    onAdd,
    isSearch = false,
    isWorkspace = false,
  }: ActionButtonsProps) => (
    <div className={styles.copyAdd}>
      {!isTextChunk && (
        <Image
          src={Download}
          alt="Download"
          width={20}
          height={20}
          onClick={onDownload}
          className="cursor-pointer hover:opacity-80"
        />
      )}
      {isCopying ? (
        <div className="flex items-center justify-center p-[2px]">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#004CE6] border-t-transparent" />
        </div>
      ) : (
        <Image
          src={isCopied ? ClickedCopy : Copy}
          alt={isCopied ? "Copied" : "Copy"}
          width={20}
          height={20}
          onClick={onCopy}
          className="cursor-pointer hover:opacity-80"
        />
      )}

      {!isSearch && !isWorkspace && (
        <Image
          src={isAdded ? Tick : Add}
          alt={isAdded ? "Added" : "Add"}
          width={20}
          height={20}
          onClick={onAdd}
          className="cursor-pointer hover:opacity-80"
        />
      )}
    </div>
  ),
);

ActionButtons.displayName = "ActionButtons";
