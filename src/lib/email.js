import { Resend } from "resend";
import { logError } from "@/lib/logger";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail({ to, subject, html, text }) {
  if (!resend) {
    // console.log("[DEV EMAIL]", { to, subject, html: html?.substring(0, 200) });
    return { dev: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "HADAIRE FOOTWEAR <info@hadairefootwear.com>",
      to,
      subject,
      html,
      text: text || subject,
    });

    if (error) throw new Error(error.message);
    return { success: true, id: data.id };
  } catch (err) {
    logError("sendEmail", err, { to, subject });
    throw err;
  }
}
