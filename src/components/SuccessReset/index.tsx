import { useState } from "react";
import successIcon from "../../../public/images/Frame 27.png";
import Image from "next/image";
import Link from "next/link";

const Index = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  return (
    <div className="items-start p-[100px]">
      <div className="flex items-center justify-center pb-3">
        <Image
          src={successIcon}
          alt="successIcon"
          className="h-[100px] w-[100px]"
        />
      </div>

      <h2 className="text-center text-4 text-[#101828] font-medium leading-6 mb-3">
        Password reset successfully
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Link href="/login" className="flex justify-center w-full">
          <button
            type="submit"
            className="h-[54px] w-full bg-[#0047cb] text-white border-none rounded font-semibold text-base cursor-pointer transition-colors duration-200 hover:bg-[#003bb3] active:translate-y-[1px]"
          >
            Login
          </button>
        </Link>
      </form>
    </div>
  );
};

export default Index;
