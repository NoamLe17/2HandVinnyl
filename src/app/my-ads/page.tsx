"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, onSnapshot, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Eye, Map, ShoppingBag, TrendingUp, Music, MapPin, Plus, ExternalLink } from "lucide-react";
import styles from "./my-ads.module.css";

export default function MyAdsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [adStats, setAdStats] = useState<{
    totalViews: number;
    storeViews: number;
    mapViews: number;
    cities: Record<string, number>;
    recentEvents: any[];
  } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push("/login"); return; }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // Fetch my ads
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "ads"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMyAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // Real-time stats for selected ad
  useEffect(() => {
    if (!selectedAd) { setAdStats(null); return; }

    const eventsRef = collection(db, "ads", selectedAd.id, "events");
    const unsub = onSnapshot(eventsRef, (snap) => {
      const events = snap.docs.map(d => d.data());
      const storeViews = events.filter(e => e.type === "store_view").length;
      const mapViews = events.filter(e => e.type === "map_view").length;
      const cities: Record<string, number> = {};
      events.forEach(e => {
        if (e.city) cities[e.city] = (cities[e.city] || 0) + 1;
      });
      // Sort recent
      const recent = [...events]
        .filter(e => e.timestamp)
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        .slice(0, 5);

      setAdStats({ totalViews: storeViews + mapViews, storeViews, mapViews, cities, recentEvents: recent });
    });
    return () => unsub();
  }, [selectedAd]);

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>טוען...</div>;

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>המודעות שלי</h1>
          <p className={styles.subtitle}>ניהול ומעקב אחרי ביצועי המודעות שלך בזמן אמת</p>
        </div>
        <Link href="/ads/new" className="btn-primary" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Plus size={20} /> מודעה חדשה
        </Link>
      </div>

      {myAds.length === 0 ? (
        <div className={`glass-panel ${styles.emptyState}`}>
          <Music size={48} color="var(--primary)" opacity={0.4} />
          <h2>עדיין לא פרסמת מודעות</h2>
          <p>פרסם את המודעה הראשונה שלך וצפה בנתוני הצפיות בזמן אמת.</p>
          <Link href="/ads/new" className="btn-primary">פרסם מודעה ראשונה</Link>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Ads list */}
          <div className={styles.adsList}>
            {myAds.map(ad => (
              <div
                key={ad.id}
                className={`glass-panel ${styles.adCard} ${selectedAd?.id === ad.id ? styles.adCardActive : ""}`}
                onClick={() => setSelectedAd(ad)}
              >
                <div className={styles.adCardTop}>
                  <div>
                    <span className={styles.adBadge}>{ad.type}</span>
                    <h3 className={styles.adTitle}>{ad.title}</h3>
                  </div>
                  <span className={styles.adPrice}>₪{ad.price}</span>
                </div>
                <div className={styles.adMeta}>
                  <span><MapPin size={13} /> {ad.locationName}</span>
                  <span>{ad.createdAt ? new Date(ad.createdAt.seconds * 1000).toLocaleDateString("he-IL") : "—"}</span>
                </div>
                <div className={styles.adLinks}>
                  <Link href={`/store/${ad.id}`} className={styles.viewLink} onClick={e => e.stopPropagation()}>
                    <ExternalLink size={14} /> צפה במודעה
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Stats panel */}
          <div className={styles.statsPanel}>
            {!selectedAd ? (
              <div className={`glass-panel ${styles.noSelection}`}>
                <TrendingUp size={40} color="var(--primary)" opacity={0.3} />
                <p>בחר מודעה כדי לראות אנליטיקה מפורטת</p>
              </div>
            ) : (
              <>
                <div className={styles.statsHeader}>
                  <h2>{selectedAd.title}</h2>
                  <span className={styles.liveIndicator}>● LIVE</span>
                </div>

                <div className={styles.statsGrid}>
                  <div className={`glass-panel ${styles.statCard}`}>
                    <Eye size={28} color="var(--primary)" />
                    <div className={styles.statNumber}>{adStats?.totalViews ?? "—"}</div>
                    <div className={styles.statLabel}>סה"כ צפיות</div>
                  </div>
                  <div className={`glass-panel ${styles.statCard}`}>
                    <ShoppingBag size={28} color="#3A86FF" />
                    <div className={styles.statNumber} style={{ color: "#3A86FF" }}>{adStats?.storeViews ?? "—"}</div>
                    <div className={styles.statLabel}>מהחנות</div>
                  </div>
                  <div className={`glass-panel ${styles.statCard}`}>
                    <Map size={28} color="#06d6a0" />
                    <div className={styles.statNumber} style={{ color: "#06d6a0" }}>{adStats?.mapViews ?? "—"}</div>
                    <div className={styles.statLabel}>מהמפה</div>
                  </div>
                </div>

                {/* Cities breakdown */}
                {adStats && Object.keys(adStats.cities).length > 0 && (
                  <div className={`glass-panel ${styles.citiesCard}`}>
                    <h3><MapPin size={18} /> מיקום הצופים</h3>
                    <div className={styles.cityList}>
                      {Object.entries(adStats.cities)
                        .sort((a, b) => b[1] - a[1])
                        .map(([city, count]) => (
                          <div key={city} className={styles.cityRow}>
                            <span>{city}</span>
                            <div className={styles.cityBar}>
                              <div
                                className={styles.cityBarFill}
                                style={{ width: `${Math.min(100, (count / adStats.totalViews) * 100)}%` }}
                              />
                            </div>
                            <span className={styles.cityCount}>{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Recent events */}
                {adStats && adStats.recentEvents.length > 0 && (
                  <div className={`glass-panel ${styles.eventsCard}`}>
                    <h3><TrendingUp size={18} /> פעילות אחרונה</h3>
                    <div className={styles.eventList}>
                      {adStats.recentEvents.map((ev, i) => (
                        <div key={i} className={styles.eventRow}>
                          <span className={styles.eventIcon}>
                            {ev.type === "store_view" ? <ShoppingBag size={16} color="#3A86FF" /> : <Map size={16} color="#06d6a0" />}
                          </span>
                          <span className={styles.eventLabel}>
                            {ev.type === "store_view" ? "צפייה בחנות" : "צפייה במפה"}
                            {ev.city ? ` · ${ev.city}` : ""}
                          </span>
                          <span className={styles.eventTime}>
                            {ev.timestamp ? new Date(ev.timestamp.seconds * 1000).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genre insight */}
                {selectedAd.genre && (
                  <div className={`glass-panel ${styles.insightCard}`}>
                    <Music size={20} color="var(--primary)" />
                    <div>
                      <strong>ז'אנר: {selectedAd.genre}</strong>
                      <p>כל מי שצפה במודעה הזו הגיע אחרי שחיפש {selectedAd.genre} בחנות.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
