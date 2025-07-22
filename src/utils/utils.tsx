import { RootState } from "@/store/store";
import { ChevronRight } from "lucide-react";
import { useCallback } from "react";
import { useSelector } from "react-redux";

const cleanPdfName = (fileName: string) => {
  // Remove file extension (.pdf)
  let cleanedName = fileName.slice(0, -4);

  // Convert to Pascal case
  cleanedName = cleanedName.replace(/\b\w/g, (char) => char.toUpperCase());

  // Remove numbers in parentheses
  cleanedName = cleanedName.replace(/\(\d+\)/g, "");

  return cleanedName;
};

export function sortCompaniesAlphabetically(companies: any) {
  return companies
    .filter((company: any) => typeof company.name === "string")
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
}

export function cleanFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9\s]/g, " ").toUpperCase();
}

export default cleanPdfName;

export function toPascalCase(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export function optimizeDataStructure(data: any, tableChunks: any) {
  const optimizedStructure: any = [];

  Object.keys(data).forEach((pageNum) => {
    const page = parseInt(pageNum, 10);
    optimizedStructure[page] = {
      title: data[pageNum],
      chunks: data[pageNum],
      tableChunks: tableChunks[pageNum] || [],
    };
  });

  return optimizedStructure;
}

export function extractDateTime(isoString: string) {
  const date = new Date(isoString);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  const formattedTime = `${hours}:${minutes}`;

  return {
    date: formattedDate,
    time: formattedTime,
  };
}

export const findSectionIndex = (page: number, sections: any) => {
  for (let i = 0; i < sections.length; i++) {
    if (page >= sections[i].startPage && page <= sections[i].endPage) {
      return sections[i].index;
    }
  }
  return null;
};

export const getBorderColor = (sectionIndex: number) => {
  const colors = [
    "#9747FF",
    "#FFA629",
    "#14AE5C",
    "#F24822",
    "#04E8BF",
    "#FF47C0",
    "#FFC107",
    "#28A745",
    "#20C997",
    "#17A2B8",
    "#6C757D",
    "#343A40",
  ];
  return colors[sectionIndex % colors.length];
};

export const truncateText = (text: string | undefined | null, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const baseUrl = (url: string) => {
  const lastIndex = url?.lastIndexOf("/RAW");
  return lastIndex !== -1 ? url?.substring(0, lastIndex) : url;
};

export const formatDate = (date: string | Date): string => {
  const now = new Date();
  const givenDate = new Date(date);

  const timeDifference = now.getTime() - givenDate.getTime();

  const daysAgo = Math.floor(timeDifference / (1000 * 3600 * 24));

  if (daysAgo === 0) {
    return "Today";
  } else if (daysAgo === 1) {
    return "1 day ago";
  } else {
    return `${daysAgo} days ago`;
  }
};


export  const sanitizedName = (fileName: string) => {
  return fileName
  ?.replace(/[^a-zA-Z0-9]/g, '_')
  ?.toLowerCase()
  ?.slice(0, 50); 
}

export function extractDocumentInfo(url: string) {
  const splittedValues = url.split('/');

  // Extract values with fallback checks
  const year = splittedValues[splittedValues.length - 3] || "Unknown";
  const companyName = splittedValues[splittedValues.length - 5] || "Unknown";
  let docType = splittedValues[splittedValues.length - 4] || "Unknown";

  // Convert "Annual_Reports" to "AR"
  if (docType === "Annual_Reports") {
    docType = "AR";
  }

  // Extract filename
  const fileName = url.split("/").pop() || "";

  // Format document type with year
  const documentType = `${docType}`;

  return {
    fileName,
    year,
    documentType,
    companyName,
  };
}

export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return 'just now';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'just now';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // If the difference is negative (future date) or very small, return 'just now'
  if (diffInSeconds < 0 || diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays === 0) {
    return 'today';
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  }
}; 