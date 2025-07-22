import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  Footer,
  PageNumber,
  convertInchesToTwip,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";

// Helper function to clean HTML from text
const cleanHtml = (text: string) => {
  return text.replace(/<[^>]*>/g, '');
};

const convertToWord = async (blocks: any[], title: string) => {
  const imageToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return "";
    }
  };

  // Common text style for regular paragraphs
  const getTextStyle = () => ({
    color: "000000",
    size: 24, // 12pt
    font: "Times New Roman",
  });

  // Create document elements
  const contentElements = [];

  // Add title
  contentElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          ...getTextStyle(),
          bold: true,
          size: 28, // 14pt for title
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 200,
        before: 200,
      },
    }),
  );

  // Process blocks
  for (const block of blocks) {
    if (!block || !block.type || !block.data) {
      console.warn('Invalid block:', block);
      continue;
    }

    switch (block.type) {
      case 'header':
        contentElements.push(
          new Paragraph({
            text: cleanHtml(block.data.text),
            heading: block.data.level === 1 
              ? HeadingLevel.HEADING_1 
              : block.data.level === 2 
              ? HeadingLevel.HEADING_2 
              : HeadingLevel.HEADING_3,
            spacing: {
              after: 200,
              before: 200,
            },
          })
        );
        break;

      case 'paragraph':
        contentElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cleanHtml(block.data.text),
                ...getTextStyle(),
              }),
            ],
            spacing: {
              after: 200,
            },
          })
        );
        break;

      case 'image':
        try {
          const imageUrl = block.data.file?.url || block.data.url;
          if (imageUrl) {
            const base64Image = await imageToBase64(imageUrl);
            contentElements.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: base64Image,
                    transformation: {
                      width: 450,
                      height: 300,
                    },
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: {
                  before: 200,
                  after: 200,
                },
              })
            );

            // Add caption if available
            if (block.data.caption) {
              contentElements.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cleanHtml(block.data.caption),
                      ...getTextStyle(),
                      size: 20, // Smaller size for captions
                      italics: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: {
                    after: 300,
                  },
                })
              );
            }
          }
        } catch (error) {
          console.error("Error processing image:", error);
        }
        break;

      case 'table':
        if (!block.data.content || !Array.isArray(block.data.content)) {
          console.warn('Invalid table data:', block.data);
          break;
        }

        const rows = block.data.content.map((row: string[], rowIndex: number) => {
          return new TableRow({
            children: row.map((cell: string) => {
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cleanHtml(cell),
                        ...getTextStyle(),
                        bold: rowIndex === 0 && block.data.withHeadings,
                      }),
                    ],
                  }),
                ],
              });
            }),
          });
        });

        contentElements.push(
          new Table({
            rows: rows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          })
        );
        break;

      default:
        console.warn('Unsupported block type:', block.type);
        break;
    }
  }

  const footer = new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "",
            size: 24,
          }),
        ],
        border: {
          top: {
            color: "004CE6",
            style: "single",
            size: 2,
          },
        },
      }),
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: "none", size: 0 },
          bottom: { style: "none", size: 0 },
          left: { style: "none", size: 0 },
          right: { style: "none", size: 0 },
          insideHorizontal: { style: "none", size: 0 },
          insideVertical: { style: "none", size: 0 },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: "none", size: 0 },
                  bottom: { style: "none", size: 0 },
                  left: { style: "none", size: 0 },
                  right: { style: "none", size: 0 },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Bynd",
                        size: 20,
                        color: "000000",
                      }),
                    ],
                  }),
                ],
                width: {
                  size: 50,
                  type: WidthType.PERCENTAGE,
                },
                verticalAlign: "center",
              }),
              new TableCell({
                borders: {
                  top: { style: "none", size: 0 },
                  bottom: { style: "none", size: 0 },
                  left: { style: "none", size: 0 },
                  right: { style: "none", size: 0 },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Page ",
                        size: 20,
                        color: "000000",
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        size: 20,
                        color: "000000",
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
                width: {
                  size: 50,
                  type: WidthType.PERCENTAGE,
                },
                verticalAlign: "center",
              }),
            ],
          }),
        ],
        margins: {
          top: 40,
        },
      }),
    ],
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        footers: {
          default: footer,
        },
        children: contentElements,
      },
    ],
  });

  // Generate and save the document
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
};

export default convertToWord; 