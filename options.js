// options.js
// 設定画面のスクリプト（簡素化版）

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', function() {
  console.log('CYBERXEED自動ログイン: 設定画面が読み込まれました');
  
  // 要素の取得
  const companyCodeInput = document.getElementById('companyCode');
  const employeeCodeInput = document.getElementById('employeeCode');
  const passwordInput = document.getElementById('password');
  const cyberxeedUrlInput = document.getElementById('cyberxeedUrl');
  const newCyberxeedUrlInput = document.getElementById('newCyberxeedUrl');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');
  const changeUrlButton = document.getElementById('changeUrlButton');
  const urlStep = document.getElementById('urlStep');
  const confirmUrlButton = document.getElementById('confirmUrlButton');
  const cancelUrlButton = document.getElementById('cancelUrlButton');
  const advancedSettingsToggle = document.getElementById('advancedSettingsToggle');
  const advancedSettingsContent = document.getElementById('advancedSettingsContent');
  
  // 詳細設定の表示/非表示を切り替える
  advancedSettingsToggle.addEventListener('click', function() {
    const isVisible = advancedSettingsContent.classList.contains('visible');
    if (isVisible) {
      advancedSettingsContent.classList.remove('visible');
      advancedSettingsToggle.textContent = '詳細設定を表示 ▼';
    } else {
      advancedSettingsContent.classList.add('visible');
      advancedSettingsToggle.textContent = '詳細設定を非表示 ▲';
    }
  });
  
  // URL変更ボタンのクリックイベント
  changeUrlButton.addEventListener('click', function() {
    // 現在のURLを新しいURL入力欄にコピー
    newCyberxeedUrlInput.value = cyberxeedUrlInput.value;
    // URL変更ステップを表示
    urlStep.classList.add('active');
    // 新しいURL入力欄にフォーカス
    newCyberxeedUrlInput.focus();
  });
  
  // URL変更確定ボタンのクリックイベント
  confirmUrlButton.addEventListener('click', function() {
    // 新しいURLを取得
    const newUrl = newCyberxeedUrlInput.value.trim();
    
    // URLの形式を検証
    if (!newUrl || !isValidUrl(newUrl)) {
      showStatus('URLの形式が正しくありません。', 'error');
      return;
    }
    
    // URLを更新
    cyberxeedUrlInput.value = newUrl;
    
    // URL変更ステップを非表示
    urlStep.classList.remove('active');
    
    showStatus('URLが更新されました。', 'success');
  });
  
  // URL変更キャンセルボタンのクリックイベント
  cancelUrlButton.addEventListener('click', function() {
    // URL変更ステップを非表示
    urlStep.classList.remove('active');
  });
  
  // 保存ボタンのクリックイベント
  saveButton.addEventListener('click', function() {
    try {
      // 入力値を取得
      const companyCode = companyCodeInput.value.trim();
      const employeeCode = employeeCodeInput.value.trim();
      const password = passwordInput.value;
      const cyberxeedUrl = cyberxeedUrlInput.value.trim();
      
      // 必須項目の検証
      if (!companyCode || !employeeCode || !password) {
        showStatus('すべての必須項目を入力してください。', 'error');
        return;
      }
      
      // URLの形式を検証
      if (!isValidUrl(cyberxeedUrl)) {
        showStatus('URLの形式が正しくありません。', 'error');
        return;
      }
      
      // 保存中のステータスを表示
      showStatus('設定を保存しています...', '');
      
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
            showStatus('ログイン情報の暗号化に失敗しました。', 'error');
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
                showStatus('ログイン情報の暗号化に失敗しました。', 'error');
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
                    showStatus('ログイン情報の暗号化に失敗しました。', 'error');
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
                      showStatus('設定の保存に失敗しました。', 'error');
                      return;
                    }
                    
                    // 設定が変更されたことをバックグラウンドに通知
                    chrome.runtime.sendMessage({ action: 'settingsChanged' }, function(response) {
                      if (chrome.runtime.lastError) {
                        console.log('バックグラウンドへの通知に失敗しましたが、設定は保存されています:', chrome.runtime.lastError);
                      }
                      
                      showStatus('設定が保存されました。', 'success');
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
      showStatus('設定保存中にエラーが発生しました。', 'error');
    }
  });
  
  // 保存された設定を読み込む
  loadSettings();
});

// 保存された設定を読み込む関数
function loadSettings() {
  console.log('CYBERXEED自動ログイン: 設定を読み込んでいます');
  
  chrome.storage.sync.get(['cyberxeedLogin', 'cyberxeedUrl'], function(data) {
    if (chrome.runtime.lastError) {
      console.error('設定の読み込みに失敗しました:', chrome.runtime.lastError);
      showStatus('設定の読み込みに失敗しました。', 'error');
      return;
    }
    
    // URL設定
    const cyberxeedUrlInput = document.getElementById('cyberxeedUrl');
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
                showStatus('保存されたログイン情報の復号化に失敗しました。', 'error');
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
          showStatus('ログイン情報の復号化中にエラーが発生しました。', 'error');
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

// ステータスメッセージを表示する関数
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
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
