const API_BASE = "https://hyped.today";

export async function sendEvent(
  event: {
    userId: string;
    platform: string;
    action: string;
    postUrl: string;
    metadata?: Record<string, unknown>;
    nonce?: string;
  },
  token: string
): Promise<boolean> {
  const { deviceId } = await chrome.storage.local.get("deviceId");

  const response = await fetch(`${API_BASE}/api/verification/extension-event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      user_id: event.userId,
      platform: event.platform,
      action: event.action,
      post_url: event.postUrl,
      payload: { ...event.metadata, deviceId },
      nonce: event.nonce,
      device_fingerprint: deviceId,
    }),
  });

  return response.ok;
}
