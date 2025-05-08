document.addEventListener('DOMContentLoaded', function() {
  const requestsContainer = document.getElementById('requests-container');
  
  // Function to copy text to clipboard
  function copyToClipboard(text) {
    // Create temporary input element
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-1000px';
    tempInput.value = text;
    document.body.appendChild(tempInput);
    
    // Select and copy
    tempInput.select();
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(tempInput);
    
    return true;
  }
  
  // Function to handle copy button click
  function handleCopyClick(event, authValue) {
    event.stopPropagation();
    
    if (authValue && authValue !== 'None') {
      const success = copyToClipboard(authValue);
      
      if (success) {
        // Show feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        // Reset button after 2 seconds
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      }
    }
  }
  
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
        
        // Create HTML content
        requestItem.innerHTML = `
          <div class="request-title">
            <span class="request-method">${request.method}</span>
            <span class="request-time">${formattedTime}</span>
          </div>
          <div class="request-url">${request.url}</div>
          <div class="request-auth">
            <span class="auth-title">Authorization:</span>
            <span class="auth-value">${request.authorization ? request.authorization : '<span class="no-auth">None</span>'}</span>
            ${request.authorization ? '<button class="copy-button">Copy</button>' : ''}
          </div>
        `;
        
        requestsContainer.appendChild(requestItem);
        
        // Add event listener for copy button if there's an authorization header
        if (request.authorization) {
          const copyButton = requestItem.querySelector('.copy-button');
          copyButton.addEventListener('click', (event) => {
            handleCopyClick(event, request.authorization);
          });
        }
      });
    })
    .catch((error) => {
      requestsContainer.innerHTML = `<div class="no-requests">Error: ${error.message}</div>`;
    });
});