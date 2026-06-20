"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./details.module.css";
import { Disc, MapPin, ShieldCheck, Heart, Share2, MessageCircle, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function AdDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [adDetails, setAdDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const fetchAndTrack = async () => {
      if (!params.id) return;
      try {
        const docRef = doc(db, "ads", params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setAdDetails(data);

          // Track store view event
          let city = "";
          try {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(async (pos) => {
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.coords.latitude},${pos.coords.longitude}&result_type=locality&key=${apiKey}`);
                const d = await r.json();
                city = d.results?.[0]?.address_components?.[0]?.long_name || "";
                await addDoc(collection(db, "ads", docSnap.id, "events"), {
                  type: "store_view",
                  timestamp: serverTimestamp(),
                  city,
                  genreSearched: (data as any).genre || "",
                });
              }, async () => {
                await addDoc(collection(db, "ads", docSnap.id, "events"), {
                  type: "store_view",
                  timestamp: serverTimestamp(),
                  city: "",
                  genreSearched: (data as any).genre || "",
                });
              });
            }
          } catch { /* silent */ }
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndTrack();
  }, [params.id]);

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>טוען נתונים...</div>;
  }

  if (!adDetails) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>המודעה לא נמצאה או שהוסרה.</div>;
  }

  // Show real images only – no fake Unsplash placeholders
  const images: string[] = adDetails.images?.filter((u: string) => u) || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.navigation}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowRight size={20} />
          חזרה
        </button>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainCol}>
          <div className={`glass-panel ${styles.gallery}`}>
            {hasImages ? (
              <>
                <div
                  className={styles.mainImage}
                  style={{ backgroundImage: `url(${images[currentImageIdx]})` }}
                >
                  {images.length > 1 && (
                    <>
                      <button className={styles.galleryNavBtn} onClick={prevImage}><ChevronRight size={24}/></button>
                      <button className={styles.galleryNavBtn} onClick={nextImage}><ChevronLeft size={24}/></button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className={styles.thumbnails}>
                    {images.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className={`${styles.thumbnail} ${idx === currentImageIdx ? styles.activeThumb : ''}`}
                        style={{ backgroundImage: `url(${img})` }}
                        onClick={() => setCurrentImageIdx(idx)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ height: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "linear-gradient(135deg, rgba(123,44,191,0.08), rgba(58,134,255,0.05))", borderRadius: "12px" }}>
                <Disc size={64} color="var(--primary)" opacity={0.25} />
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>אין תמונות למודעה זו</p>
              </div>
            )}
          </div>

          <div className={`glass-panel ${styles.detailsPanel}`}>
            <div className={styles.header}>
              <div className={styles.titleArea}>
                <div className={styles.badge}>{adDetails.type}</div>
                <h1 className={styles.title}>{adDetails.title}</h1>
              </div>
              <div className={styles.priceArea}>
                <span className={styles.price}>₪{adDetails.price}</span>
                {adDetails.isNegotiable && <span className={styles.negotiable}>גמיש במחיר</span>}
              </div>
            </div>

            <div className={styles.specs}>
              <div className={styles.specItem}>
                <MapPin size={20} color="var(--primary)" />
                <span>{adDetails.locationName}</span>
              </div>
              <div className={styles.specItem}>
                <ShieldCheck size={20} color="var(--primary)" />
                <span>קנייה מאובטחת</span>
              </div>
            </div>

            <div className={styles.specGrid}>
              <div className={styles.specBox}>
                <span className={styles.specLabel}>מצב הפריט</span>
                <span className={styles.specValue}>{adDetails.condition}</span>
              </div>
              {adDetails.genre && (
                <div className={styles.specBox}>
                  <span className={styles.specLabel}>ז'אנר</span>
                  <span className={styles.specValue}>{adDetails.genre}</span>
                </div>
              )}
            </div>

            <div className={styles.description}>
              <h3>תיאור הפריט</h3>
              <p>{adDetails.description || "לא סופק תיאור על ידי המוכר."}</p>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={`glass-panel ${styles.sellerCard}`}>
            <h3>פרטי המוכר</h3>
            <div className={styles.sellerInfo}>
              <div className={styles.sellerAvatar}>{adDetails.sellerName?.charAt(0) || "מ"}</div>
              <div>
                <strong>{adDetails.sellerName}</strong>
                <p>פורסם בתאריך: {adDetails.createdAt ? new Date(adDetails.createdAt.seconds * 1000).toLocaleDateString("he-IL") : "לא ידוע"}</p>
              </div>
            </div>
            
            <Link href={`/store?seller=${adDetails.sellerId}`} className={styles.sellerLink}>
              צפה בכל המודעות של {adDetails.sellerName}
            </Link>

            <div className={styles.actions}>
              <Link href="/messages" className={`btn-primary ${styles.actionBtn}`}>
                <MessageCircle size={20} /> שלח הודעה למוכר
              </Link>
              <div className={styles.secondaryActions}>
                <button className={`btn-secondary ${styles.iconBtn}`}><Heart size={20} /></button>
                <button className={`btn-secondary ${styles.iconBtn}`}><Share2 size={20} /></button>
              </div>
            </div>
            
            <div className={styles.safetyTip}>
              <strong>טיפ בטיחות:</strong>
              <p>לעולם אל תעבירו כסף מראש ללא קבלת המוצר או שימוש בשירות משלוחים מאובטח.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
