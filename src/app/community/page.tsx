"use client";

import { useState, useEffect, useRef } from "react";
import { Disc, Music, Speaker, ShieldAlert, Send, BookOpen, Wrench, Headphones } from "lucide-react";
import styles from "./page.module.css";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import Link from "next/link";

const BAD_WORDS = ["זבל", "חרא", "מפגר", "אידיוט", "זונה", "כוסאמק", "זין", "מטומטם", "דפוק"];

// Price Database
const PRICES: Record<string, Record<string, string>> = {
  record: {
    used: "₪30 - ₪80",
    new: "₪120 - ₪200",
    rare: "₪250 - ₪600+"
  },
  turntable: {
    entry: "₪500 - ₪1,500",
    pro: "₪2,500 - ₪10,000+",
    vintage: "₪1,000 - ₪4,000"
  },
  equipment: {
    amp: "₪800 - ₪3,000",
    speakers: "₪1,000 - ₪4,000",
    needle: "₪150 - ₪800"
  }
};

export default function CommunityPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatError, setChatError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [category, setCategory] = useState("record");
  const [level, setLevel] = useState("used");
  const [estimatedPrice, setEstimatedPrice] = useState(PRICES.record.used);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Real-time listener for forum messages
    const q = query(collection(db, "forum_messages"), orderBy("createdAt", "asc"), limit(50));
    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeChat();
    };
  }, []);

  // Update estimated price when filter changes
  useEffect(() => {
    if (PRICES[category] && PRICES[category][level]) {
      setEstimatedPrice(PRICES[category][level]);
    } else {
      // Handle mismatched category/level gracefully
      const firstKey = Object.keys(PRICES[category])[0];
      setLevel(firstKey);
      setEstimatedPrice(PRICES[category][firstKey]);
    }
  }, [category, level]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setChatError("");
    
    if (!newMessage.trim() || !user) return;

    // Moderation System
    const textToCheck = newMessage.toLowerCase();
    const hasBadWord = BAD_WORDS.some(word => textToCheck.includes(word));
    
    if (hasBadWord) {
      setChatError("ההודעה נחסמה. המערכת שומרת על שפה מכבדת ונקייה בקהילה.");
      return;
    }

    try {
      await addDoc(collection(db, "forum_messages"), {
        text: newMessage,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "משתמש אנונימי",
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setChatError("שגיאה בשליחת ההודעה.");
    }
  };

  const getLevelOptions = () => {
    if (category === "record") return [
      { val: "used", label: "תקליט משומש רגיל" },
      { val: "new", label: "תקליט חדש (סגור)" },
      { val: "rare", label: "נדיר / אספנות" }
    ];
    if (category === "turntable") return [
      { val: "entry", label: "פטיפון כניסה (מתחילים)" },
      { val: "pro", label: "מקצועי / אודיופיל" },
      { val: "vintage", label: "וינטג' מחודש" }
    ];
    if (category === "equipment") return [
      { val: "amp", label: "מגבר / רסיבר" },
      { val: "speakers", label: "רמקולים פסיביים" },
      { val: "needle", label: "ראש / מחט לפטיפון" }
    ];
    return [];
  };

  return (
    <div className={styles.communityContainer}>
      <div className={styles.hero}>
        <h1 className={styles.title}>קהילת צליל חוזר</h1>
        <p className={styles.subtitle}>
          ברוכים הבאים לטרקלין התקליטים! כאן מתייעצים, קוראים מדריכים ומשוחחים עם חובבי מוזיקה אחרים.
        </p>
      </div>

      {/* Live Forum / Chat */}
      <h2 className={styles.sectionTitle}><Speaker color="var(--primary)" /> פורום הקהילה (Live Chat)</h2>
      <div className={styles.chatContainer} style={{ marginBottom: '60px' }}>
        <div className={styles.chatMessages}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>
              אין עדיין הודעות. היו הראשונים לכתוב!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id || index} className={styles.message}>
                <div className={styles.messageAvatar}>
                  {msg.userName ? msg.userName.charAt(0).toUpperCase() : '?'}
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageAuthor}>{msg.userName}</span>
                  </div>
                  <div className={styles.messageText}>{msg.text}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {user ? (
          <form onSubmit={handleSendMessage} className={styles.chatInputArea}>
            <div className={styles.inputWrapper}>
              <textarea
                className={styles.chatInput}
                placeholder="שתפו, שאלו, והתייעצו עם הקהילה..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button 
                type="submit" 
                className={styles.chatSubmit}
                disabled={!newMessage.trim()}
              >
                <Send size={18} />
                שליחה
              </button>
            </div>
            {chatError && (
              <div className={styles.errorMsg}>
                <ShieldAlert size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                {chatError}
              </div>
            )}
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <p>רק משתמשים מחוברים יכולים לכתוב בפורום. צפייה חופשית לכולם.</p>
            <Link href="/login" className="btn-secondary" style={{ marginTop: '10px', display: 'inline-block' }}>
              התחבר כדי לכתוב
            </Link>
          </div>
        )}
      </div>

      {/* Guides Section */}
      <h2 className={styles.sectionTitle}><BookOpen color="var(--primary)" /> מדריכים וטיפים</h2>
      <div className={styles.guidesGrid}>
        <div className={styles.guideCard}>
          <div className={styles.guideIcon}><Disc size={30} /></div>
          <h3 className={styles.guideTitle}>איך לבחור ולשמור על תקליטים</h3>
          <div className={styles.guideContent}>
            <ul>
              <li>תמיד להחזיק מהשוליים או מהלייבל האמצעי.</li>
              <li>לאחסן תקליטים בעמידה (אנכית) ולא בשכיבה.</li>
              <li>להשתמש במברשת אנטי-סטטית לפני כל ניגון.</li>
              <li>תקליטי יד-2: חפשו שריטות עמוקות המורגשות במגע.</li>
            </ul>
          </div>
        </div>

        <div className={styles.guideCard}>
          <div className={styles.guideIcon}><Music size={30} /></div>
          <h3 className={styles.guideTitle}>איך לבחור פטיפון ראשון</h3>
          <div className={styles.guideContent}>
            <ul>
              <li>הימנעו מפטיפונים בסגנון "מזוודה" - הם עלולים להרוס תקליטים.</li>
              <li>ודאו שיש משקולת איזון לזרוע (Counterweight).</li>
              <li>בדקו אם הפטיפון דורש קדם-מגבר (Phono Preamp) או שהוא מובנה.</li>
            </ul>
          </div>
        </div>

        <div className={styles.guideCard}>
          <div className={styles.guideIcon}><Wrench size={30} /></div>
          <h3 className={styles.guideTitle}>שימוש נכון ותחזוקה</h3>
          <div className={styles.guideContent}>
            <ul>
              <li>וודאו שהפטיפון יושב על משטח ישר ומאוזן לחלוטין.</li>
              <li>יש להחליף מחט כל 500-1000 שעות נגינה.</li>
              <li>הרחיקו את הרמקולים מהפטיפון כדי למנוע רעידות ופידבק.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Scale / Price Filter */}
      <h2 className={styles.sectionTitle}><Headphones color="var(--primary)" /> סקאלת מחירים (מחירון חכם)</h2>
      <div className={styles.scaleContainer}>
        <div className={styles.filterControls}>
          <select 
            className={styles.filterSelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="record">תקליטים</option>
            <option value="turntable">פטיפונים</option>
            <option value="equipment">ציוד משלים</option>
          </select>

          <select 
            className={styles.filterSelect}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {getLevelOptions().map(opt => (
              <option key={opt.val} value={opt.val}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.priceResult}>
          <div style={{ color: 'var(--text-secondary)' }}>הערכת שווי מקובלת (יד שניה / חדש):</div>
          <div className={styles.priceValue}>{estimatedPrice}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '10px' }}>
            * המחירים הם הערכה גסה המבוססת על ממוצע השוק ויכולים להשתנות.
          </div>
        </div>
      </div>
    </div>
  );
}
