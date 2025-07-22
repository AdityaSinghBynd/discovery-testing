import React from "react";
import Image from "next/image";
import ByndLogo from "../../../../public/images/ByndLogo.svg";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { useToastStore } from "@/store/useTostStore";
import { resetRecentUploaded } from "@/redux/recentUploadedDocuments/recentUploadedSlice";
const index = () => {
  const router = useRouter();
  const {  reset , operations} = useToastStore();
  const dispatch = useDispatch();
  const handleLogoutClick = async () => {

    //clearing document title cache from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('document_title_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    await reset();
    dispatch(resetRecentUploaded());
    await signOut({ redirect: false });
    router.push("/login");
  };
  return (
    <div className="flex items-center justify-between px-4 py-2 mb-4 w-full">
      <div className="flex justify-center items-center">
        <Image src={ByndLogo} alt="Bynd" className="h-[28px] w-auto" />
      </div>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full border-1 bg-white border-[#EAF0FC] p-0 hover:bg-[#fbfdff] focus:ring-0 focus:ring-offset-0"
            >
              <User className="h-6 w-6 text-[#001742]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-52 p-2 rounded border-[#EAF0FC] bg-[#ffffff] hover:bg-[#fbfdff] shadow-custom"
            align="end"
            forceMount
          >
            <DropdownMenuItem
              onClick={handleLogoutClick}
              className="cursor-pointer"
            >
              <LogOut className="mr-1" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default index;
