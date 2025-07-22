import { FormEventHandler, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import About from "../About";
import router from "next/router";
import eyeImage from "../../../public/images/show.png";
import closedEyeImage from "../../../public/images/hide.png";
import crossImage from "../../../public/images/cross.png";
import Head from "next/head";
import { signIn } from "next-auth/react";


// The following export is a React component, not a Next.js page export.
// There is no getStaticPaths function here, so the error "TypeError: getStaticPaths is not a function"
// would not be caused by this file. If you are seeing this error, ensure that you are not trying to
// use getStaticPaths in a non-page component, or that your page exports it correctly.

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (field: string) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isError, setError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/saml/login`;
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (result?.error) {
      if (result.error === "Email not verified") {
        router.push("/email-verify");
      } else {
        setError(true);
        console.error("Login failed:", result.error);
      }
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>Bynd - Login</title>
        <meta name="description" content="Login to your Bynd account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/ByndLogoFavicon.svg" />
      </Head>

      <div className="flex min-h-screen w-full">
        <div className="w-1/2 flex-shrink-0 bg-white">
          <About />
        </div>

        <div className="w-1/2 bg-[#f0f2f5] p-10 overflow-y-auto scrollbar scrollbar-thin scrollbar-track-[#f7fafc] scrollbar-thumb-[#cbd5e0] scrollbar-thumb-rounded">
          <div className="max-w-[600px] w-full mx-auto py-10">
            <div className="header-section">
              <h1 className="text-[30px] font-bold leading-[38px] text-[#101828] m-0 mb-3">
                Welcome Back
              </h1>
              {/* <div className="signup-link">
                <p className="text-base font-medium leading-6 text-[#344054] mb-4">
                  Don&apos;t have an account?
                  <Link
                    href="/register"
                    className="text-[#0047cb] no-underline ml-2 hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div> */}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="email-input-section relative mb-6">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full h-[54px] px-3.5 py-2.5 bg-white border border-[#e4e7ec] rounded text-base leading-6 text-[#101828] transition-all duration-200 placeholder:text-[#667085] focus:border-[#0047cb] focus:ring-1 focus:ring-[#0047cb] focus:ring-opacity-100 focus:outline-none"
                />
              </div>

              <div className="password-input-section relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="w-full h-[54px] px-3.5 py-2.5 pr-11 bg-white border border-[#e4e7ec] rounded text-base leading-6 text-[#101828] transition-all duration-200 placeholder:text-[#667085] focus:border-[#0047cb] focus:ring-1 focus:ring-[#0047cb] focus:ring-opacity-100 focus:outline-none"
                  onFocus={() => setIsPasswordFocused(true)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-1 cursor-pointer flex items-center justify-center hover:opacity-80"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Image
                    src={showPassword ? eyeImage : closedEyeImage}
                    alt={showPassword ? "Hide password" : "Show password"}
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* <div className="forgot-password-section text-right">
                  <Link
                    href="/forgot-password"
                    className="inline-block text-[#0047cb] text-sm font-semibold no-underline -mt-3 -mb-2 hover:cursor-pointer"
                  >
                    Forgot Password?
                  </Link>
                </div> */}

                <div className="submit-button-section">
                  <button
                    type="submit"
                    className="h-[54px] w-full mt-3 bg-[#0047cb] text-white border-none rounded font-semibold text-base cursor-pointer transition-colors duration-200 hover:bg-[#003bb3] active:translate-y-[1px]"
                  >
                    Login
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="h-[54px] w-full mt-3 bg-[#0047cb] text-white border-none rounded font-semibold text-base cursor-pointer transition-colors duration-200 hover:bg-[#003bb3] active:translate-y-[1px]"
                  onClick={handleLogin}
                >
                  Login with Microsoft
                </button>
              </div>
              {isError && (
                <div className="error-message-section flex items-start gap-3 p-4 bg-[#fff1f1] border border-[#fecdcd] rounded mt-2">
                  <div className="error-icon flex-shrink-0 mt-0.5">
                    <Image
                      src={crossImage}
                      alt="Error"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div className="error-content flex-1">
                    <p className="text-[#d92d20] font-medium text-sm m-0 mb-1">
                      Error
                    </p>
                    <p className="text-[#667085] text-sm leading-5 m-0">
                      The provided email address and password do not match our
                      records. Please double-check your credentials and try
                      again.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}