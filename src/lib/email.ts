import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailResult {
  success: boolean;
  skipped?: boolean;
  id?: string;
}

export async function sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
  if (!resend) return { success: true, skipped: true };

  try {
    const { data } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "SaaSKit <noreply@resend.dev>",
      to,
      subject: "Welcome to SaaSKit!",
      html: `<div style="font-family: 'Bricolage Grotesque', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f5f0eb;">
        <h1 style="font-size: 28px; font-weight: 800; color: #0a0a0a; margin-bottom: 16px;">Welcome aboard, ${name || "there"}!</h1>
        <p style="font-size: 16px; color: #0a0a0a; line-height: 1.6;">Your account is ready. Start building with SaaSKit.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #ff6b2c; color: #000; font-weight: 700; text-decoration: none; border: 2px solid #000; border-radius: 9999px;">Go to Dashboard</a>
      </div>`,
    });
    return { success: true, id: data?.id };
  } catch {
    console.error("[email] Failed to send welcome email");
    return { success: false };
  }
}

export async function sendPaymentConfirmation(
  to: string,
  productName: string,
  amount: number,
): Promise<EmailResult> {
  if (!resend) return { success: true, skipped: true };

  const formattedAmount = (amount / 100).toFixed(2);

  try {
    const { data } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "SaaSKit <noreply@resend.dev>",
      to,
      subject: `Payment confirmed — ${productName}`,
      html: `<div style="font-family: 'Bricolage Grotesque', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f5f0eb;">
        <h1 style="font-size: 28px; font-weight: 800; color: #0a0a0a; margin-bottom: 16px;">Payment Confirmed</h1>
        <p style="font-size: 16px; color: #0a0a0a; line-height: 1.6;">Thank you for subscribing to <strong>${productName}</strong>.</p>
        <div style="margin: 20px 0; padding: 16px; background: #fff; border: 2px solid #000; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">Amount paid</p>
          <p style="margin: 4px 0 0; font-size: 24px; font-weight: 800; color: #0a0a0a;">$${formattedAmount}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #ff6b2c; color: #000; font-weight: 700; text-decoration: none; border: 2px solid #000; border-radius: 9999px;">View Dashboard</a>
      </div>`,
    });
    return { success: true, id: data?.id };
  } catch {
    console.error("[email] Failed to send payment confirmation");
    return { success: false };
  }
}
