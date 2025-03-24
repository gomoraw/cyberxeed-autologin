// options.js
document.addEventListener('DOMContentLoaded', function() {
  // 保存ボタンのクリックイベントを設定
  document.getElementById('saveButton').addEventListener('click', saveOptions);
  
  // 保存されている設定を読み込む
  loadOptions();
});

// 設定を保存する関数
function saveOptions() {
  const companyCode = document.getElementById('companyCode').value;
  const employeeCode = document.getElementById('employeeCode').value;
  const password = document.getElementById('password').value;
  
  // 入力値の検証
  if (!companyCode || !employeeCode || !password) {
    showStatus('すべての項目を入力してください', false);
    return;
  }
  
  // Chrome Storageに設定を保存
  chrome.storage.sync.set({
    cyberxeedLogin: {
      companyCode: companyCode,
      employeeCode: employeeCode,
      password: password
    }
  }, function() {
    // 保存成功時の処理
    showStatus('設定が保存されました', true);
  });
}

// 保存されている設定を読み込む関数
function loadOptions() {
  chrome.storage.sync.get('cyberxeedLogin', function(data) {
    if (data.cyberxeedLogin) {
      document.getElementById('companyCode').value = data.cyberxeedLogin.companyCode || '';
      document.getElementById('employeeCode').value = data.cyberxeedLogin.employeeCode || '';
      document.getElementById('password').value = data.cyberxeedLogin.password || '';
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
