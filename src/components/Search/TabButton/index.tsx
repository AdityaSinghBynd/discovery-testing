import React, { useMemo } from "react";
import { LucideIcon } from "lucide-react";

interface TabButtonProps {
  icon: LucideIcon;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({
  icon: Icon,
  label,
  count,
  isActive,
  onClick,
}) => (
  <button
    className={`relative flex items-center justify-center
      px-3.5 py-1 gap-2 border-none rounded 
      text-[#9BABC7] cursor-pointer 
      gap-2
      transition-colors duration-300 z-10
      ${isActive ? "!text-[#001742]" : ""}
      `}
    onClick={onClick}
    style={{ flex: 1 }}
  >
    <div className="relative z-10 flex items-center gap-2">
      <Icon 
        className={`w-[18px] h-[18px] ${
          isActive ? "text-[#001742]" : "text-[#9BABC7]"
        }`}
      />
      {label}
      {/* <span className="inline-block bg-[#f04438] text-white rounded px-1.5 py-0.5 text-sm font-medium m-0">
        {count}
      </span> */}
    </div>
  </button>
);

export const TabContainer: React.FC<{
  children: React.ReactNode;
  activeTab: string;
}> = ({ children, activeTab }) => {
  const tabOrder = ["keyTopics", "tables", "charts"];
  const activeIndex = useMemo(
    () => tabOrder.indexOf(activeTab),
    [activeTab, tabOrder],
  );

  return (
    <div className="relative flex justify-start items-center w-[600px] gap-2 py-1 px-1 rounded bg-[#eef3fb] pr-5">
      <div
        className="absolute h-[32px] bg-white rounded transition-all duration-300 ease-in-out"
        style={{
          width: "33%",
          transform: `translateX(${activeIndex * 100}%)`,
          zIndex: 0,
        }}
      />
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child as React.ReactElement<TabButtonProps>, {
          isActive: index === activeIndex,
        }),
      )}
    </div>
  );
};