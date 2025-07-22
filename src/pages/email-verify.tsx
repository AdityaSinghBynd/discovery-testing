"use client"

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import ByndLogo from "../../public/images/ByndLogo.svg";

export default function EmailVerify() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("registeredEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleCheckEmail = () => {
    window.open("https://mail.google.com/mail/u/0/#inbox", "_blank");
  };

  return (
    <>
      <Head>
        <title>Bynd - Email Verification</title>
        <meta name="description" content="Verify your Bynd account email" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/ByndLogoFavicon.svg" />
      </Head>

        <div className="w-full bg-[#FAFCFF] p-4 flex flex-col justify-start items-start min-h-screen gap-8">
        <Image src={ByndLogo} alt="ByndLogo" width={90} height={90} className="self-center" />
          <div className="max-w-[600px] w-full mx-auto p-4 bg-white shadow-custom-blue rounded-[12px]">
            <header className="flex flex-col gap-2 items-center justify-center text-center">
              <h1 className="text-[24px] font-normal text-[#001742]">
                Check your Email
              </h1>
              <div>
                <p className="text-base leading-6 text-[#344054] font-normal">
                  We have sent an email for verification to{" "}
                  <span className="text-[#0047cb] font-medium">
                    {email || "your email"}
                  </span>
                </p>
                <p className="text-base leading-6 text-[#344054] font-normal m-0">
                  Didn&apos;t receive the email yet? Check your spam folder.
                </p>
              </div>
            </header>
            <div className="mt-6">
              <button
                onClick={handleCheckEmail}
                className="p-2.5 w-full bg-[#0047cb] text-white border-none rounded !hover:bg-[#0047cb]/90] focus:outline-none font-medium text-base cursor-pointer disabled:bg-[#e4e7ec] disabled:cursor-not-allowed disabled:hover:bg-[#e4e7ec]"
                aria-label="Open email client"
              >
                Check Email
              </button>
            </div>
          </div>
        </div>
    </>
  );
}