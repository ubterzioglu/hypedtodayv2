async function init() {
  const { apiToken = "", totalSynced = 0, pendingEvents = [] } =
    await chrome.storage.local.get(["apiToken", "totalSynced", "pendingEvents"]);

  const content = document.getElementById("content")!;

  if (apiToken) {
    content.innerHTML = `
      <div class="status">
        <div class="dot green"></div>
        <span>Connected</span>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${totalSynced}</div>
          <div class="stat-label">Events Synced</div>
        </div>
        <div class="stat">
          <div class="stat-value">${pendingEvents.length}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
      <div class="pending">${pendingEvents.length} events waiting to sync</div>
      <button id="disconnect">Disconnect</button>
    `;

    document.getElementById("disconnect")?.addEventListener("click", async () => {
      await chrome.storage.local.remove("apiToken");
      init();
    });
  } else {
    content.innerHTML = `
      <div class="status">
        <div class="dot yellow"></div>
        <span>Not Connected</span>
      </div>
      <input type="text" id="tokenInput" placeholder="Enter your API token" />
      <button id="connect">Link Account</button>
      <div class="pending">Get your token from hyped.today settings</div>
    `;

    document.getElementById("connect")?.addEventListener("click", async () => {
      const token = (document.getElementById("tokenInput") as HTMLInputElement).value.trim();
      if (token) {
        await chrome.storage.local.set({ apiToken: token });
        init();
      }
    });
  }
}

init();
