import React from "react";

const PasswordProgress = ({ password }: any) => {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const calculateProgress = () => {
    let progress = 0;
    if (hasMinLength) progress += 33.33;
    if (hasNumber) progress += 33.33;
    if (hasSymbol) progress += 33.34;
    return progress;
  };

  const progressStyle = {
    width: `${calculateProgress()}%`,
    height: "100%",
    backgroundColor: "green",
    transition: "width 0.3s ease-in-out",
  };

  return (
    <div
      style={{ width: "100%", height: "10px", backgroundColor: "lightgray" }}
    >
      <div style={progressStyle}></div>
    </div>
  );
};

export default PasswordProgress;
