import { useRouter } from "next/router";
import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function SSO() {
  const { token } = useRouter().query;

  useEffect(() => {
    if (token) {
      signIn("sso-token", {
        token: token as string,
        callbackUrl: "/", // redirect after login
      });
    }
  }, [token]);

  return <p>Logging in via SSO…</p>;
}