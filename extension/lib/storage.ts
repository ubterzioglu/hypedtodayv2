export async function generateDeviceId(): Promise<string> {
  const existing = await chrome.storage.local.get("deviceId");
  if (existing.deviceId) return existing.deviceId;

  const id = crypto.randomUUID();
  await chrome.storage.local.set({ deviceId: id });
  return id;
}

export async function getDeviceId(): Promise<string> {
  const { deviceId } = await chrome.storage.local.get("deviceId");
  return deviceId || (await generateDeviceId());
}

export async function getToken(): Promise<string | null> {
  const { apiToken } = await chrome.storage.local.get("apiToken");
  return apiToken || null;
}

export async function setToken(token: string): Promise<void> {
  await chrome.storage.local.set({ apiToken: token });
}

export async function getPendingEvents(): Promise<Record<string, unknown>[]> {
  const { pendingEvents = [] } = await chrome.storage.local.get("pendingEvents");
  return pendingEvents as Record<string, unknown>[];
}

export async function addPendingEvent(event: Record<string, unknown>): Promise<void> {
  const events = await getPendingEvents();
  events.push(event);
  await chrome.storage.local.set({ pendingEvents: events });
}

export async function clearPendingEvents(): Promise<void> {
  await chrome.storage.local.set({ pendingEvents: [] });
}

export async function getSyncedCount(): Promise<number> {
  const { totalSynced = 0 } = await chrome.storage.local.get("totalSynced");
  return totalSynced as number;
}

export async function incrementSyncedCount(count: number): Promise<void> {
  const current = await getSyncedCount();
  await chrome.storage.local.set({ totalSynced: current + count });
}
