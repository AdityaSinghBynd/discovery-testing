import { useState } from "react";
import axios from "axios";

export const useClipboard = (isTable: boolean = false) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const copyToClipboard = async (tableTitle: string, contentToCopy: string) => {
    try {
      setIsCopying(true);
      
      if (isTable) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = contentToCopy;

        const response = await axios.post(
          "https://excel-table-function.azurewebsites.net/api/http_trigger",
          {
            data: [
              {
                title: tableTitle,
                content: contentToCopy,
              },
            ],
            is_excel: false,
          }
        );

        await navigator.clipboard.writeText(response?.data);
      } else if (contentToCopy.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || contentToCopy.startsWith('data:image/')) {
        // For image URLs, create a temporary image element
        await copyImageToClipboard(contentToCopy);
      } else {
        // For regular text
        await navigator.clipboard.writeText(contentToCopy);
      }

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy content: ", err);
    } finally {
      setIsCopying(false);
    }
  };

  const copyImageToClipboard = async (imageUrl: string): Promise<void> => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Helps with CORS issues
    
    try {
      // Create a promise that resolves when the image loads
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      // Create a canvas and draw the image
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get the blob from canvas
      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, "image/png")
      );
      
      if (!blob) {
        throw new Error("Failed to create blob from image");
      }
      
      // Use the Clipboard API to write the image
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
    } catch (error) {
      console.error("Error copying image to clipboard:", error);
      
      // Fallback: try using the browser's fetch API directly
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
      } catch (fetchError) {
        console.error("Fallback image copy failed:", fetchError);
        // Last resort: copy the URL
        await navigator.clipboard.writeText(imageUrl);
      }
    }
  };

  return { isCopied, isCopying, copyToClipboard };
};
