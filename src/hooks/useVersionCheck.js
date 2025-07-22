// hooks/useVersionCheck.js
import { useEffect, useState } from "react";
import axios from "axios";

const useVersionCheck = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await axios.get("/api/version");
        const latestVersion = response.data.version.trim();
        const currentVersion = localStorage.getItem("appVersion");

        if (currentVersion && currentVersion !== latestVersion) {
          setIsUpdateAvailable(true);
          localStorage.setItem("appVersion", latestVersion);
        } else {
          localStorage.setItem("appVersion", latestVersion);
        }
      } catch (error) {
        console.error("Failed to check version:", error);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 300000);

    return () => clearInterval(interval);
  }, []);

  return isUpdateAvailable;
};

export default useVersionCheck;
