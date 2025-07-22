import { useEffect } from "react";
import { useRouter } from "next/router";
import { BASE_URL } from "@/constant/constant";

export default function ConfirmEmail() {
  const router = useRouter();

  useEffect(() => {
    const { slug, hash } = router.query;

    const confirmEmail = async () => {
      if (!hash) return;

      try {
        const response = await fetch(`${BASE_URL}/auth/email/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hash }),
        });

        if (!response.ok) {
          console.error("Email confirmation failed");
        }

        // Redirect based on slug value
        const redirectUrl = slug === "1"
          ? "/login"
          : "https://alerts.bynd.ai/login";
          
        router.push(redirectUrl);
      } catch (error) {
        console.error("An error occurred while confirming email:", error);
        router.push(slug === "1" ? "/login" : "https://alerts.bynd.ai/login");
      }
    };

    confirmEmail();
  }, [router]);

  return null;
}
