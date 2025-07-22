import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BASE_URL } from "@/constant/constant";

export default function ConfirmEmail() {
  const router = useRouter();

  useEffect(() => {
    const { hash } = router.query;
    const confirmEmail = () => {
      if (hash) {
        fetch(`${BASE_URL}/auth/email/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hash }),
        })
          .then((response) => {
              if (response.ok) {
                console.log("Email confirmed successfully");
            } else {
              console.error("Email confirmation failed");
            }
            router.push("/login");
          })
          .catch((error) => {
            console.error("An error occurred while confirming email:", error);
            router.push("/login");
          });
      }
    };

    confirmEmail();
  }, [router]);

  return null;
}
