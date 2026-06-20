"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Send to the admin (Noam)
const ADMIN_EMAIL = "noamhemo2001@gmail.com";
// Send from standard resend email
const FROM_EMAIL = "onboarding@resend.dev";

export async function sendContactEmail(name: string, email: string, message: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Tzlil Chozer Contact <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: `הודעה חדשה מצליל חוזר: ${name}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>התקבלה פנייה חדשה באתר צליל חוזר!</h2>
          <p><strong>שם:</strong> ${name}</p>
          <p><strong>אימייל:</strong> ${email}</p>
          <hr />
          <p><strong>הודעה:</strong></p>
          <p>${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send contact email:", err);
    return { success: false, error: err.message };
  }
}

export async function sendNewAdEmail(adTitle: string, price: string, sellerName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Tzlil Chozer System <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: `הועלתה מודעה חדשה: ${adTitle}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>מישהו העלה תקליט/ציוד חדש למכירה!</h2>
          <p><strong>שם המוכר:</strong> ${sellerName}</p>
          <p><strong>כותרת המודעה:</strong> ${adTitle}</p>
          <p><strong>מחיר:</strong> ₪${price}</p>
          <p>היכנס לאתר כדי לראות את המודעה החדשה.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send new ad email:", err);
    return { success: false, error: err.message };
  }
}
