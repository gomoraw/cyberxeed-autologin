// popup_integrated.js
// ポップアップ画面のスクリプト（設定機能統合版）

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', function() {
  // メイン画面の要素
  const statusElement = document.getElementById('status');
  const loginInfoElement = document.getElementById('loginInfo');
  const settingsButton = document.getElementById('settingsButton');
  const mainPanel = document.getElementById('mainPanel');
  
  // 設定画面の要素
  const settingsPanel = document.getElementById('settingsPanel');
  const companyCodeInput = document.getElementById('companyCode');
  const employeeCodeInput = document.getElementById('employeeCode');
  const passwordInput = document.getElementById('password');
  const cyberxeedUrlInput = document.getElementById('cyberxeedUrl');
  const saveButton = document.getElementById('saveButton');
  const backButton = document.getElementById('backButton');
  const settingsStatusElement = document.getElementById('settingsStatus');
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // タブ切り替え
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // アクティブなタブを変更
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // タブコンテンツを切り替え
      const tabId = this.getAttribute('data-tab');
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
          content.classList.add('active');
        }
      });
    });
  });
  
  // 設定ボタンのクリックイベント
  settingsButton.addEventListener('click', function() {
    // メイン画面を非表示
    mainPanel.style.display = 'none';
    
    // 設定画面を表示
    settingsPanel.style.display = 'block';
    
    // 保存された設定を読み込む
    loadSettings();
  });
  
  // 戻るボタンのクリックイベント
  backButton.addEventListener('click', function() {
    // 設定画面を非表示
    settingsPanel.style.display = 'none';
    
    // メイン画面を表示
    mainPanel.style.display = 'block';
    
    // メイン画面の情報を更新
    updateMainInfo();
  });
  
  // 保存ボタンのクリックイベント
  saveButton.addEventListener('click', function() {
    try {
      // 入力値を取得
      const companyCode = companyCodeInput.value.trim();
      const employeeCode = employeeCodeInput.value.trim();
      const password = passwordInput.value;
      const cyberxeedUrl = cyberxeedUrlInput.value.trim() || 'https://cxg9.i-abs.co.jp/CYBERXEED/';
      
      // 必須項目の検証
      if (!companyCode || !employeeCode || !password) {
        showSettingsStatus('すべての必須項目を入力してください。', 'error');
        return;
      }
      
      // URLの形式を検証
      if (!isValidUrl(cyberxeedUrl)) {
        showSettingsStatus('URLの形式が正しくありません。', 'error');
        return;
      }
      
      // 保存中のステータスを表示
      showSettingsStatus('設定を保存しています...', '');
      
      // バックグラウンドに暗号化を依頼
      chrome.runtime.sendMessage(
        { 
          action: 'encryptData', 
          data: companyCode,
          key: 'CYBERXEED_FIXED_KEY_2025'
        }, 
        function(response1) {
          if (chrome.runtime.lastError || !response1 || !response1.success) {
            console.error('会社コードの暗号化に失敗しました:', chrome.runtime.lastError);
            showSettingsStatus('ログイン情報の暗号化に失敗しました。', 'error');
            return;
          }
          
          const encryptedCompanyCode = response1.result;
          
          chrome.runtime.sendMessage(
            { 
              action: 'encryptData', 
              data: employeeCode,
              key: 'CYBERXEED_FIXED_KEY_2025'
            }, 
            function(response2) {
              if (chrome.runtime.lastError || !response2 || !response2.success) {
                console.error('従業員コードの暗号化に失敗しました:', chrome.runtime.lastError);
                showSettingsStatus('ログイン情報の暗号化に失敗しました。', 'error');
                return;
              }
              
              const encryptedEmployeeCode = response2.result;
              
              chrome.runtime.sendMessage(
                { 
                  action: 'encryptData', 
                  data: password,
                  key: 'CYBERXEED_FIXED_KEY_2025'
                }, 
                function(response3) {
                  if (chrome.runtime.lastError || !response3 || !response3.success) {
                    console.error('パスワードの暗号化に失敗しました:', chrome.runtime.lastError);
                    showSettingsStatus('ログイン情報の暗号化に失敗しました。', 'error');
                    return;
                  }
                  
                  const encryptedPassword = response3.result;
                  
                  // 設定を保存
                  chrome.storage.sync.set({
                    cyberxeedLogin: {
                      companyCode: encryptedCompanyCode,
                      employeeCode: encryptedEmployeeCode,
                      password: encryptedPassword,
                      isEncrypted: true
                    },
                    cyberxeedUrl: cyberxeedUrl
                  }, function() {
                    if (chrome.runtime.lastError) {
                      console.error('設定の保存に失敗しました:', chrome.runtime.lastError);
                      showSettingsStatus('設定の保存に失敗しました。', 'error');
                      return;
                    }
                    
                    // 設定が変更されたことをバックグラウンドに通知
                    chrome.runtime.sendMessage({ action: 'settingsChanged' }, function(response) {
                      if (chrome.runtime.lastError) {
                        console.log('バックグラウンドへの通知に失敗しましたが、設定は保存されています:', chrome.runtime.lastError);
                      }
                      
                      showSettingsStatus('設定が保存されました。', 'success');
                      
                      // 3秒後にメイン画面に戻る
                      setTimeout(function() {
                        // 設定画面を非表示
                        settingsPanel.style.display = 'none';
                        
                        // メイン画面を表示
                        mainPanel.style.display = 'block';
                        
                        // メイン画面の情報を更新
                        updateMainInfo();
                      }, 3000);
                    });
                  });
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('設定保存中にエラーが発生しました:', error);
      showSettingsStatus('設定保存中にエラーが発生しました。', 'error');
    }
  });
  
  // 初期表示
  updateMainInfo();
});

// 保存された設定を読み込む関数
function loadSettings() {
  console.log('CYBERXEED自動ログイン: 設定を読み込んでいます');
  
  const cyberxeedUrlInput = document.getElementById('cyberxeedUrl');
  
  chrome.storage.sync.get(['cyberxeedLogin', 'cyberxeedUrl'], function(data) {
    if (chrome.runtime.lastError) {
      console.error('設定の読み込みに失敗しました:', chrome.runtime.lastError);
      showSettingsStatus('設定の読み込みに失敗しました。', 'error');
      return;
    }
    
    // URL設定
    if (data.cyberxeedUrl) {
      cyberxeedUrlInput.value = data.cyberxeedUrl;
    } else {
      cyberxeedUrlInput.value = 'https://cxg9.i-abs.co.jp/CYBERXEED/';
    }
    
    // ログイン情報
    if (data.cyberxeedLogin) {
      const loginInfo = data.cyberxeedLogin;
      
      // 暗号化されているかどうかを確認
      if (loginInfo.isEncrypted) {
        try {
          // バックグラウンドに復号化を依頼
          chrome.runtime.sendMessage(
            { 
              action: 'decryptData', 
              data: loginInfo.companyCode
            }, 
            function(response1) {
              if (chrome.runtime.lastError || !response1 || !response1.success) {
                console.error('会社コードの復号化に失敗しました:', chrome.runtime.lastError);
                showSettingsStatus('保存されたログイン情報の復号化に失敗しました。', 'error');
                return;
              }
              
              const companyCode = response1.result;
              document.getElementById('companyCode').value = companyCode;
              
              chrome.runtime.sendMessage(
                { 
                  action: 'decryptData', 
                  data: loginInfo.employeeCode
                }, 
                function(response2) {
                  if (chrome.runtime.lastError || !response2 || !response2.success) {
                    console.error('従業員コードの復号化に失敗しました:', chrome.runtime.lastError);
                    return;
                  }
                  
                  const employeeCode = response2.result;
                  document.getElementById('employeeCode').value = employeeCode;
                  
                  chrome.runtime.sendMessage(
                    { 
                      action: 'decryptData', 
                      data: loginInfo.password
                    }, 
                    function(response3) {
                      if (chrome.runtime.lastError || !response3 || !response3.success) {
                        console.error('パスワードの復号化に失敗しました:', chrome.runtime.lastError);
                        return;
                      }
                      
                      const password = response3.result;
                      document.getElementById('password').value = password;
                    }
                  );
                }
              );
            }
          );
        } catch (error) {
          console.error('ログイン情報の復号化中にエラーが発生しました:', error);
          showSettingsStatus('ログイン情報の復号化中にエラーが発生しました。', 'error');
        }
      } else {
        // 暗号化されていない古いデータの場合はそのまま使用
        document.getElementById('companyCode').value = loginInfo.companyCode || '';
        document.getElementById('employeeCode').value = loginInfo.employeeCode || '';
        document.getElementById('password').value = loginInfo.password || '';
      }
    }
  });
}

// メイン画面の情報を更新する関数
function updateMainInfo() {
  const statusElement = document.getElementById('status');
  const loginInfoElement = document.getElementById('loginInfo');
  
  chrome.storage.sync.get(['cyberxeedLogin', 'cyberxeedUrl'], function(data) {
    if (chrome.runtime.lastError) {
      console.error('設定の取得に失敗しました:', chrome.runtime.lastError);
      statusElement.textContent = '設定の取得に失敗しました。';
      statusElement.className = 'status error';
      return;
    }
    
    // ログイン情報が保存されているかどうかを確認
    if (data.cyberxeedLogin) {
      // ログイン情報が保存されている場合
      loginInfoElement.textContent = 'ログイン情報が保存されています。';
      statusElement.textContent = '自動ログイン機能は有効です。';
      statusElement.className = 'status success';
    } else {
      // ログイン情報が保存されていない場合
      loginInfoElement.textContent = 'ログイン情報が保存されていません。';
      statusElement.textContent = '設定画面でログイン情報を設定してください。';
      statusElement.className = 'status warning';
    }
  });
}

// 設定画面のステータスメッセージを表示する関数
function showSettingsStatus(message, type) {
  const statusDiv = document.getElementById('settingsStatus');
  statusDiv.textContent = message;
  statusDiv.className = 'status';
  
  if (type) {
    statusDiv.classList.add(type);
  }
  
  statusDiv.style.display = 'block';
  
  // 成功メッセージは3秒後に非表示
  if (type === 'success') {
    setTimeout(function() {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}

// URLの形式を検証する関数
function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
}
