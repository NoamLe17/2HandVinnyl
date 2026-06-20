"use client";

import { useState } from "react";
import styles from "./login.module.css";
import { Disc, Mail, Lock, User, ArrowRight } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request') {
        setError("חלון ההתחברות נסגר. אנא נסה שוב וודא שחוסם חלונות קופצים (Pop-up Blocker) לא מופעל.");
      } else {
        setError(err.message);
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Here you would also save the name to Firestore user profile
      }
      // Handle successful login
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <ArrowRight size={20} />
        חזרה לעמוד הראשי
      </Link>
      
      <div className={`glass-panel ${styles.authCard}`}>
        <div className={styles.header}>
          <Disc size={48} color="var(--primary)" className={styles.icon} />
          <h1>{isLogin ? "התחברות" : "יצירת חשבון"}</h1>
          <p>הצטרפו לקהילת חובבי המוזיקה של ישראל</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <button className={styles.googleBtn} onClick={handleGoogleLogin}>
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          המשך עם Google
        </button>

        <div className={styles.divider}>
          <span>או באמצעות דוא"ל</span>
        </div>

        <form onSubmit={handleEmailAuth} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <User size={20} className={styles.inputIcon} />
              <input 
                type="text" 
                placeholder="שם מלא" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <Mail size={20} className={styles.inputIcon} />
            <input 
              type="email" 
              placeholder="כתובת דוא״ל" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock size={20} className={styles.inputIcon} />
            <input 
              type="password" 
              placeholder="סיסמה" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            {isLogin ? "התחברות" : "הרשמה"}
          </button>
        </form>

        <p className={styles.toggleText}>
          {isLogin ? "עדיין אין לך חשבון?" : "כבר יש לך חשבון?"}
          <button className={styles.toggleBtn} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "צור חשבון חדש" : "התחבר כאן"}
          </button>
        </p>
      </div>
    </div>
  );
}
