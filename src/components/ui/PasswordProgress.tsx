import React from "react";

interface PasswordProgressProps {
  strength: number;
}

interface ProgressBarStyle {
  width: string;
  color: string;
}

const PasswordProgress: React.FC<PasswordProgressProps> = ({ strength }) => {
  const progressBarStyles: ProgressBarStyle[] = [
    { width: "0%", color: "bg-[#D92D20]" }, // Empty/Weak
    { width: "33%", color: "bg-[#D92D20]" }, // Weak
    { width: "66%", color: "bg-[#F79009]" }, // Medium
    { width: "100%", color: "bg-[#12B76A]" }, // Strong
  ];

  const currentProgress = progressBarStyles[strength];

  return (
    <div className="my-2">
      <div
        className="w-full h-2 bg-[#e0e0e0] rounded overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={strength * 33}
      >
        <div
          className={`h-full transition-all duration-300 ease-in-out ${currentProgress.color}`}
          style={{ width: currentProgress.width }}
        />
      </div>
    </div>
  );
};

export default PasswordProgress;
