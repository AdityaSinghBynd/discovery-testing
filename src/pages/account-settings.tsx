import React, { useEffect, useState } from "react";
import styles from "@/styles/AccountSetting.module.scss";
import Image from "next/image";
import { PasswordData } from "@/interface/Auth";
import { changePassword } from "@/services/authService";
import { UserUploadData } from "@/interface/Response";
import { UserUpdate } from "@/services/services";
import Check from "../../public/images/check.png";
import Cross from "../../public/images/cross.png";

const AccountSettings = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("ishan@bynd.ai");
  const [company, setCompany] = useState("Bynd");
  const [phoneNumber, setPhoneNumber] = useState("+91 860XXXXXXX");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [error, setError] = useState("Internal server Error !");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setIsError(false);
      setIsSuccessMessage(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 3500);
  }, [isSuccessMessage, isError]);

  const handleUpdatePassword: any = async (e: any) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");
    if (newPassword !== confirmPassword) {
      setError("Password not matched");
      setIsError(true);
      return;
    }

    try {
      const payload: PasswordData = {
        userId: userId,
        newPassword: newPassword,
        oldPassword: oldPassword,
      };
      const data = await changePassword(payload);
      if (data.status === 201) {
        setMessage(data.message);
        setIsSuccessMessage(true);
      }
    } catch (error) {
      setError("Internal server Error!");
      console.error("Login failed", error);
    }
  };

  const handleUpdateDetails: any = async (e: any) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");

    if (!lastName || !firstName) {
      setError("Please fill the input value");
      setIsError(true);
      return;
    }

    try {
      const payload: UserUploadData = {
        userId,
        firstName,
        lastName,
      };

      const data = await UserUpdate(payload);

      if (data.status === 201) {
        setMessage(data.message);
        setIsSuccessMessage(true);
      }
    } catch (error) {
      setError("Internal server Error!");
      console.error("Update failed", error);
    }
  };

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <div className={styles.accountSettings}>
            {isError ? (
              <div className={styles.errorMessageContainer}>
                <div className={styles.errorMessage}>
                  <Image src={Cross} alt="Cross" width={20} />
                  {error}
                </div>
              </div>
            ) : (
              <></>
            )}
            {isSuccessMessage ? (
              <div className={styles.succesMessageContainer}>
                <div className={styles.succesMessage}>
                  <Image src={Check} alt="Check" width={20} />
                  {message}
                </div>
              </div>
            ) : (
              <></>
            )}
            <div
              style={{ display: "flex", alignItems: "center", padding: "10px" }}
            >
              {/* <Link href="/" style={{ listStyle: 'none', textDecoration: 'none', color: 'black', paddingBottom: "10px", paddingRight: "10px" }}>
                <Image src={arrowIcon} alt="arrow" style={{ width: '30px', height: '30px' }} />
              </Link> */}
              <div>
                <h4 style={{ paddingBottom: "5px", fontWeight: "600" }}>
                  Account settings
                </h4>
              </div>
            </div>
            <div className={styles.container}>
              <h2>Account Details</h2>

              <div className={styles.accountDetailsContainer}>
                <div className={styles.formGroup}>
                  <label>First name</label>
                  <input
                    type="text"
                    value={firstName}
                    placeholder="Nikhil"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    placeholder="Sahni"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    className={styles.disabledInput}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company</label>
                  <input
                    className={styles.disabledInput}
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled
                  />
                </div>
                {/* <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div> */}
              </div>
              <button
                className={styles.updateButton}
                onClick={handleUpdateDetails}
              >
                Update Details
              </button>
            </div>

            <div className={styles.container}>
              <h2>Change Password</h2>
              <div className={styles.accountDetailsContainer}>
                <div className={styles.formGroup}>
                  <label>Old Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                className={styles.updateButton}
                onClick={handleUpdatePassword}
              >
                Update Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings;
