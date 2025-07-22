import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";

const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        setToken(session?.accessToken ?? null);
      } catch (error) {
        console.error("Failed to retrieve session:", error);
        setToken(null);
      }
    })();
  }, []);

  return token;
};

export default useAuthToken;
