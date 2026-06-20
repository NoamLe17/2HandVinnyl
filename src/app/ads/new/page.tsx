"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./new.module.css";
import { Plus, Trash2, UploadCloud, UserPlus, AlertCircle, X, ImageIcon } from "lucide-react";
import { db, auth, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { useLoadScript, Libraries, Autocomplete } from "@react-google-maps/api";

const libraries: Libraries = ["places"];

export default function CreateAdPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | "loading">("loading");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [items, setItems] = useState([
    { id: 1, title: "", type: "תקליט", price: "", isNegotiable: false, genre: "", condition: "", images: [] as File[], imageUrls: [] as string[], uploadProgress: 0 }
  ]);

  // Address autocomplete state
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressSelected, setAddressSelected] = useState(false);

  // Guest fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // We will use the Autocomplete component from @react-google-maps/api instead of manual useEffect

  const addItem = () => {
    setItems([...items, { id: Date.now(), title: "", type: "תקליט", price: "", isNegotiable: false, genre: "", condition: "", images: [], imageUrls: [], uploadProgress: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleImageSelect = (itemId: number, files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5); // max 5
    const previews = newFiles.map(f => URL.createObjectURL(f));
    updateItem(itemId, "images", newFiles);
    updateItem(itemId, "imageUrls", previews);
  };

  const removeImage = (itemId: number, idx: number) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item;
      const newImages = [...item.images];
      const newUrls = [...item.imageUrls];
      newImages.splice(idx, 1);
      newUrls.splice(idx, 1);
      return { ...item, images: newImages, imageUrls: newUrls };
    }));
  };

  const uploadImages = async (itemId: number, files: File[], adId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(storage, `ads/${adId}/${Date.now()}_${file.name}`);
      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file);
        task.on("state_changed",
          (snap) => {
            const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
            setItems(prev => prev.map(it => it.id === itemId ? { ...it, uploadProgress: progress } : it));
          },
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            urls.push(url);
            resolve();
          }
        );
      });
    }
    return urls;
  };

  const handleSubmit = async () => {
    setError("");

    if (!addressSelected || !locationCoords) {
      setError("נא לבחור כתובת מתוך הרשימה המוצעת. כתובות שאינן מוכרות על ידי גוגל לא יתקבלו.");
      return;
    }
    for (const item of items) {
      if (!item.title || !item.price || !item.condition) {
        setError("נא למלא את כל שדות החובה עבור כל הפריטים (כותרת, מחיר ומצב).");
        return;
      }
    }

    const isGuest = !user || user === "loading";
    if (isGuest) {
      if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
        setError("כאורח, נא למלא שם מלא, מייל וטלפון ליצירת קשר.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const adsRef = collection(db, "ads");
      for (const item of items) {
        // First create the ad to get its ID
        const docRef = await addDoc(adsRef, {
          title: item.title,
          type: item.type,
          price: Number(item.price),
          isNegotiable: item.isNegotiable,
          genre: item.genre,
          condition: item.condition,
          locationName: location,
          lat: locationCoords.lat,
          lng: locationCoords.lng,
          sellerId: isGuest ? "guest" : (user as User).uid,
          sellerName: isGuest ? guestName : ((user as User).displayName || (user as User).email?.split("@")[0] || "מוכר"),
          sellerEmail: isGuest ? guestEmail : (user as User).email,
          sellerPhone: isGuest ? guestPhone : null,
          isGuestAd: isGuest,
          images: [],
          createdAt: serverTimestamp(),
          viewCount: 0,
        });

        // Upload images and update the doc
        if (item.images.length > 0) {
          const uploadedUrls = await uploadImages(item.id, item.images, docRef.id);
          const { updateDoc, doc } = await import("firebase/firestore");
          await updateDoc(doc(db, "ads", docRef.id), { images: uploadedUrls });
        }
      }

      router.push("/store");
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user === "loading") return <div style={{ padding: "40px", textAlign: "center" }}>טוען...</div>;

  const isGuest = !user;

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>פרסום מודעה חדשה</h1>
        <p className={styles.subtitle}>הוסיפו פריט אחד או מספר פריטים למכירה</p>
      </div>

      {/* Guest signup banner */}
      {isGuest && (
        <div style={{
          background: "linear-gradient(135deg, rgba(123,44,191,0.15), rgba(58,134,255,0.1))",
          border: "1px solid rgba(123,44,191,0.3)",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap"
        }}>
          <UserPlus size={32} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "1.05rem" }}>💡 כדאי ליצור חשבון!</p>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
              חשבון מאפשר לך לעקוב אחרי המודעה שלך בזמן אמת, לראות כמה אנשים נכנסו, כמה חיפשו את הז'אנר שלך, ועוד נתונים מפורטים.
            </p>
          </div>
          <Link href="/login" className="btn-primary" style={{ whiteSpace: "nowrap" }}>
            <UserPlus size={18} /> יצירת חשבון
          </Link>
        </div>
      )}

      <div className={styles.formLayout}>
        <div className={`glass-panel ${styles.mainForm}`}>
          {error && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center", padding: "16px", background: "rgba(198,40,40,0.1)", border: "1px solid rgba(198,40,40,0.3)", color: "#c62828", borderRadius: "10px", marginBottom: "24px" }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {/* Guest contact fields */}
          {isGuest && (
            <div style={{ background: "rgba(123,44,191,0.05)", borderRadius: "12px", padding: "20px", marginBottom: "24px", border: "1px solid rgba(123,44,191,0.15)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700 }}>פרטי יצירת קשר</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label>שם מלא *</label>
                  <input type="text" placeholder="ישראל ישראלי" value={guestName} onChange={e => setGuestName(e.target.value)} />
                </div>
                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label>אימייל *</label>
                  <input type="email" placeholder="israel@mail.com" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
                </div>
                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label>טלפון *</label>
                  <input type="tel" placeholder="050-0000000" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Address with Autocomplete */}
          <div className={styles.formGroup}>
            <label>מיקום איסוף {!addressSelected && location && <span style={{ color: "#c62828", fontSize: "0.8rem" }}> – יש לבחור מהרשימה</span>}</label>
            {isLoaded ? (
              <Autocomplete
                onLoad={(ac) => { autocompleteRef.current = ac; }}
                onPlaceChanged={() => {
                  if (autocompleteRef.current) {
                    const place = autocompleteRef.current.getPlace();
                    if (place && place.geometry?.location) {
                      setLocation(place.formatted_address || place.name || "");
                      setLocationCoords({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                      });
                      setAddressSelected(true);
                    }
                  }
                }}
                options={{ componentRestrictions: { country: "il" }, fields: ["formatted_address", "geometry", "name"] }}
              >
                <input
                  type="text"
                  placeholder="התחל להקליד כתובת או עיר..."
                  value={location}
                  onChange={e => {
                    setLocation(e.target.value);
                    setAddressSelected(false);
                    setLocationCoords(null);
                  }}
                  style={{ borderColor: location && !addressSelected ? "#c62828" : undefined, width: "100%" }}
                />
              </Autocomplete>
            ) : (
              <input type="text" placeholder="טוען מערכת כתובות..." disabled style={{ width: "100%" }} />
            )}
            {addressSelected && locationCoords && (
              <p style={{ fontSize: "0.8rem", color: "#06d6a0", marginTop: "4px" }}>✓ כתובת אומתה בהצלחה</p>
            )}
          </div>

          <h2 className={styles.itemsTitle}>הפריטים שלי ({items.length})</h2>

          {items.map((item, index) => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <h3>פריט #{index + 1}</h3>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(item.id)} className={styles.removeBtn}>
                    <Trash2 size={18} /> הסר
                  </button>
                )}
              </div>

              <div className={styles.itemGrid}>
                <div className={styles.formGroup}>
                  <label>סוג פריט</label>
                  <select value={item.type} onChange={(e) => updateItem(item.id, "type", e.target.value)}>
                    <option value="תקליט">תקליט</option>
                    <option value="פטיפון">פטיפון</option>
                    <option value="רמקולים">רמקולים</option>
                    <option value="מגבר">מגבר</option>
                    <option value="אחר">אחר</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>כותרת / שם הפריט</label>
                  <input type="text" placeholder="למשל: תקליט Abbey Road מקורי" value={item.title} onChange={(e) => updateItem(item.id, "title", e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>מחיר (₪)</label>
                  <input type="number" placeholder="0" value={item.price} onChange={(e) => updateItem(item.id, "price", e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>מצב</label>
                  <select value={item.condition} onChange={(e) => updateItem(item.id, "condition", e.target.value)}>
                    <option value="">בחר מצב...</option>
                    <option value="חדש באריזה">חדש באריזה</option>
                    <option value="כמו חדש (NM)">כמו חדש (NM)</option>
                    <option value="טוב מאוד (VG+)">טוב מאוד (VG+)</option>
                    <option value="טוב (VG)">טוב (VG)</option>
                    <option value="סביר (G)">סביר (G)</option>
                  </select>
                </div>
                {item.type === "תקליט" && (
                  <div className={styles.formGroup}>
                    <label>ז'אנר</label>
                    <input type="text" placeholder="למשל: רוק קלאסי, ג'אז" value={item.genre} onChange={(e) => updateItem(item.id, "genre", e.target.value)} />
                  </div>
                )}
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={item.isNegotiable} onChange={(e) => updateItem(item.id, "isNegotiable", e.target.checked)} />
                  <span>גמיש במחיר</span>
                </label>
              </div>

              {/* Image upload */}
              <div className={styles.imageUpload}>
                <label style={{ display: "block", fontWeight: 500, color: "var(--text-muted)", marginBottom: "12px" }}>
                  תמונות (עד 5)
                </label>

                {/* Preview grid */}
                {item.imageUrls.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {item.imageUrls.map((url, idx) => (
                      <div key={idx} style={{ position: "relative", width: "90px", height: "90px" }}>
                        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                        <button
                          type="button"
                          onClick={() => removeImage(item.id, idx)}
                          style={{ position: "absolute", top: "-6px", left: "-6px", background: "#c62828", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload progress */}
                {isSubmitting && item.uploadProgress > 0 && item.uploadProgress < 100 && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ height: "6px", background: "rgba(123,44,191,0.2)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${item.uploadProgress}%`, background: "var(--primary)", transition: "width 0.3s", borderRadius: "3px" }} />
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>מעלה תמונות... {Math.round(item.uploadProgress)}%</p>
                  </div>
                )}

                <label className={styles.uploadBox} style={{ cursor: "pointer" }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={e => handleImageSelect(item.id, e.target.files)}
                  />
                  <ImageIcon size={28} color="var(--primary)" />
                  <p style={{ margin: 0 }}>לחץ לבחירת תמונות</p>
                  <span className={styles.uploadHint}>JPG, PNG, WEBP – עד 5MB לתמונה</span>
                </label>
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem} className={`btn-secondary ${styles.addBtn}`}>
            <Plus size={20} /> הוסף פריט נוסף
          </button>
        </div>

        <div className={`glass-panel ${styles.summaryPanel}`}>
          <h2>סיכום פרסום</h2>
          <div className={styles.summaryItem}><span>כמות פריטים:</span><strong>{items.length}</strong></div>
          <div className={styles.summaryItem}><span>מיקום:</span><strong>{location || "לא הוזן"}</strong></div>
          {isGuest && <div className={styles.summaryItem}><span>פרסום כ:</span><strong>אורח</strong></div>}
          <div className={styles.summaryItem}>
            <span>תמונות:</span>
            <strong>{items.reduce((sum, i) => sum + i.images.length, 0)}</strong>
          </div>
          <button className={`btn-primary ${styles.submitBtn}`} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "שומר ומעלה..." : "פרסם"}
          </button>
          <p className={styles.termsText}>בלחיצה על פרסום, אני מאשר/ת את תקנון האתר.</p>
        </div>
      </div>
    </div>
  );
}
