import { BASE_URL } from "@/constant/constant";
import { useEffect, useState, useRef } from "react";
import { getSession } from "next-auth/react";

function useActivityTracker() {
  const [activeTime, setActiveTime] = useState(0);
  const sessionStartRef = useRef(Date.now());
  const intervalRef = useRef(null);

  async function createSession() {
    const session = await getSession();
    const token = session?.accessToken;

    const response = await fetch(`${BASE_URL}/users/activeSession`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    localStorage.setItem("sessionId", data.id); // Set sessionId in localStorage
    setActiveTime(data.activeDuration);
  }

  async function updateSession() {
    const storedSessionId = localStorage.getItem("sessionId");
    if (!storedSessionId) return;

    const session = await getSession();
    const token = session?.accessToken;

    const sessionEnd = Date.now();
    const timeSpent = sessionEnd - sessionStartRef.current;

    setActiveTime((prevActiveTime) => prevActiveTime + timeSpent);
    sessionStartRef.current = sessionEnd;

    const response = await fetch(
      `${BASE_URL}/users/activeSession/${storedSessionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activeDuration: activeTime + timeSpent }),
      },
    );
  }

  function resetActivityInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      updateSession();
    }, 30000); // Reset the interval to 30 seconds
  }

  useEffect(() => {
    createSession();

    // Set the initial interval
    resetActivityInterval();

    // Add event listeners for user interactions
    const handleUserInteraction = () => {
      resetActivityInterval(); // Reset the timeout on interaction
    };

    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("scroll", handleUserInteraction);

    window.addEventListener("beforeunload", updateSession);

    return () => {
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("beforeunload", updateSession);

      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null;
}

export default useActivityTracker;
