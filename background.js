// background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // CYBERXEEDのログインページが読み込まれたときに自動ログイン処理を実行
  if (changeInfo.status === 'complete' && tab.url.includes('https://cxg9.i-abs.co.jp/CYBERXEED/')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
  }
});
