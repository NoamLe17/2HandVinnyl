"use client";

import styles from "./map.module.css";
import dynamic from "next/dynamic";
import { Filter } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>טוען מפה (Client)...</div>
});

export default function MapPage() {
  return (
    <div className={styles.container}>
      {/* Horizontal Filter Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.filterTitle}>
            <Filter size={20} color="var(--primary)" />
            <span>סינון תוצאות:</span>
          </div>

          <div className={styles.filterGroup}>
            <select>
              <option>כל הפריטים</option>
              <option>תקליטים</option>
              <option>ציוד פטיפונים</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <select>
              <option>כל המצבים</option>
              <option>חדש באריזה</option>
              <option>כמו חדש (NM)</option>
              <option>טוב (VG)</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.priceRange}>
              <input type="number" placeholder="מחיר מ-" />
              <span>-</span>
              <input type="number" placeholder="עד ₪" />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <select>
              <option>מרחק מירבי: הכל</option>
              <option>עד 5 ק"מ</option>
              <option>עד 10 ק"מ</option>
              <option>עד 25 ק"מ</option>
              <option>עד 50 ק"מ</option>
            </select>
          </div>

          <button className={`btn-primary ${styles.filterBtn}`}>חפש</button>
        </div>
      </div>

      {/* Full Bleed Map */}
      <div className={styles.mapContainer}>
        <MapComponent />
      </div>
    </div>
  );
}
