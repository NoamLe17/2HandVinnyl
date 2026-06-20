"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, orderBy, deleteDoc, doc, where } from "firebase/firestore";
import styles from "./admin.module.css";
import { Users, ShoppingBag, Map as MapIcon, ArrowRight, ShieldAlert, MessageSquare, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ads" | "users" | "messages">("ads");
  
  const [ads, setAds] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAds: 0,
    activeLocations: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.email === "noamhemo2001@gmail.com") {
          setUser(currentUser);
          await fetchAdminData();
        } else {
          setLoading(false); // Not master
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      // Fetch Ads
      const qAds = query(collection(db, "ads"), orderBy("createdAt", "desc"));
      const snapshotAds = await getDocs(qAds);
      const adsData = snapshotAds.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(adsData);
      
      // Calculate sellers
      const sellersMap = new Map();
      adsData.forEach(ad => {
        if (!sellersMap.has(ad.sellerId)) {
          sellersMap.set(ad.sellerId, {
            sellerId: ad.sellerId,
            sellerName: ad.sellerName,
            sellerEmail: ad.sellerEmail,
            adCount: 1
          });
        } else {
          sellersMap.get(ad.sellerId).adCount += 1;
        }
      });
      setSellers(Array.from(sellersMap.values()));

      // Calculate stats
      const uniqueLocations = new Set(adsData.map(ad => ad.locationName));
      setStats({
        totalUsers: sellersMap.size > 0 ? sellersMap.size : 1,
        totalAds: adsData.length,
        activeLocations: uniqueLocations.size
      });

      // Fetch Messages
      const qMsgs = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
      const snapshotMsgs = await getDocs(qMsgs);
      const msgsData = snapshotMsgs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgsData);
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק מודעה זו? פעולה זו אינה הפיכה.")) {
      try {
        await deleteDoc(doc(db, "ads", adId));
        setAds(ads.filter(ad => ad.id !== adId));
        setStats(prev => ({ ...prev, totalAds: prev.totalAds - 1 }));
      } catch (error) {
        alert("שגיאה במחיקת המודעה");
      }
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    if (confirm("מחיקת מוכר תמחק את כל המודעות שלו מהמסד. החשבון עצמו יישאר רשום במערכת ותוכל למחוק אותו רק מה-Firebase Console. להמשיך?")) {
      try {
        // Find all ads by seller
        const sellerAds = ads.filter(ad => ad.sellerId === sellerId);
        
        // Delete all their ads
        const deletePromises = sellerAds.map(ad => deleteDoc(doc(db, "ads", ad.id)));
        await Promise.all(deletePromises);
        
        // Update UI
        setAds(ads.filter(ad => ad.sellerId !== sellerId));
        setSellers(sellers.filter(s => s.sellerId !== sellerId));
        setStats(prev => ({ 
          ...prev, 
          totalAds: prev.totalAds - sellerAds.length,
          totalUsers: prev.totalUsers - 1
        }));
        
        alert("כל המודעות של המשתמש נמחקו בהצלחה.");
      } catch (error) {
        console.error("Error deleting seller ads:", error);
        alert("שגיאה במחיקת מודעות המשתמש.");
      }
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (confirm("למחק הודעה זו?")) {
      try {
        await deleteDoc(doc(db, "contact_messages", msgId));
        setMessages(messages.filter(m => m.id !== msgId));
      } catch (error) {
        alert("שגיאה במחיקת ההודעה");
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>טוען מערכת ניהול...</p>
      </div>
    );
  }

  if (!user || user.email !== "noamhemo2001@gmail.com") {
    return (
      <div className={`container ${styles.forbidden}`}>
        <ShieldAlert size={64} color="var(--secondary)" />
        <h2>גישה נדחתה</h2>
        <p>אין לך הרשאות לצפות בעמוד זה. עמוד זה מיועד למנהל המערכת בלבד.</p>
        <button onClick={() => router.push("/")} className="btn-primary">חזור לעמוד הראשי</button>
      </div>
    );
  }

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>פאנל ניהול - צליל חוזר</h1>
        <p className={styles.subtitle}>ברוך הבא נועם. כאן תוכל לראות נתונים ולנהל את האתר.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(123, 44, 191, 0.1)' }}>
            <Users size={28} color="var(--primary)" />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>מוכרים פעילים</p>
            <h3 className={styles.statValue}>{stats.totalUsers}</h3>
          </div>
        </div>

        <div className={`glass-panel ${styles.statCard}`}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(255, 0, 110, 0.1)' }}>
            <ShoppingBag size={28} color="var(--secondary)" />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>מודעות סה״כ</p>
            <h3 className={styles.statValue}>{stats.totalAds}</h3>
          </div>
        </div>

        <div className={`glass-panel ${styles.statCard}`}>
          <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(58, 134, 255, 0.1)' }}>
            <MapIcon size={28} color="#3a86ff" />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>אזורים פעילים</p>
            <h3 className={styles.statValue}>{stats.activeLocations}</h3>
          </div>
        </div>
      </div>

      <div className={`glass-panel ${styles.tablePanel}`}>
        <div className={styles.tabsContainer} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '24px', paddingBottom: '16px' }}>
          <button 
            onClick={() => setActiveTab("ads")}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'ads' ? 700 : 500, color: activeTab === 'ads' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', backgroundColor: activeTab === 'ads' ? 'rgba(123,44,191,0.1)' : 'transparent' }}
          >
            <ShoppingBag size={20} /> ניהול מודעות
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'users' ? 700 : 500, color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', backgroundColor: activeTab === 'users' ? 'rgba(123,44,191,0.1)' : 'transparent' }}
          >
            <Users size={20} /> ניהול משתמשים
          </button>
          <button 
            onClick={() => setActiveTab("messages")}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'messages' ? 700 : 500, color: activeTab === 'messages' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', backgroundColor: activeTab === 'messages' ? 'rgba(123,44,191,0.1)' : 'transparent' }}
          >
            <MessageSquare size={20} /> הודעות נכנסות ({messages.length})
          </button>
        </div>

        <div className={styles.tableResponsive}>
          {activeTab === "ads" && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>מזהה מודעה</th>
                  <th>כותרת</th>
                  <th>סוג</th>
                  <th>מחיר</th>
                  <th>אימייל מוכר</th>
                  <th>תאריך העלאה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {ads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>אין מודעות במערכת.</td>
                  </tr>
                ) : (
                  ads.map(ad => (
                    <tr key={ad.id}>
                      <td className={styles.adId}>#{ad.id.slice(0, 8)}</td>
                      <td>{ad.title}</td>
                      <td>{ad.type}</td>
                      <td>₪{ad.price}</td>
                      <td>{ad.sellerEmail}</td>
                      <td>{ad.createdAt ? new Date(ad.createdAt.seconds * 1000).toLocaleDateString("he-IL") : "לא ידוע"}</td>
                      <td>
                        <button className={styles.actionBtn} onClick={() => router.push(`/store/${ad.id}`)}>צפה</button>
                        <button className={styles.deleteBtn} onClick={() => handleDeleteAd(ad.id)}>מחק</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "users" && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>מזהה משתמש</th>
                  <th>שם מלא</th>
                  <th>דואר אלקטרוני</th>
                  <th>כמות מודעות פעילות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {sellers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>אין מוכרים פעילים במערכת.</td>
                  </tr>
                ) : (
                  sellers.map(seller => (
                    <tr key={seller.sellerId}>
                      <td className={styles.adId}>#{seller.sellerId.slice(0, 8)}</td>
                      <td>{seller.sellerName}</td>
                      <td>{seller.sellerEmail}</td>
                      <td>{seller.adCount} מודעות</td>
                      <td>
                        <button className={styles.deleteBtn} onClick={() => handleDeleteSeller(seller.sellerId)}>
                          <Trash2 size={16} style={{ marginLeft: '4px' }}/> מחק מודעות משתמש
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "messages" && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>שם השולח</th>
                  <th>דואר אלקטרוני</th>
                  <th>תוכן ההודעה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>אין הודעות חדשות.</td>
                  </tr>
                ) : (
                  messages.map(msg => (
                    <tr key={msg.id}>
                      <td>{msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString("he-IL") : "לא ידוע"}</td>
                      <td>{msg.name}</td>
                      <td>{msg.email}</td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{msg.message}</td>
                      <td>
                        <a href={`mailto:${msg.email}?subject=תשובה מצליל חוזר`} className={styles.actionBtn} style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '8px' }}>השב במייל</a>
                        <button className={styles.deleteBtn} onClick={() => handleDeleteMessage(msg.id)}>מחק</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
