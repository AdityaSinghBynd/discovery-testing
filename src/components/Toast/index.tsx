"use client";
import { MultiFileToast } from "./multi-file-toast";
export function ToastContainer() {
  return (
    <div className="fixed bottom-0 right-0 z-50 m-4">
      <MultiFileToast />
    </div>
  );
}
