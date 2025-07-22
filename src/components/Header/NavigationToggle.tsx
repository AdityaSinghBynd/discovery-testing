import React from "react";
import styles from "@/styles/Header.module.scss";
import { updateProject } from "@/redux/projectDocuments/projectDocumentsThunks";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
const NavigationToggle: React.FC<any> = ({ selected }) => {
  const dispatch: AppDispatch = useDispatch();

  const handleButtonClick = (buttonName: "Discovery" | "Workspace") => {
    dispatch(updateProject({ payload: { tabSelected: buttonName } }));
  };

  return (
    <div className={styles.extractionHeaderComponents}>
      <div className={styles.extractionWorkspaceButtons}>
        <button
          type="button"
          className={`${styles.extractionWorkspacebtn} ${
            selected === "Discovery" ? styles.selected : ""
          }`}
          onClick={() => handleButtonClick("Discovery")}
        >
          Discovery
        </button>
        <button
          type="button"
          className={`${styles.extractionWorkspacebtn} ${
            selected === "Workspace" ? styles.selected : ""
          }`}
          onClick={() => handleButtonClick("Workspace")}
        >
          Workspace {/*<span className={styles.elementCount}>{0}</span>*/}
        </button>
      </div>
    </div>
  );
};

export default NavigationToggle;
