import { FormEventHandler, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AUTH_URL } from "@/constant/constant";
import Head from "next/head";
import PasswordProgress from "@/components/ui/PasswordProgress";
import ByndLogo from "../../../public/images/ByndLogo.svg";
import { useRouter } from "next/navigation";
import { CheckCircle, CircleX, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPasswordMatch, setShowPasswordMatch] = useState(false);

  const togglePasswordVisibility = (field: string) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  const [password, setPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    number: false,
    symbol: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validatePassword = (password: string) => {
    const errors = {
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordErrors(errors);

    const strength = Object.values(errors).filter(Boolean).length;
    setPasswordStrength(strength);

    const allValidationsPassed = Object.values(errors).every(Boolean);
    if (allValidationsPassed) {
      setTimeout(() => {
        setShowValidation(false);
      }, 500);
    } else {
      setShowValidation(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === "password") {
      setPassword(value);
      validatePassword(value);
      setShowValidation(true);
      if (formData.confirmPassword) {
        setPasswordsMatch(value === formData.confirmPassword);
      }
    }
    if (name === "confirmPassword") {
      setShowPasswordMatch(true);
      setPasswordsMatch(value === formData.password);
    }
    if (name === "firstName" || name === "lastName") {
      const firstName = name === "firstName" ? value : formData.firstName;
      const lastName = name === "lastName" ? value : formData.lastName;
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
      setFormData((prevFormData) => ({
        ...prevFormData,
        username,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      if (formData.password === formData.confirmPassword) {
        const response = await fetch(`${AUTH_URL}/auth/email/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        // const data = await response.json();

        if (response.status === 204) {
          router.push("/email-verify");
          // window.location.href = "/email-verify";
        } else if (response.status === 422) {
          alert(
            "Email already exists. Please try with another email or contact us to sort out your account."
          );
        }
      }else {
        alert("Passwords do not match.");

      }
    } catch (error) {
      console.error("An error occurred while registering the user:", error);
      alert("An error occurred during registration. Please try again later.");
    }
  };

  return (
    <>
      <Head>
        <title>Bynd - Create Account</title>
        <meta name="description" content="Create your Bynd account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/ByndLogoFavicon.svg" />
      </Head>

      <div className="w-full min-h-screen bg-[#FAFCFF] p-4 overflow-y-auto flex flex-col gap-8">
        <Image
          src={ByndLogo}
          alt="Background"
          width={90}
          height={90}
          className="self-center"
        />
        <div className="flex flex-col max-w-[600px] w-full mx-auto">
          <div className="bg-white shadow-custom-blue rounded-[12px] p-4">
            <header className="flex flex-col items-center justify-center mb-3">
              <h1 className="text-[24px] font-medium leading-[38px] text-[#001742]">
                Create account
              </h1>
              <p className="text-md font-normal leading-6 text-[#001742]">
                Already have an account?
                <Link
                  href="/login"
                  className="text-[#0047cb] font-medium no-underline ml-2"
                >
                  Login
                </Link>
              </p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="First Name"
                    className="w-full p-2.5 text-sm bg-white border-[1.5px] border-[#eaf0fc] rounded text-base leading-6 text-[#101828] transition-all duration-200 placeholder:text-[#9babc7] focus:border-[#0047cb] focus:ring-1 focus:ring-[#0047cb] focus:ring-opacity-100 focus:outline-none"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Last Name"
                    className="w-full p-2.5 text-sm bg-white border-[1.5px] border-[#eaf0fc] rounded text-base leading-6 text-[#101828] transition-all duration-200 placeholder:text-[#9babc7] focus:border-[#0047cb] focus:ring-1 focus:ring-[#0047cb] focus:ring-opacity-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email"
                  className="w-full p-2.5 text-sm bg-white border-[1.5px] border-[#eaf0fc] rounded text-base leading-6 text-[#101828] transition-all duration-200 placeholder:text-[#9babc7] focus:border-[#0047cb] focus:ring-1 focus:ring-[#0047cb] focus:ring-opacity-100 focus:outline-none"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="w-full p-2.5 text-sm bg-white border-[1.5px] border-[#eaf0fc] rounded text-base leading-6 text-[#101828] transition-all duration-200 placeholder:text-[#9babc7] focus:border-[#0047cb] focus:ring-1 focus:ring-[#0047cb] focus:ring-opacity-100 focus:outline-none"
                  onFocus={() => {
                    setIsPasswordFocused(true);
                    setShowValidation(true);
                  }}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-1 cursor-pointer flex items-center justify-center hover:opacity-80"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye className="w-5 h-5 text-blue-500" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm Password"
                  className="w-full p-2.5 pr-11 text-sm bg-white border-[1.5px] border-[#eaf0fc] rounded text-base leading-6 text-[#101828] transition-all duration-200 placeholder:text-[#9babc7] focus:border-[#0047cb] focus:ring-1 focus:ring-[#0047cb] focus:ring-opacity-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none p-1 cursor-pointer flex items-center justify-center hover:opacity-80"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <Eye className="w-5 h-5 text-blue-500" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
              {/*} <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="agreeTerms">
                  I agree to Bynd&apos;s{" "}
                  <Link href="/" className={styles.termsLink}>
                    Terms of service
                  </Link>{" "}
                  and{" "}
                  <Link href="/" className={styles.termsLink}>
                    Privacy policy
                  </Link>
                </label>
              </div> */}

              <button
                type="submit"
                className="p-2.5 w-full bg-[#0047cb] text-white border-none rounded font-medium text-md cursor-pointer hover:bg-[#0047cb]/90"
              >
                Create
              </button>
            </form>
          </div>

          {showValidation && (
            <div className="mt-4">
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-2">
                  {passwordErrors.length ? <CheckCircle className="w-4 h-4 text-green-500" /> : <CircleX className="w-4 h-4 text-red-500" />}
                  <span className="text-sm text-[#4e5971]">
                    8 characters minimum
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  {passwordErrors.number ? <CheckCircle className="w-4 h-4 text-green-500" /> : <CircleX className="w-4 h-4 text-red-500" />}
                  <span className="text-sm text-[#4e5971]">a number</span>
                </p>
                <p className="flex items-center gap-2">
                  {passwordErrors.symbol ? <CheckCircle className="w-4 h-4 text-green-500" /> : <CircleX className="w-4 h-4 text-red-500" />}
                  <span className="text-sm text-[#4e5971]">a symbol</span>
                </p>
              </div>
              <PasswordProgress strength={passwordStrength} />
            </div>
          )}

          {showPasswordMatch && (
            <div className="mt-4">
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-2">
                  {passwordsMatch ? <CheckCircle className="w-4 h-4 text-green-500" /> : <CircleX className="w-4 h-4 text-red-500" />}
                  <span className="text-sm text-[#4e5971]">
                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}