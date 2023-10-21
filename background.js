chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "textSelection_menu",
    title: "Save selected text",
    contexts: ["selection"]
  });
});

// Open the popup in a new tab when the user clicks on the extension icon
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "index.html" });
});

// Open the IndexedDB database
const openRequest = indexedDB.open('saveTextDb_text-saver', 1);

// Create or upgrade the database structure
openRequest.onupgradeneeded = function(event) {
  const db = event.target.result;

  // Create an object store with an auto-incrementing key
  const objectStore = db.createObjectStore('selectedTexts', { autoIncrement: true });
  objectStore.createIndex('url', 'url', { unique: false });
  objectStore.createIndex('title', 'title', { unique: false });
};

// Event handler when the database is successfully opened
openRequest.onsuccess = function(event) {
  const db = event.target.result;

  // Function to save selected text to IndexedDB
  function saveSelectedText(selectedText, url, title) {
    const transaction = db.transaction('selectedTexts', 'readwrite');
    const objectStore = transaction.objectStore('selectedTexts');

    const data = {
      selectedText: selectedText,
      url: url,
      title: title,
    };

    const request = objectStore.add(data);

    request.onsuccess = function() {
      console.log('Selected text saved:', selectedText);
    };

    request.onerror = function(event) {
      console.error('Error saving selected text:', event.target.error);
    };
  }

  // Event listener for the context menu item click
  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'textSelection_menu') {
      const selectedText = info.selectionText;
      const url = tab.url;
      const title = tab.title;
      saveSelectedText(selectedText, url, title);
    }
  });
};
