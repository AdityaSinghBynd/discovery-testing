import { memo } from "react";
import Image from "next/image";
import styles from "@/styles/toolBar.module.scss";
import selectedImage from "../../../../public/images/selectedImage.svg";
import unSelectedImage from "../../../../public/images/unSelectedImage.svg";
import selectedScan from "../../../../public/images/selectedScan.svg";
import unSelectedScan from "../../../../public/images/UnselectedScan.svg";

interface ViewToggleProps {
  selectedButton: "selectedImage" | "selectedScan";
  onToggle: (type: "selectedImage" | "selectedScan") => void;
}

export const ViewToggle = memo(
  ({ selectedButton, onToggle }: ViewToggleProps) => (
    <div className={styles.toggleButton}>
      <button
        type="button"
        className={`${styles.imageToggleButton} ${
          selectedButton === "selectedImage" ? styles.selected : ""
        }`}
        onClick={() => onToggle("selectedImage")}
        aria-label="Image view"
      >
        <Image
          src={
            selectedButton === "selectedImage" ? selectedImage : unSelectedImage
          }
          alt="Image view"
          width={20}
          height={20}
        />
      </button>
      <button
        type="button"
        className={`${styles.imageToggleButton} ${
          selectedButton === "selectedScan" ? styles.selected : ""
        }`}
        onClick={() => onToggle("selectedScan")}
        aria-label="Scan view"
      >
        <Image
          src={
            selectedButton === "selectedScan" ? selectedScan : unSelectedScan
          }
          alt="Scan view"
          width={20}
          height={20}
        />
      </button>
    </div>
  ),
);

ViewToggle.displayName = "ViewToggle";
