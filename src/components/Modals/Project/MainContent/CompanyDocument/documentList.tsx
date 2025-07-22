import Image from "next/image";
import PdfIcon from "../../../../../../public/images/pdfIcon.svg";

interface Document {
  id: string;
  name: string;
  documentType: string;
}

interface DocumentListProps {
  documents: Document[];
  selectedDocs: any[];
  toggleSelectAll: () => void;
  toggleDocument: (docId: string, docName: string) => void;
  selectedType: string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocs,
  toggleSelectAll,
  toggleDocument,
  selectedType,
}) => {
  return (
    selectedType && (
      <div className="document-list w-full h-full p-2 rounded bg-[#fbfdff] border-1 border-[#EAF0FC]">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <input
            type="checkbox"
            checked={
              documents.length > 0 &&
              documents.every((doc: Document) =>
                selectedDocs.some(
                  (selectedDoc: any) => selectedDoc.id === doc.id,
                ),
              )
            }
            onChange={() => {}}
            className="rounded border-gray-300 w-4 h-4 cursor-pointer accent-blue-500 hover:accent-blue-700"
          />
          Select all {selectedType.toUpperCase()}
        </button>
        <div className="document-items flex flex-col gap-2">
          {documents.map((doc: Document) => (
            <div
              key={doc.id}
              className={`group flex items-center gap-2 py-2 px-2 border-1 border-transparent rounded cursor-pointer ${
                selectedDocs.some((document: any) => doc.id === document.id)
                  ? "bg-[#fff] "
                  : "hover:bg-[#fff]"
              }`}
              onClick={() => toggleDocument(doc.id, doc.name)}
            >
              <Image
                src={PdfIcon}
                alt="PDF Icon"
                className={`h-4 w-4 ${
                  selectedDocs.some((document: any) => doc.id === document.id)
                    ? "hidden"
                    : "group-hover:hidden"
                }`}
              />

              <input
                type="checkbox"
                checked={selectedDocs.some(
                  (document: any) => doc.id === document.id,
                )}
                onChange={() => {}}
                className={`rounded border-gray-300 w-4 h-4 cursor-pointer accent-blue-500 hover:accent-blue-700 ${
                  selectedDocs.some((document: any) => doc.id === document.id)
                    ? "block"
                    : "hidden group-hover:block"
                }`}
              />

              <div className="text-sm font-[400] text-gray-900">
                {doc.name?.replace(/[^a-zA-Z0-9\s]/g, " ").toUpperCase() ||
                  `DOCUMENT NAME`}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default DocumentList;
