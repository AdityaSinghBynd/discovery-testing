import { memo } from "react";
import Image from "next/image";
import styles from "@/styles/toolBar.module.scss";
import AI from "../../../../public/images/vectorAISvgIcon.svg";

interface ModifyButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const ModifyButton = memo(
  ({ onClick, disabled = false, className = "" }: ModifyButtonProps) => {
    return (
      <div className={`${styles.modifyContainer} ${className}`}>
        <button
          type="button"
          className={styles.askAI}
          onClick={onClick}
          disabled={disabled}
          aria-label="Modify with AI"
        >
          <label className="cursor-pointer">
            <Image src={AI} alt="AI" width={20} height={20} />
          </label>
          <p className="text-[14px] text-[#4E5971]">Modify</p>
        </button>
      </div>
    );
  },
);

ModifyButton.displayName = "ModifyButton";
