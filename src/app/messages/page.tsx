"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./messages.module.css";
import { Send, ArrowRight, MessageSquare } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get("chatId");

  const [user, setUser] = useState<User | null | "loading">("loading");
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (!u && u !== "loading") router.push("/login");
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (user === "loading" || !user) return;

    const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      chatsList.sort((a: any, b: any) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
      setChats(chatsList);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!activeChatId || user === "loading" || !user) return;

    const q = query(collection(db, "chats", activeChatId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    // Mark as read
    const chatRef = doc(db, "chats", activeChatId);
    getDoc(chatRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.unreadCount && data.unreadCount[user.uid] > 0) {
          updateDoc(chatRef, {
            [`unreadCount.${user.uid}`]: 0
          });
        }
      }
    });

    return () => unsubscribe();
  }, [activeChatId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !user || user === "loading") return;

    const text = newMessage.trim();
    setNewMessage("");

    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const otherParticipantId = activeChat.participants.find((p: string) => p !== user.uid);

    await addDoc(collection(db, "chats", activeChatId, "messages"), {
      senderId: user.uid,
      text,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, "chats", activeChatId), {
      lastMessage: text,
      updatedAt: serverTimestamp(),
      [`unreadCount.${otherParticipantId}`]: (activeChat.unreadCount?.[otherParticipantId] || 0) + 1
    });
  };

  if (user === "loading" || !user) return <div style={{ padding: '100px', textAlign: 'center' }}>טוען...</div>;

  const activeChatDetails = chats.find(c => c.id === activeChatId);

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${activeChatId ? styles.sidebarHidden : ''}`}>
        <div className={styles.sidebarHeader}>
          הודעות ({chats.reduce((sum, c) => sum + (c.unreadCount?.[user.uid] || 0), 0)} חדשות)
        </div>
        <div className={styles.chatList}>
          {chats.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>אין שיחות עדיין</div>
          ) : (
            chats.map(chat => {
              const otherId = chat.participants.find((p: string) => p !== user.uid);
              const otherName = chat.participantNames?.[otherId] || "משתמש";
              const unread = chat.unreadCount?.[user.uid] || 0;

              return (
                <div 
                  key={chat.id} 
                  className={`${styles.chatItem} ${activeChatId === chat.id ? styles.activeChat : ''}`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className={styles.chatAvatar}>
                    {chat.adImage ? <img src={chat.adImage} alt="" /> : otherName.charAt(0)}
                  </div>
                  <div className={styles.chatInfo}>
                    <div className={styles.chatName}>{otherName}</div>
                    <div className={styles.adTitle}>{chat.adTitle}</div>
                    <div className={styles.lastMessage}>{chat.lastMessage || "תחילת שיחה"}</div>
                  </div>
                  {unread > 0 && <div className={styles.unreadBadge}>{unread}</div>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className={`${styles.mainArea} ${!activeChatId ? styles.mainAreaHidden : ''}`}>
        {activeChatId && activeChatDetails ? (
          <>
            <div className={styles.chatHeader}>
              <button className={styles.backBtn} onClick={() => { setActiveChatId(null); router.push('/messages'); }}>
                <ArrowRight size={24} />
              </button>
              <div className={styles.chatAvatar} style={{ width: 40, height: 40 }}>
                {activeChatDetails.adImage ? <img src={activeChatDetails.adImage} alt="" /> : (activeChatDetails.participantNames?.[activeChatDetails.participants.find((p: string) => p !== user.uid)]?.charAt(0) || "מ")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{activeChatDetails.participantNames?.[activeChatDetails.participants.find((p: string) => p !== user.uid)] || "משתמש"}</div>
                <Link href={`/store/${activeChatDetails.adId}`} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
                  {activeChatDetails.adTitle}
                </Link>
              </div>
            </div>

            <div className={styles.messageList}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>אין הודעות עדיין. שלח הודעה כדי להתחיל!</div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === user.uid;
                  return (
                    <div key={msg.id} className={`${styles.message} ${isMe ? styles.myMessage : styles.otherMessage}`}>
                      <div>{msg.text}</div>
                      <div className={styles.messageTime}>
                        {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="הקלד הודעה..." 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" className={styles.sendBtn} disabled={!newMessage.trim()}>
                <Send size={20} style={{ marginLeft: '-4px' }} />
              </button>
            </form>
          </>
        ) : (
          <div className={styles.emptyState}>
            <MessageSquare size={64} opacity={0.2} />
            <p>בחר שיחה מהרשימה כדי להתחיל לדבר</p>
          </div>
        )}
      </div>
    </div>
  );
}
