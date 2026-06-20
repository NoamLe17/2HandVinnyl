import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Disc, Map, ShoppingBag, Info, Users } from "lucide-react";
import styles from "./layout.module.css";
import AuthButtons from "@/components/AuthButtons";
import Footer from "@/components/Footer";

const heebo = Heebo({ subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: "צליל חוזר - קהילת התקליטים של ישראל",
  description: "הפלטפורמה המובילה לקנייה ומכירה של תקליטים וציוד פטיפונים יד שנייה. הצטרפו לקהילת האודיופילים הגדולה בישראל.",
  keywords: ["תקליטים", "פטיפונים", "יד שנייה", "ויניל", "מוזיקה", "קהילת מוזיקה", "audio", "vinyl"],
  openGraph: {
    title: "צליל חוזר - קהילת התקליטים של ישראל",
    description: "הפלטפורמה המובילה לקנייה ומכירה של תקליטים וציוד פטיפונים יד שנייה.",
    url: "https://tzlil-chozer.vercel.app", // User can change this to custom domain later
    siteName: "צליל חוזר",
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "צליל חוזר - קהילת התקליטים של ישראל",
    description: "בואו לקחת חלק בקהילת התקליטים והפטיפונים של ישראל.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={heebo.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header className={styles.header}>
          <div className={`container ${styles.headerContent}`}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div className={styles.logo}>
                <Disc size={28} color="var(--primary)" />
                <span>צליל חוזר</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '-4px', marginRight: '38px', letterSpacing: '0.5px' }}>
                בואו לקחת חלק בקהילה
              </div>
            </Link>
            <nav className={styles.nav}>
              <Link href="/store" className={styles.navLink}>
                <ShoppingBag size={20} />
                <span>חנות</span>
              </Link>
              <Link href="/map" className={styles.navLink}>
                <Map size={20} />
                <span>מפה</span>
              </Link>
              <Link href="/community" className={styles.navLink}>
                <Users size={20} />
                <span>קהילה</span>
              </Link>
              <Link href="/about" className={styles.navLink}>
                <Info size={20} />
                <span>אודות</span>
              </Link>
            </nav>
            <div className={styles.actions}>
              <AuthButtons />
            </div>
          </div>
        </header>
        <main className={styles.main} style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
