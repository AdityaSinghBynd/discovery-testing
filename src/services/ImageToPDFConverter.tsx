import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import image1 from "../../public/images/nvidia10q_page-0001.jpg";

interface ImageToPDFConverterProps {
  imageSrc: string;
}

const ImageToPDFConverter: any = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const convertToPDF = () => {
    const canvas: any = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = image1.src;
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const pdf = new jsPDF();
        const imgData = canvas.toDataURL("image/jpeg");

        pdf.addImage(imgData, "JPEG", 10, 10, img.width / 4, img.height / 4);
        const pdfDataUrl = pdf.output("datauristring");
        return pdfDataUrl; // Pass PDF data URL to parent component
      }
    };
  };
  return convertToPDF;
};

export default ImageToPDFConverter;
