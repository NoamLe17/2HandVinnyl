"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, ShoppingBag, Info, Users, MessageCircle } from "lucide-react";
import styles from "@/app/layout.module.css";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Navigation() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<{ title: string, body: string, chatId: string } | null>(null);
  const lastUpdateRef = useRef<Record<string, number>>({});

  useEffect(() => {
    let unsubscribeChats: any = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
        unsubscribeChats = onSnapshot(q, (snapshot) => {
          let newToast: any = null;

          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            const unread = data.unreadCount?.[user.uid] || 0;
            
            // Check if this is a new message
            const currentUpdatedTime = data.updatedAt?.toMillis() || 0;
            const previousUpdatedTime = lastUpdateRef.current[change.doc.id] || 0;
            
            if (change.type === "modified" && unread > 0 && currentUpdatedTime > previousUpdatedTime) {
              const otherParticipantId = data.participants.find((p: string) => p !== user.uid);
              const senderName = data.participantNames?.[otherParticipantId] || "משתמש";
              newToast = {
                title: `הודעה חדשה מ-${senderName}`,
                body: data.lastMessage,
                chatId: change.doc.id
              };
            }
            lastUpdateRef.current[change.doc.id] = currentUpdatedTime;
          });
          
          if (newToast && !window.location.href.includes(`/messages`)) {
            setToastMessage(newToast);
            setTimeout(() => setToastMessage(null), 6000);
          }
          
          let currentTotal = 0;
          snapshot.docs.forEach(doc => {
            currentTotal += (doc.data().unreadCount?.[user.uid] || 0);
          });
          setUnreadCount(currentTotal);
        });
      } else {
        if (unsubscribeChats) unsubscribeChats();
        setUnreadCount(0);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeChats) unsubscribeChats();
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <nav className={styles.nav}>
      <Link href="/store" className={`${styles.navLink} ${isActive('/store') ? styles.activeLink : ''}`}>
        <ShoppingBag size={20} />
        <span>חנות</span>
      </Link>
      <Link href="/map" className={`${styles.navLink} ${isActive('/map') ? styles.activeLink : ''}`}>
        <Map size={20} />
        <span>מפה</span>
      </Link>
      <Link href="/messages" className={`${styles.navLink} ${isActive('/messages') ? styles.activeLink : ''}`} style={{ position: "relative" }}>
        <MessageCircle size={20} />
        <span>הודעות</span>
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: "0", right: "8px", background: "#F72585", color: "white", fontSize: "0.6rem", fontWeight: "bold", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
      <Link href="/community" className={`${styles.navLink} ${isActive('/community') ? styles.activeLink : ''}`}>
        <Users size={20} />
        <span>קהילה</span>
      </Link>
      <Link href="/about" className={`${styles.navLink} ${isActive('/about') ? styles.activeLink : ''}`}>
        <Info size={20} />
        <span>אודות</span>
      </Link>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", left: "24px", background: "white", color: "#111", padding: "16px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", zIndex: 9999, minWidth: "250px", borderRight: "4px solid var(--primary)", animation: "slideIn 0.3s ease" }}>
          <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem" }}>{toastMessage.title}</h4>
          <p style={{ margin: "0 0 12px", fontSize: "0.85rem", color: "#666" }}>{toastMessage.body}</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href={`/messages?chatId=${toastMessage.chatId}`} onClick={() => setToastMessage(null)} style={{ background: "var(--primary)", color: "white", padding: "6px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
              השב עכשיו
            </Link>
            <button onClick={() => setToastMessage(null)} style={{ background: "transparent", border: "1px solid #ccc", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>סגור</button>
          </div>
        </div>
      )}
    </nav>
  );
}
