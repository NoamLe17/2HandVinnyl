"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Filter, Disc, MapPin, Grid, List } from "lucide-react";
import styles from "./store.module.css";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { calculateDistance } from "@/lib/distance";

export default function StorePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  const [ads, setAds] = useState<any[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Filters State
  const [distance, setDistance] = useState(50);
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAds(adsData);
        setFilteredAds(adsData);
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.warn("Geolocation denied:", error)
      );
    }
  }, []);

  useEffect(() => {
    let updated = [...ads];

    // Filter by Category
    if (category !== "all") {
      updated = updated.filter(ad => ad.type === category);
    }

    // Filter by Condition
    if (condition !== "all") {
      updated = updated.filter(ad => ad.condition === condition);
    }

    // Filter by Distance
    if (userLocation) {
      updated = updated.map(ad => {
        if (ad.lat && ad.lng) {
          const dist = calculateDistance(userLocation.lat, userLocation.lng, ad.lat, ad.lng);
          return { ...ad, distanceCalc: dist };
        }
        return { ...ad, distanceCalc: 9999 };
      }).filter(ad => ad.distanceCalc <= distance);
    }

    setFilteredAds(updated);
  }, [distance, category, condition, ads, userLocation]);

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>חנות המוזיקה</h1>
          <p className={styles.subtitle}>מצאו ציוד ותקליטים ממוכרים מכל הארץ</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/ads/new" className="btn-primary">
            <PlusIcon /> פרסם מודעה
          </Link>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input type="text" placeholder="חיפוש תקליטים, פטיפונים..." />
        </div>
        
        <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={20} />
          <span>סינון מתקדם</span>
        </button>

        <div className={styles.viewToggle}>
          <button 
            className={viewMode === "grid" ? styles.activeView : ""} 
            onClick={() => setViewMode("grid")}
          >
            <Grid size={20} />
          </button>
          <button 
            className={viewMode === "list" ? styles.activeView : ""} 
            onClick={() => setViewMode("list")}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={`glass-panel ${styles.topbarFilters}`}>
          <div className={styles.filterGroup}>
            <label>קטגוריה</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">הכל</option>
              <option value="תקליט">תקליטים</option>
              <option value="פטיפון">פטיפונים</option>
              <option value="רמקולים">רמקולים</option>
              <option value="מגבר">מגברים</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>מצב פריט</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="all">כל המצבים</option>
              <option value="חדש באריזה">חדש באריזה</option>
              <option value="כמו חדש (NM)">כמו חדש (NM)</option>
              <option value="טוב מאוד (VG+)">טוב מאוד (VG+)</option>
              <option value="טוב (VG)">טוב (VG)</option>
              <option value="סביר (G)">סביר (G)</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.sliderContainer}>
              <label>מרחק מקסימלי: {distance} ק"מ</label>
              <input 
                type="range" 
                min="5" 
                max="100" 
                step="5"
                value={distance} 
                onChange={(e) => setDistance(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      <main className={`${styles.grid} ${viewMode === "list" ? styles.listView : ""}`}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>טוען נתונים...</div>
        ) : filteredAds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }} className="glass-panel">
            <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>לא נמצאו מודעות המתאימות לסינון.</p>
            <button className="btn-secondary" onClick={() => { setDistance(100); setCategory("all"); setCondition("all"); }}>
              נקה סינונים
            </button>
          </div>
        ) : (
          filteredAds.map((item) => (
            <div key={item.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardImage}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface-hover) 0%, rgba(123, 44, 191, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Disc size={48} color="var(--primary)" opacity={0.3} />
                </div>
                <div className={styles.badge}>{item.type}</div>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.location}>
                    <MapPin size={14} />
                    {item.locationName}
                    {item.distanceCalc && ` (${item.distanceCalc.toFixed(1)} ק"מ)`}
                  </span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.price}>₪{item.price}</span>
                  <Link href={`/store/${item.id}`} className="btn-secondary">פרטים</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
