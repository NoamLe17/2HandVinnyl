"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Map, ShoppingBag, MapPin, Disc } from "lucide-react";
import styles from "./page.module.css";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { calculateDistance } from "@/lib/distance";

export default function Home() {
  const [distance, setDistance] = useState(15);
  const [ads, setAds] = useState<any[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const q = query(collection(db, "ads"), orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAds(adsData);
        setFilteredAds(adsData); // Default to showing recent ones if no location
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
        (error) => {
          console.warn("Geolocation denied or failed:", error);
        }
      );
    }
  }, []);

  // Filter ads when distance or user location changes
  useEffect(() => {
    if (userLocation && ads.length > 0) {
      const updated = ads.map(ad => {
        if (ad.lat && ad.lng) {
          const dist = calculateDistance(userLocation.lat, userLocation.lng, ad.lat, ad.lng);
          return { ...ad, distanceCalc: dist };
        }
        return { ...ad, distanceCalc: 9999 }; // put them far away if no coordinates
      }).filter(ad => ad.distanceCalc <= distance)
        .sort((a, b) => a.distanceCalc - b.distanceCalc);
      
      setFilteredAds(updated);
    } else {
      setFilteredAds(ads);
    }
  }, [distance, userLocation, ads]);

  return (
    <div style={{ width: '100%' }}>
      <div className={styles.heroSection}>
        <div className={styles.heroBackground}></div>
        <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroText}>
          <div className={styles.badge}>פלטפורמת היד שנייה למוזיקה</div>
          <h1 className={styles.title}>
            הבית של <span className={styles.highlight}>חובבי המוזיקה</span>
          </h1>
          <p className={styles.subtitle}>
            צליל חוזר היא הפלטפורמה המובילה למכירה וקנייה של תקליטים וציוד פטיפונים יד שנייה.
            מצאו את התקליט הבא שלכם או מכרו את הציוד הישן בקלות, באמצעות חיפוש בחנות או על גבי מפה אינטראקטיבית.
          </p>
          
          <div className={styles.actions}>
            <Link href="/store" className={`btn-primary ${styles.btnLarge}`}>
              <ShoppingBag size={24} />
              היכנסו לחנות
            </Link>
            <Link href="/map" className={`btn-secondary ${styles.btnLarge}`}>
              <Map size={24} />
              צפו במפה
            </Link>
          </div>
        </div>
      </div>
      </div>

      {/* Local Ads Section */}
      <div className={styles.localSection}>
        <div className="container">
          <div className={styles.localHeader}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>מודעות באזורך</h2>
            <div className={styles.distanceFilter}>
              <label>מרחק מקסימלי: {distance} ק"מ</label>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="5"
                value={distance} 
                onChange={(e) => setDistance(Number(e.target.value))}
                className={styles.slider}
              />
            </div>
          </div>

          <div className={styles.grid}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>טוען נתונים...</div>
            ) : filteredAds.length === 0 ? (
              <div className={`glass-panel ${styles.emptyState}`}>
                <p>לא מצאנו מודעות במרחק {distance} ק"מ ממך.</p>
                <button onClick={() => setDistance(50)} className="btn-secondary" style={{marginTop: '16px'}}>
                  הגדל את רדיוס החיפוש
                </button>
              </div>
            ) : (
              filteredAds.slice(0, 3).map(item => (
                <div key={item.id} className={`glass-panel ${styles.card}`}>
                  <div className={styles.cardImage}>
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface-hover) 0%, rgba(123, 44, 191, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Disc size={48} color="var(--primary)" opacity={0.3} />
                    </div>
                    <div className={styles.cardBadge}>{item.type}</div>
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
          </div>
          
          {filteredAds.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link href="/store" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
                צפה בכל המודעות (עוד {filteredAds.length - 3})
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
