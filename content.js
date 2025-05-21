// content.js
// CYBERXEEDシステムへの自動ログイン機能（簡素化版）

// バックグラウンドに直接復号化を依頼する関数
async function decryptViaBackground(encryptedText) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ 
      action: 'decryptData', 
      data: encryptedText 
    }, function(response) {
      if (chrome.runtime.lastError || !response || !response.success) {
        console.error('バックグラウンドでの復号化に失敗しました:', chrome.runtime.lastError || (response ? response.error : '不明なエラー'));
        resolve('');
      } else {
        resolve(response.result);
      }
    });
  });
}

// ページが完全に読み込まれたら実行
window.addEventListener('load', async function() {
  console.log('CYBERXEED自動ログイン: コンテンツスクリプトが実行されました');
  
  // 設定を取得してURLを確認
  chrome.storage.sync.get(['cyberxeedLogin', 'cyberxeedUrl'], async function(data) {
    // 設定からURLを取得
    const cyberxeedUrl = data.cyberxeedUrl || 'https://cxg9.i-abs.co.jp/CYBERXEED/';
    
    // URLがCYBERXEEDのログインページかどうかを確認
    if (window.location.href.includes(cyberxeedUrl)) {
      console.log('CYBERXEED自動ログイン: ログインページを検出しました');
      
      if (data.cyberxeedLogin) {
        try {
          // ログイン情報が保存されている場合
          const loginInfo = data.cyberxeedLogin;
          console.log('CYBERXEED自動ログイン: 保存されたログイン情報を取得しました');
          
          // 暗号化されているかどうかを確認
          if (loginInfo.isEncrypted) {
            // バックグラウンドに直接復号化を依頼
            const companyCode = await decryptViaBackground(loginInfo.companyCode);
            const employeeCode = await decryptViaBackground(loginInfo.employeeCode);
            const password = await decryptViaBackground(loginInfo.password);
            
            // 復号化結果の検証
            if (!companyCode || !employeeCode || !password) {
              console.error('CYBERXEED自動ログイン: ログイン情報の復号化に失敗しました');
              return;
            }
            
            // ログインフォームが表示されるまで少し待機
            setTimeout(function() {
              performAutoLogin(companyCode, employeeCode, password);
            }, 1000);
          } else {
            // 暗号化されていない古いデータの場合はそのまま使用
            setTimeout(function() {
              performAutoLogin(loginInfo.companyCode, loginInfo.employeeCode, loginInfo.password);
            }, 1000);
          }
        } catch (error) {
          console.error('CYBERXEED自動ログイン: ログイン情報の復号化に失敗しました', error);
        }
      } else {
        // ログイン情報が保存されていない場合
        console.log('CYBERXEED自動ログイン: 保存されたログイン情報がありません。設定画面で設定してください。');
      }
    }
  });
});

// 自動ログイン処理を実行する関数
function performAutoLogin(companyCode, employeeCode, password) {
  try {
    console.log('CYBERXEED自動ログイン: ログイン処理を開始します');
    
    // 会社コード入力欄を取得して入力
    const companyCodeInput = document.querySelector('input[placeholder="Company Code / 会社コード"]');
    if (companyCodeInput) {
      // 値を設定
      companyCodeInput.value = companyCode;
      
      // 入力イベントを発火させる
      triggerInputEvents(companyCodeInput);
      
      console.log('CYBERXEED自動ログイン: 会社コードを入力しました');
    } else {
      console.error('CYBERXEED自動ログイン: 会社コード入力欄が見つかりません');
    }
    
    // 従業員コード入力欄を取得して入力
    const employeeCodeInput = document.querySelector('input[placeholder="Employee Code / 個人コード"]');
    if (employeeCodeInput) {
      // 値を設定
      employeeCodeInput.value = employeeCode;
      
      // 入力イベントを発火させる
      triggerInputEvents(employeeCodeInput);
      
      console.log('CYBERXEED自動ログイン: 従業員コードを入力しました');
    } else {
      console.error('CYBERXEED自動ログイン: 従業員コード入力欄が見つかりません');
    }
    
    // パスワード入力欄を取得して入力
    const passwordInput = document.querySelector('input[placeholder="Password / パスワード"]');
    if (passwordInput) {
      // 値を設定
      passwordInput.value = password;
      
      // 入力イベントを発火させる
      triggerInputEvents(passwordInput);
      
      console.log('CYBERXEED自動ログイン: パスワードを入力しました');
    } else {
      console.error('CYBERXEED自動ログイン: パスワード入力欄が見つかりません');
    }
    
    // 少し待機してからログインボタンをクリック
    setTimeout(() => {
      const loginButton = document.querySelector('button');
      if (loginButton) {
        console.log('CYBERXEED自動ログイン: ログインボタンをクリックします');
        loginButton.click();
      } else {
        console.error('CYBERXEED自動ログイン: ログインボタンが見つかりません');
      }
    }, 500);
  } catch (error) {
    console.error('CYBERXEED自動ログイン: エラーが発生しました', error);
  }
}

// 入力イベントを発火させる関数
function triggerInputEvents(element) {
  // フォーカスイベント
  element.focus();
  
  // 入力イベント
  const inputEvent = new Event('input', { bubbles: true });
  element.dispatchEvent(inputEvent);
  
  // 変更イベント
  const changeEvent = new Event('change', { bubbles: true });
  element.dispatchEvent(changeEvent);
  
  // キーイベント
  const keydownEvent = new KeyboardEvent('keydown', { bubbles: true });
  element.dispatchEvent(keydownEvent);
  
  const keyupEvent = new KeyboardEvent('keyup', { bubbles: true });
  element.dispatchEvent(keyupEvent);
  
  // ブラーイベント
  element.blur();
}
