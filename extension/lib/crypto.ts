export async function generateDeviceKey(): Promise<string> {
  const key = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(key, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signEvent(payload: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const keyData = encoder.encode(key);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateNonce(): string {
  return crypto.randomUUID();
}
