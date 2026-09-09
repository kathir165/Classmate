import webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

export const pushConfigured = Boolean(publicKey && privateKey);

if (pushConfigured) {
  webpush.setVapidDetails(subject, publicKey!, privateKey!);
} else {
  console.warn(
    "[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — push notifications are disabled. " +
      "Run `npm run generate-vapid-keys` and add the output to backend/.env."
  );
}

export interface WebPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

/**
 * Sends a push notification to a single subscription. Returns false (and
 * logs) instead of throwing, so one dead subscription never breaks a batch
 * send to other devices. Callers should remove the subscription from the DB
 * when this returns `{ expired: true }`.
 */
export async function sendPush(
  subscription: WebPushSubscription,
  payload: PushPayload
): Promise<{ success: boolean; expired?: boolean }> {
  if (!pushConfigured) return { success: false };
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (err: any) {
    // 404/410 = the browser subscription no longer exists — clean it up.
    const expired = err?.statusCode === 404 || err?.statusCode === 410;
    if (!expired) {
      console.error("[push] send failed:", err?.statusCode, err?.body || err?.message);
    }
    return { success: false, expired };
  }
}

export function getVapidPublicKey(): string | null {
  return publicKey || null;
}
