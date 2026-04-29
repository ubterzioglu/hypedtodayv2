import { generateDeviceId } from "../lib/storage";

chrome.runtime.onInstalled.addListener(() => {
  generateDeviceId();
  chrome.alarms.create("syncEvents", { periodInMinutes: 1 });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "ACTION_DETECTED") {
    handleActionDetected(message.payload);
    sendResponse({ received: true });
  }
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncEvents") {
    syncPendingEvents();
  }
});

async function handleActionDetected(payload: {
  action: string;
  postUrl: string;
  platform: string;
  metadata?: Record<string, unknown>;
}) {
  const event = {
    ...payload,
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
  };

  const { pendingEvents = [] } = await chrome.storage.local.get("pendingEvents");
  pendingEvents.push(event);
  await chrome.storage.local.set({ pendingEvents });

  syncPendingEvents();
}

async function syncPendingEvents() {
  const { pendingEvents = [], apiToken = "" } = await chrome.storage.local.get([
    "pendingEvents",
    "apiToken",
  ]);

  if (pendingEvents.length === 0) return;

  const { deviceId } = await chrome.storage.local.get("deviceId");

  const results = await Promise.allSettled(
    pendingEvents.map((event: Record<string, unknown>) =>
      fetch(`${getApiUrl()}/api/verification/extension-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        },
        body: JSON.stringify({
          user_id: event.userId || "",
          platform: event.platform || "linkedin",
          action: event.action,
          post_url: event.postUrl,
          payload: { ...event.metadata, deviceId, timestamp: event.timestamp },
          nonce: event.nonce,
          device_fingerprint: deviceId,
        }),
      })
    )
  );

  const failedIndices: number[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.ok) {
    } else {
      failedIndices.push(index);
    }
  });

  const remaining = failedIndices.map((i) => pendingEvents[i]);
  await chrome.storage.local.set({ pendingEvents: remaining });

  const synced = pendingEvents.length - remaining.length;
  if (synced > 0) {
    const { totalSynced = 0 } = await chrome.storage.local.get("totalSynced");
    await chrome.storage.local.set({ totalSynced: totalSynced + synced });
  }
}

function getApiUrl(): string {
  return "https://hyped.today";
}
