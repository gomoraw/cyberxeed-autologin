// options.js
document.addEventListener('DOMContentLoaded', function() {
  // 保存ボタンのクリックイベントを設定
  document.getElementById('saveButton').addEventListener('click', saveOptions);
  
  // 保存されている設定を読み込む
  loadOptions();
});

// 設定を保存する関数
async function saveOptions() {
  const companyCode = document.getElementById('companyCode').value;
  const employeeCode = document.getElementById('employeeCode').value;
  const password = document.getElementById('password').value;
  
  // 入力値の検証
  if (!companyCode || !employeeCode || !password) {
    showStatus('すべての項目を入力してください', false);
    return;
  }
  
  try {
    // 暗号化キーを取得
    const encryptionKey = await getEncryptionKey();
    
    // ログイン情報を暗号化
    const encryptedCompanyCode = encryptData(companyCode, encryptionKey);
    const encryptedEmployeeCode = encryptData(employeeCode, encryptionKey);
    const encryptedPassword = encryptData(password, encryptionKey);
    
    // Chrome Storageに暗号化された設定を保存
    chrome.storage.sync.set({
      cyberxeedLogin: {
        companyCode: encryptedCompanyCode,
        employeeCode: encryptedEmployeeCode,
        password: encryptedPassword,
        isEncrypted: true // 暗号化フラグを追加
      }
    }, function() {
      // 保存成功時の処理
      showStatus('設定が暗号化されて保存されました', true);
    });
  } catch (error) {
    console.error('設定の暗号化に失敗しました:', error);
    showStatus('設定の保存に失敗しました', false);
  }
}

// 保存されている設定を読み込む関数
async function loadOptions() {
  chrome.storage.sync.get('cyberxeedLogin', async function(data) {
    if (data.cyberxeedLogin) {
      try {
        // 暗号化されているかどうかを確認
        if (data.cyberxeedLogin.isEncrypted) {
          // 暗号化キーを取得
          const encryptionKey = await getEncryptionKey();
          
          // 暗号化されたデータを復号化
          const companyCode = decryptData(data.cyberxeedLogin.companyCode, encryptionKey);
          const employeeCode = decryptData(data.cyberxeedLogin.employeeCode, encryptionKey);
          const password = decryptData(data.cyberxeedLogin.password, encryptionKey);
          
          // 復号化したデータをフォームに設定
          document.getElementById('companyCode').value = companyCode;
          document.getElementById('employeeCode').value = employeeCode;
          document.getElementById('password').value = password;
        } else {
          // 暗号化されていない古いデータの場合はそのまま表示
          document.getElementById('companyCode').value = data.cyberxeedLogin.companyCode || '';
          document.getElementById('employeeCode').value = data.cyberxeedLogin.employeeCode || '';
          document.getElementById('password').value = data.cyberxeedLogin.password || '';
        }
      } catch (error) {
        console.error('設定の読み込みに失敗しました:', error);
        showStatus('設定の読み込みに失敗しました', false);
      }
    }
  });
}

// ステータスメッセージを表示する関数
function showStatus(message, isSuccess) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = 'status ' + (isSuccess ? 'success' : 'error');
  statusElement.style.display = 'block';
  
  // 3秒後にメッセージを非表示にする
  setTimeout(function() {
    statusElement.style.display = 'none';
  }, 3000);
}
