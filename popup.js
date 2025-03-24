// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // 現在のタブがCYBERXEEDのページかどうかを確認
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const statusElement = document.getElementById('status');
    
    if (currentTab.url.includes('https://cxg9.i-abs.co.jp/CYBERXEED/')) {
      statusElement.textContent = 'CYBERXEEDページを検出しました';
    } else {
      statusElement.textContent = 'CYBERXEEDページではありません';
    }
  });
  
  // 設定ボタンのクリックイベントを設定
  document.getElementById('settingsButton').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
});
