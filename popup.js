// popup.js
// ポップアップ画面のスクリプト（設定機能統合版）

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', function() {
  // 要素の取得
  const statusElement = document.getElementById('status');
  const settingsButton = document.getElementById('settingsButton');
  const loginInfoElement = document.getElementById('loginInfo');
  
  // 設定ボタンのクリックイベント
  settingsButton.addEventListener('click', function() {
    // 設定画面を直接開く（chrome.runtime.openOptionsPage()の代わりにwindow.openを使用）
    window.open(chrome.runtime.getURL('options.html'), '_blank');
  });
  
  // 保存されたログイン情報を取得して表示
  chrome.storage.sync.get(['cyberxeedLogin', 'cyberxeedUrl'], function(data) {
    if (chrome.runtime.lastError) {
      console.error('設定の取得に失敗しました:', chrome.runtime.lastError);
      statusElement.textContent = '設定の取得に失敗しました。';
      statusElement.className = 'error';
      return;
    }
    
    // ログイン情報が保存されているかどうかを確認
    if (data.cyberxeedLogin) {
      // ログイン情報が保存されている場合
      loginInfoElement.textContent = 'ログイン情報が保存されています。';
      statusElement.textContent = '自動ログイン機能は有効です。';
      statusElement.className = 'success';
    } else {
      // ログイン情報が保存されていない場合
      loginInfoElement.textContent = 'ログイン情報が保存されていません。';
      statusElement.textContent = '設定画面でログイン情報を設定してください。';
      statusElement.className = 'warning';
    }
  });
});
