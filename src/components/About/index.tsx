import Image from "next/image";
import byndLogo from "../../../public/images/ByndLogo.svg";
import moreTimeIcon from "../../../public/images/more_time.svg";
import insightsIcon from "../../../public/images/more_time (1).svg";
import styles from "@/styles/About.module.scss";

const About = () => {
  return (
    <section className={styles.about}>
      <div className={styles.logoWrapper}>
        <Image
          src={byndLogo}
          alt="Bynd Logo"
          className={styles.logo}
          priority
        />
      </div>

      <h1 className={styles.heading}>
        Next generation of
        <span className={styles.headingHighlight}>
          AI-powered workflow automation
        </span>
      </h1>

      <div className={styles.features}>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>
            <Image
              src={moreTimeIcon}
              alt="Time Saving"
              width={24}
              height={24}
            />
          </div>
          <p className={styles.featureText}>
            Save Time and Gain Accuracy Through Automated Workflows
          </p>
        </div>

        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>
            <Image src={insightsIcon} alt="Insights" width={24} height={24} />
          </div>
          <p className={styles.featureText}>
            Uncover Deeper Insights by Connecting the Dots Across Data Sources
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
