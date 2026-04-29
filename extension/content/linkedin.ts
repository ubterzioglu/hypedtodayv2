const ACTION_MAP: Record<string, string> = {
  "react-button__trigger": "like",
  "comment": "comment",
  "share": "repost",
  "follow": "follow",
  "connect": "connection_request",
};

function init() {
  observeDOM();
}

function observeDOM() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          attachListeners(node);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  attachListeners(document.body);
}

function attachListeners(root: HTMLElement) {
  root.querySelectorAll("button, [role='button']").forEach((button) => {
    if ((button as HTMLElement).dataset.hypedListener) return;
    (button as HTMLElement).dataset.hypedListener = "true";

    button.addEventListener("click", () => {
      const action = detectAction(button as HTMLElement);
      if (action) {
        reportAction(action);
      }
    });
  });
}

function detectAction(element: HTMLElement): string | null {
  const classes = element.className || "";
  const ariaLabel = element.getAttribute("aria-label") || "";
  const text = element.textContent?.toLowerCase() || "";

  if (classes.includes("react-button") || ariaLabel.toLowerCase().includes("like") || text.includes("like")) {
    return "like";
  }
  if (ariaLabel.toLowerCase().includes("comment") || text.includes("comment")) {
    return "comment";
  }
  if (ariaLabel.toLowerCase().includes("repost") || ariaLabel.toLowerCase().includes("share") || text.includes("repost")) {
    return "repost";
  }
  if (ariaLabel.toLowerCase().includes("follow") || text.includes("follow")) {
    return "follow";
  }
  if (ariaLabel.toLowerCase().includes("connect") || text.includes("connect")) {
    return "connection_request";
  }

  return null;
}

function reportAction(action: string) {
  const postUrl = getPostUrl();
  if (!postUrl) return;

  chrome.runtime.sendMessage({
    type: "ACTION_DETECTED",
    payload: {
      action,
      postUrl,
      platform: "linkedin",
      metadata: {
        pageTitle: document.title,
        url: window.location.href,
      },
    },
  });
}

function getPostUrl(): string | null {
  const postLink = document.querySelector('a[href*="/posts/"], a[href*="/activity/"]');
  if (postLink) {
    return (postLink as HTMLAnchorElement).href;
  }
  return window.location.href;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
