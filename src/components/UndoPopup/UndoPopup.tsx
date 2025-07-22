import React, { useEffect, useState } from "react";
import Image from "next/image";
import Alert from "../../../public/images/alert-circle-filled.svg";

interface UndoPopupProps {
  message: string;
  onUndo: () => void;
  onClose: () => void;
}

const UndoPopup: React.FC<UndoPopupProps> = ({ message, onUndo, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleUndo = () => {
    onUndo();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 text-[#001742] px-4 py-2 flex items-center justify-between gap-3 rounded border-2 border-[#eaf0fc] bg-[#f7f9fe] shadow-custom-blue z-[1000]">
      <Image src={Alert} alt="Alert" width={24} height={24} />
      <span className="text-[#001742] text-sm font-normal">
        {message}<span className="text-red-400 text-sm font-medium">  is removed from workspace</span>
      </span>
      {/*<button onClick={handleUndo}>Undo</button> */}
    </div>
  );
};

export default UndoPopup;
