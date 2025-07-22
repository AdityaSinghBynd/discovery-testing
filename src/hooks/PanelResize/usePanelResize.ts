import { useState, useCallback, useEffect } from "react";
import { PanelLayout, PageDimensions } from "@/types/discovery";

export const usePanelResize = (currentPageDimensions: PageDimensions) => {
  const BASE_WIDTH = 595;
  const [horizontalLayout, setHorizontalLayout] = useState<PanelLayout>({
    leftPanel: 33,
    rightPanel: 67,
  });

  const [verticalLayout, setVerticalLayout] = useState({
    topPanel: 53.5,
    bottomPanel: 46.5,
  });

  const calculatePanelLayout = useCallback(() => {
    const currentWidth = currentPageDimensions.width || BASE_WIDTH;
    const widthDifference = currentWidth - BASE_WIDTH;
    const adjustmentFactor = 0.01;

    const calculateAdjustedLayout = (baseSize: number) => {
      const sizeAdjustment = widthDifference * adjustmentFactor;
      return currentWidth > BASE_WIDTH
        ? baseSize + sizeAdjustment
        : baseSize - sizeAdjustment;
    };

    return {
      horizontal: {
        leftPanel: calculateAdjustedLayout(33),
        rightPanel: calculateAdjustedLayout(67),
      },
      vertical: {
        topPanel: calculateAdjustedLayout(53.5),
        bottomPanel: calculateAdjustedLayout(46.5),
      },
    };
  }, [currentPageDimensions]);

  useEffect(() => {
    const { horizontal, vertical } = calculatePanelLayout();
    setHorizontalLayout(horizontal);
    setVerticalLayout(vertical);
  }, [calculatePanelLayout]);

  const resetLayouts = () => ({
    horizontal: { leftPanel: 33, rightPanel: 67 },
    vertical: { topPanel: 53.5, bottomPanel: 46.5 },
  });

  return {
    horizontalLayout,
    verticalLayout,
    resetLayouts,
  };
};
