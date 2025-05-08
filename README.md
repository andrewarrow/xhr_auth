# auth

![screenshot](https://i.imgur.com/sHlf2HY.png)

# install

```
Open Firefox and type about:debugging in the address bar
Click on "This Firefox" in the left sidebar
Click "Load Temporary Add-on..."
Navigate to your extension folder and select the manifest.json file
```

# use

```
Look for the extension icon in the Firefox toolbar (upper-right corner of your browser window). It should appear as one of the icons next to your address bar.
If you don't see it immediately, it might be hidden in the extensions menu. Look for the puzzle piece icon (📋) in the toolbar and click it to see all installed extensions.
Click on the "XHR Monitor" icon in your toolbar to open the popup.
The popup will show "No XHR requests detected in this tab" until you navigate to a page that makes XHR requests.
To test it, you could visit a website that makes API calls (like Gmail, Twitter, or many modern web applications), interact with the page to trigger some requests, and then click the extension icon again.

If the extension icon isn't visible at all after installation:

Go back to about:debugging > "This Firefox" > "Temporary Extensions"
Check that your extension is listed and enabled
You might need to restart Firefox after installation
If the extension still doesn't appear, there might be an issue with the manifest file
```
