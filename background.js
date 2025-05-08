// Store XHR requests by tab ID
let requestsByTab = {};
const MAX_REQUESTS = 6;

// Listen for XHR requests
browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    // Only track XHR requests
    if (details.type !== "xmlhttprequest") {
      return;
    }
    
    // Create entry for this tab if it doesn't exist
    if (!requestsByTab[details.tabId]) {
      requestsByTab[details.tabId] = [];
    }
    
    // Extract authorization header if present
    let authHeader = null;
    if (details.requestHeaders) {
      for (const header of details.requestHeaders) {
        if (header.name.toLowerCase() === "authorization") {
          authHeader = header.value;
          break;
        }
      }
    }
    
    // Add request to the beginning of the array for this tab
    requestsByTab[details.tabId].unshift({
      url: details.url,
      method: details.method,
      timestamp: new Date().toISOString(),
      authorization: authHeader
    });
    
    // Keep only the MAX_REQUESTS most recent requests
    if (requestsByTab[details.tabId].length > MAX_REQUESTS) {
      requestsByTab[details.tabId] = requestsByTab[details.tabId].slice(0, MAX_REQUESTS);
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

// Listen for tab removal to clean up memory
browser.tabs.onRemoved.addListener((tabId) => {
  if (requestsByTab[tabId]) {
    delete requestsByTab[tabId];
  }
});

// Respond to messages from the popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getRequests") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const activeTabId = tabs[0].id;
      sendResponse({ requests: requestsByTab[activeTabId] || [] });
    });
    return true; // Required for async sendResponse
  }
});