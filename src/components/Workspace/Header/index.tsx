import React from "react";
import ElementHeader from "./elementHeader";
import EditorHeader from "./editorHeader";

interface workspaceHeaderProps {
  elements: any[];
  blocks: any;
  setBlocks: any;
  documentTitle: string;
  onTitleChange: (title: string) => void;
}

const index: React.FC<workspaceHeaderProps> = ({
  elements,
  blocks,
  setBlocks,
  documentTitle,
  onTitleChange,
}) => {
  return (
    <div className="w-full h-[55px] flex px-3 py-0 gap-2 items-center">
      <div className="w-[40%]">
        <ElementHeader elements={elements} />
      </div>
      <div className="w-[60%]">
        <EditorHeader
          blocks={blocks}
          setBlocks={setBlocks}
          documentTitle={documentTitle}
          onTitleChange={onTitleChange}
        />
      </div> 
    </div>
  );
};

export default index;