import { getSession, signOut } from "next-auth/react";

/**
 * Triggers a session refresh using NextAuth's built-in endpoint.
 * Returns the updated session or null if refresh fails.
 */
export const refreshSession = async () => {
  // POST to NextAuth's session update endpoint
  const res = await fetch("/api/auth/session?update", { method: "POST" });
  console.log("res-------->", res);``

  if (res.ok) {
    // Now get the updated session
    return await getSession();
  } else {
    // Optionally sign out if refresh fails
    // await signOut({ callbackUrl: "/login" });
    return null;
  }
};