import styles from "./about.module.css";
import { Disc, Heart, Users } from "lucide-react";

export default function About() {
  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>אודות צליל חוזר</h1>
        <p className={styles.subtitle}>הסיפור מאחורי הבית של חובבי המוזיקה בישראל.</p>
      </div>

      <div className={styles.grid}>
        <div className={`glass-panel ${styles.card}`}>
          <div className={styles.iconWrapper}>
            <Disc size={32} color="var(--primary)" />
          </div>
          <h2 className={styles.cardTitle}>החזון שלנו</h2>
          <p className={styles.cardText}>
            הרעיון מאחורי צליל חוזר נולד מתוך צורך אמיתי של הקהילה. רצינו לאגד את כל הציוד היד 2 של חובבי הפטיפונים במקום אחד ייעודי ומסודר, במקום שתיאלצו לחפש ולפרסם ברשתות חברתיות שונות, בלוחות יד 2 כלליים ובקבוצות מפוזרות.
          </p>
        </div>

        <div className={`glass-panel ${styles.card}`}>
          <div className={styles.iconWrapper}>
            <Heart size={32} color="var(--secondary)" />
          </div>
          <h2 className={styles.cardTitle}>אהבה למוזיקה</h2>
          <p className={styles.cardText}>
            אנחנו מאמינים שלכל תקליט יש סיפור, ולכל פטיפון יש נשמה. המטרה שלנו היא לא רק להוות פלטפורמת מסחר, אלא לחבר בין אנשים שחולקים את אותה התשוקה למוזיקה אנלוגית וסאונד איכותי.
          </p>
        </div>

        <div className={`glass-panel ${styles.card}`}>
          <div className={styles.iconWrapper}>
            <Users size={32} color="var(--text-main)" />
          </div>
          <h2 className={styles.cardTitle}>קהילה לפני הכל</h2>
          <p className={styles.cardText}>
            צליל חוזר נועדה להקל על הקונים והמוכרים כאחד. באמצעות מנגנוני סינון חכמים, חיפוש מבוסס מפה ואפשרות להעלות מספר פריטים במודעה אחת, אנחנו הופכים את חוויית היד שנייה לפשוטה, נגישה ומהנה.
          </p>
        </div>
      </div>
    </div>
  );
}
