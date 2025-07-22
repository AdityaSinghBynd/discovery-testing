import React, { useState, useEffect } from "react";
import styles from "@/styles/AskAimodal.module.scss";
import Image from "next/image";
import AI from "../../../public/images/Vector.svg";
import Action from "../../../public/images/ActionBlue.svg";
import { useDispatch, useSelector } from "react-redux";
import { getSelectedData, getOpenState } from "@/redux/askAi/selector";
import { AppDispatch, RootState } from "@/store/store";
import { setIsClose } from "@/redux/askAi/askAiSlice";
import ChatSection from "./ChatSection";
import ResponseSection from "./ResponseSection";

const AskAIModal = ({ }) => {
  const isOpen = useSelector(getOpenState);
  const dispatch: AppDispatch = useDispatch();

  const onClose = () => {
    dispatch(setIsClose());
  };

  if (!isOpen) return null;

  return (
    <div
      className="flex justify-center items-center fixed inset-0 bg-[rgba(0,38,115,0.1)] z-[5000]"
      onClick={onClose}
    >
      <article
        className="flex flex-col bg-white w-[95%] h-[90%] max-h-[900px] overflow-hidden rounded-xl shadow-custom-blue"
        onClick={(e) => e.stopPropagation()}
      >
        <header className='flex justify-between items-center py-2 px-3 border-b-2 border-[#eaf0fc]'>
          <div className='flex items-center gap-2'>
            <Image src={AI} alt="AI" />
            <span className='text-md font-medium'>Modify</span>
          </div>
          <button onClick={onClose} className='bg-transparent border-none cursor-pointer'>
            <Image src={Action} alt="Action" />
          </button>
        </header>

        <main className='flex w-full h-full'>
          <section className='w-1/2 h-full p-3 border-r-2 border-[#eaf0fc]'>
            <ChatSection />
          </section>
          <section className='w-1/2 h-full'>
            <ResponseSection />
          </section>
        </main>

      </article>
    </div>
  );
};

export default AskAIModal;
