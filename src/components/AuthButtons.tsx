"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Settings, BarChart2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

export default function AuthButtons() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div style={{ width: "80px" }}></div>; // placeholder while checking auth
  }

  if (user) {
    return (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href="/my-ads" className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px' }}>
          <BarChart2 size={18} />
          המודעות שלי
        </Link>
        {user.email === "noamhemo2001@gmail.com" && (
          <Link href="/admin" className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
            <Settings size={18} />
            ניהול
          </Link>
        )}
        <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px' }}>
          <LogOut size={18} />
          התנתק
        </button>
      </div>
    );
  }
  return (
    <Link href="/login" className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px' }}>
      <User size={18} />
      התחבר
    </Link>
  );
}
