import { api } from "./api";

export type PushStatus = "unsupported" | "default" | "denied" | "subscribed" | "not-subscribed";

function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
}

/** Registers the service worker. Safe to call multiple times (e.g. on every app load). */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (err) {
    console.error("Service worker registration failed:", err);
    return null;
  }
}

/** Checks current permission + whether an active push subscription exists on this device. */
export async function getPushStatus(): Promise<PushStatus> {
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") return "default";

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? "subscribed" : "not-subscribed";
}

/**
 * Requests permission (must be called from a user gesture, e.g. a button
 * click) and, if granted, subscribes this device to push and registers the
 * subscription with the backend so the reminder job can reach it.
 */
export async function enablePushNotifications(): Promise<PushStatus> {
  if (!isPushSupported()) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "default";

  const { publicKey, configured } = await api.get<{ publicKey: string | null; configured: boolean }>(
    "/push/vapid-public-key"
  );
  if (!configured || !publicKey) {
    throw new Error(
      "Push notifications aren't configured on the server yet (missing VAPID keys)."
    );
  }

  const registration = await registerServiceWorker();
  if (!registration) throw new Error("Couldn't register the service worker.");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: new Uint8Array(
  urlBase64ToUint8Array(publicKey)
).buffer as ArrayBuffer,
    });
  }

  const json = subscription.toJSON();
  await api.post("/push/subscribe", {
    endpoint: json.endpoint,
    keys: json.keys,
    userAgent: navigator.userAgent.slice(0, 255),
  });

  return "subscribed";
}

export async function disablePushNotifications(): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await api.post("/push/unsubscribe", { endpoint }).catch(() => {});
}
