// import { PDFDocument, rgb } from 'pdf-lib';
// import fs from 'fs-extra';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }

//   const { src } = req.body;

//   try {
//     const pdfDoc = await PDFDocument.create();
//     const imageBytes = await fetch(src).then((res) => res.arrayBuffer());
//     const image = await pdfDoc.embedPng(imageBytes);
//     const page = pdfDoc.addPage([image.width, image.height]);
//     page.drawImage(image, {
//       x: 0,
//       y: 0,
//       width: image.width,
//       height: image.height,
//     });

//     const pdfBytes = await pdfDoc.save();

//     const pdfPath = `./public/${Date.now()}.pdf`;
//     await fs.writeFile(pdfPath, pdfBytes);

//     const pdfUrl = `${req.headers.origin}/${pdfPath}`;

//     return res.status(200).json({ pdfUrl });
//   } catch (error) {
//     console.error('Error converting image to PDF:', error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// }
