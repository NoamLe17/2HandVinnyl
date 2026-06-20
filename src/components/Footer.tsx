"use client";

import { useState } from "react";
import Link from "next/link";
import { Disc, Mail, MessageCircle, FileText, Shield, X, Send } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Footer() {
  const [showContact, setShowContact] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save to Firestore
      await addDoc(collection(db, "contact_messages"), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        createdAt: serverTimestamp(),
        status: "new"
      });

      // Trigger Mailto for admin
      const subject = encodeURIComponent(`פנייה חדשה מצליל חוזר: ${formData.name}`);
      const body = encodeURIComponent(`שם: ${formData.name}\nאימייל: ${formData.email}\n\nהודעה:\n${formData.message}`);
      window.location.href = `mailto:noamhemo2001@gmail.com?subject=${subject}&body=${body}`;

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowContact(false);
        setFormData({ name: "", email: "", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("אירעה שגיאה בשליחת ההודעה, אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <footer style={{ background: '#0a0a0a', color: '#fff', padding: '64px 0 24px 0', marginTop: '64px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', textDecoration: 'none', marginBottom: '16px' }}>
              <Disc size={32} color="var(--primary)" />
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>צליל חוזר</span>
            </Link>
            <p style={{ color: '#aaa', lineHeight: 1.6, marginBottom: '24px' }}>
              הפלטפורמה המובילה לקנייה ומכירה של תקליטים וציוד פטיפונים יד שנייה בישראל. הבית של חובבי המוזיקה.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#fff' }}>קישורים מהירים</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link href="/store" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }}>החנות שלנו</Link></li>
              <li><Link href="/map" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }}>חיפוש במפה</Link></li>
              <li><Link href="/about" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s' }}>אודותינו</Link></li>
              <li><button onClick={() => setShowFaq(true)} style={{ background: 'none', border: 'none', color: '#aaa', padding: 0, cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}>שאלות נפוצות</button></li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#fff' }}>מידע משפטי ויצירת קשר</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <Link href="/terms" style={{ color: '#aaa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} /> תקנון שימוש
                </Link>
              </li>
              <li>
                <Link href="/privacy" style={{ color: '#aaa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} /> מדיניות פרטיות
                </Link>
              </li>
              <li>
                <button onClick={() => setShowContact(true)} style={{ background: 'none', border: 'none', color: '#aaa', padding: 0, cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} /> צור קשר
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="container" style={{ borderTop: '1px solid #333', paddingTop: '24px', textAlign: 'center', color: '#777', fontSize: '0.9rem' }}>
          <p>© {new Date().getFullYear()} צליל חוזר. כל הזכויות שמורות.</p>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContact && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ background: 'var(--surface)', width: '100%', maxWidth: '500px', position: 'relative', padding: '32px' }}>
            <button onClick={() => setShowContact(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <MessageCircle size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>צור קשר</h2>
              <p style={{ color: 'var(--text-muted)' }}>נשמח לשמוע מכם! מלאו את הפרטים ונחזור אליכם בהקדם.</p>
            </div>

            {submitSuccess ? (
              <div style={{ background: 'rgba(52, 168, 83, 0.1)', color: '#34A853', padding: '24px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                הודעתך נשלחה בהצלחה! תודה שפנית אלינו.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" placeholder="שם מלא" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
                <input type="email" placeholder="כתובת דוא״ל" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
                <textarea placeholder="תוכן הפנייה..." value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required rows={4} style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', resize: 'vertical' }}></textarea>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {isSubmitting ? "שולח..." : <><Send size={18} /> שלח הודעה</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaq && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ background: 'var(--surface)', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative', padding: '32px' }}>
            <button onClick={() => setShowFaq(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '2rem', marginBottom: '24px', textAlign: 'center' }}>שאלות נפוצות</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--primary)' }}>האם השירות כרוך בתשלום?</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>לא, השימוש בפלטפורמה, כולל פרסום מודעות ופנייה למוכרים, ניתן כרגע בחינם לחלוטין לחברי הקהילה.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--primary)' }}>איך המערכת מחשבת את המרחקים?</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>המערכת משתמשת בקואורדינטות המיקום שלכם (אם אישרתם גישה לדפדפן) ומשווה אותן לקואורדינטות של כתובת המודעה לחישוב מדויק בקילומטרים (בקו אווירי).</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--primary)' }}>האם הקנייה מאובטחת?</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>אנחנו לא מהווים צד בסליקת הכספים כרגע. כל התקשורת והתשלום נעשים ישירות מול המוכר. מומלץ תמיד להיפגש במקום ציבורי ולבדוק את המוצר לפני התשלום.</p>
              </div>
            </div>
            
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowFaq(false)}>הבנתי, תודה</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
