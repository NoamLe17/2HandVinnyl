import { ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container" style={{ paddingTop: '64px', paddingBottom: '64px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>תקנון שימוש</h1>
        <p style={{ color: 'var(--text-muted)' }}>עודכן לאחרונה: 18 ביוני 2026</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.8 }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>1. מבוא</h2>
          <p>
            ברוכים הבאים לאתר "צליל חוזר" (להלן: "האתר"). האתר משמש כפלטפורמת לוח מודעות (Marketplace) המאפשרת לחובבי מוזיקה לפרסם ולמצוא תקליטים וציוד שמע מיד שנייה. השימוש באתר כפוף לתנאים המפורטים בתקנון זה. עצם גלישתך ושימושך באתר מהווה את הסכמתך לכל האמור בו.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>2. העלאת תוכן</h2>
          <p>
            המשתמש מתחייב להעלות תוכן חוקי בלבד, שאינו מפר זכויות יוצרים, אינו פוגעני, אינו מכיל מידע שקרי ואינו מטעה. הנהלת האתר שומרת לעצמה את הזכות להסיר כל מודעה שלדעתה מפרה תנאים אלו, ללא צורך במתן התראה מראש.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>3. היעדר אחריות לסחר</h2>
          <p>
            האתר מספק פלטפורמה טכנולוגית בלבד ליצירת קשר בין מוכרים לקונים. האתר, בעליו ומפעיליו, אינם מהווים צד לעסקאות שמתבצעות בין המשתמשים, אינם סולקים תשלומים ואינם אחראים בשום דרך לטיב המוצרים, תקינותם, זמינותם או להעברת הכספים בין הצדדים.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>4. מיקום גיאוגרפי</h2>
          <p>
            האתר עושה שימוש בשירותי מיקום על מנת לחשב מרחקים. שירות זה מבוסס על הסכמתך לשתף את מיקומך. הנהלת האתר אינה אחראית לדיוק המרחקים המחושבים או לשיבושים בשירות המיפוי של גוגל.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>5. קהילה, פורום ושיח ציבורי</h2>
          <p>
            האתר כולל אזור קהילתי המאפשר למשתמשים רשומים להתייעץ, לפרסם שאלות ולהגיב בצ'אט חי. המשתמש מתחייב לשמור על שפה נאותה, תרבות דיון ומכבוד הדדי. אין להשתמש בקהילה לצורך הפצת דואר זבל (Spam), תוכן פוגעני, קללות או הטרדות. הנהלת האתר מפעילה מערכת מודרציה אוטומטית וידנית לסינון מילים פוגעניות, ושומרת לעצמה את הזכות להשעות או להרחיק משתמשים שיפרו כללים אלו, ולמחוק הודעות לפי שיקול דעתה הבלעדי.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>6. שינוי תנאים</h2>
          <p>
            הנהלת האתר רשאית לשנות את תנאי התקנון מעת לעת. שינויים משמעותיים יפורסמו באתר וייכנסו לתוקף מיד עם פרסומם.
          </p>
        </section>
      </div>
    </div>
  );
}
