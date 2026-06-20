"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px', textAlign: 'center', minHeight: '60vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '500px', margin: '0 auto' }}>
        <MessageSquare size={64} color="var(--primary)" />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>תיבת ההודעות</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.6 }}>
          מערכת ההודעות הפנימית נמצאת עדיין בשלבי פיתוח (Under Construction). בקרוב תוכלו לשלוח ולקבל הודעות משאר חברי הקהילה של צליל חוזר!
        </p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
          <ArrowRight size={20} /> חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
