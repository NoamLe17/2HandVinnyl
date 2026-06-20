import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container" style={{ paddingTop: '64px', paddingBottom: '64px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Shield size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>מדיניות פרטיות</h1>
        <p style={{ color: 'var(--text-muted)' }}>עודכן לאחרונה: 18 ביוני 2026</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.8 }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>1. איסוף מידע</h2>
          <p>
            בעת הרשמה למערכת באמצעות חשבון Google או דוא"ל, אנו אוספים ושומרים את שמך וכתובת הדוא"ל שלך במערכת המאובטחת של Firebase. מידע זה משמש ליצירת החשבון בלבד ולזיהוי מול משתמשים אחרים.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>2. שימוש במיקום (Geolocation)</h2>
          <p>
            אנו משתמשים במיקום הגיאוגרפי שלך אך ורק אם אישרת זאת בדפדפן. המיקום אינו נשמר במסד הנתונים שלנו ומשמש אך ורק לחישובים מקומיים (בתוך הדפדפן שלך) כדי להראות לך מודעות קרובות אליך על המפה.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>3. הגנה על המידע</h2>
          <p>
            אנו נוקטים באמצעי אבטחה מקובלים באמצעות תשתיות Firebase של Google כדי להגן על פרטיך. עם זאת, אין אנו יכולים להבטיח חסינות מוחלטת מפני פריצות וגישה לא מורשית למסדי הנתונים.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>4. עוגיות (Cookies)</h2>
          <p>
            האתר עושה שימוש בקבצי "עוגיות" (Cookies) לצורך תפעולו השוטף, כולל כדי לאמת נתוני התחברות (Auth) ולמנוע את הצורך בהזנת סיסמה מחדש בכל כניסה.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>5. מידע פומבי בקהילה ובפורומים</h2>
          <p>
            במסגרת השימוש באזור הקהילה והצ'אט החי, כל תוכן, טקסט או מידע שתבחר לפרסם שם יהיה גלוי לעיני כלל המשתמשים והמבקרים באתר. אנו ממליצים בחום שלא לפרסם מידע אישי רגיש (כגון מספרי טלפון, כתובות מדויקות או פרטי אשראי) במרחבים הפומביים הללו. הנהלת האתר אינה נושאת באחריות לשימוש שייעשה על ידי צדדים שלישיים במידע שבחרת לשתף מרצונך החופשי בפורום.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '16px' }}>6. יצירת קשר לבירור והסרה</h2>
          <p>
            תוכל לפנות אלינו בכל עת באמצעות טופס "צור קשר" הנמצא בתחתית העמוד בבקשה למחוק את חשבונך וכל המידע המשויך אליו ממערכותינו, ובקשתך תטופל בהקדם האפשרי.
          </p>
        </section>
      </div>
    </div>
  );
}
