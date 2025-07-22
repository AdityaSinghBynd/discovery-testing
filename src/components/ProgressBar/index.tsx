import React, { useState, useEffect } from "react";
import styles from "@/styles/ProgressBar.module.scss";

const ProgressBar = ({ progress }: any) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (progress > 0) {
      timer = setInterval(() => {
        setWidth((prevWidth) => {
          if (prevWidth >= progress) {
            clearInterval(timer);
            return progress;
          }
          return prevWidth + 1;
        });
      }, 10);
    }

    return () => clearInterval(timer);
  }, [progress]);

  useEffect(() => {
    if (progress === 100) {
      setWidth(100);
    }
  }, [progress]);

  return (
    <div className={styles.progressBar}>
      <div className={styles.progressFill} style={{ width: `${width}%` }} />
    </div>
  );
};

export default ProgressBar;
