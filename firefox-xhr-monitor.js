// manifest.json
{
  "manifest_version": 2,
  "name": "XHR Monitor",
  "version": "1.0",
  "description": "Monitors and displays the 6 most recent XHR requests with their Authorization headers",
  "permissions": [
    "webRequest",
    "webRequestBlocking",
    "<all_urls>",
    "activeTab",
    "tabs"
  ],
  "browser_action": {
    "default_icon": {
      "48": "icons/icon-48.png"
    },
    "default_title": "XHR Monitor",
    "default_popup": "popup/popup.html"
  },
  "background": {
    "scripts": ["background.js"]
  },
  "icons": {
    "48": "icons/icon-48.png",
    "96": "icons/icon-96.png"
  }
}

// background.js
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

// popup/popup.html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h2>Recent XHR Requests</h2>
    <div id="requests-container">
      <div class="loading">Loading...</div>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>

// popup/popup.css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  width: 500px;
  margin: 0;
  padding: 0;
}

.container {
  padding: 16px;
}

h2 {
  color: #333;
  margin-top: 0;
  margin-bottom: 16px;
}

.request-item {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.request-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}

.request-method {
  color: #0d6efd;
  font-weight: bold;
}

.request-url {
  font-size: 12px;
  word-break: break-all;
  margin-bottom: 8px;
}

.request-auth {
  font-size: 12px;
  background-color: #e9ecef;
  padding: 6px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: nowrap;
}

.auth-title {
  font-weight: bold;
  color: #198754;
  margin-right: 8px;
}

.no-auth {
  color: #dc3545;
  font-style: italic;
}

.no-requests {
  text-align: center;
  color: #6c757d;
  padding: 24px 0;
}

.loading {
  text-align: center;
  color: #6c757d;
  padding: 24px 0;
}

// popup/popup.js
document.addEventListener('DOMContentLoaded', function() {
  const requestsContainer = document.getElementById('requests-container');
  
  // Get requests from background script
  browser.runtime.sendMessage({ action: "getRequests" })
    .then((response) => {
      requestsContainer.innerHTML = ''; // Clear loading
      
      if (!response.requests || response.requests.length === 0) {
        requestsContainer.innerHTML = '<div class="no-requests">No XHR requests detected in this tab.</div>';
        return;
      }
      
      // Display requests
      response.requests.forEach((request, index) => {
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';
        
        // Format timestamp to local time
        const formattedTime = new Date(request.timestamp).toLocaleTimeString();
        
        requestItem.innerHTML = `
          <div class="request-title">
            <span class="request-method">${request.method}</span>
            <span class="request-time">${formattedTime}</span>
          </div>
          <div class="request-url">${request.url}</div>
          <div class="request-auth">
            <span class="auth-title">Authorization:</span>
            ${request.authorization ? request.authorization : '<span class="no-auth">None</span>'}
          </div>
        `;
        
        requestsContainer.appendChild(requestItem);
      });
    })
    .catch((error) => {
      requestsContainer.innerHTML = `<div class="no-requests">Error: ${error.message}</div>`;
    });
});

// Create these folders: 
// /icons/icon-48.png
// /icons/icon-96.png
// These are just placeholders, you'll need to create actual icons.
