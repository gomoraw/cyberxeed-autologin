// background.js
// CYBERXEEDシステムの拡張機能バックグラウンドスクリプト（簡素化版）

/**
 * デバッグモード設定
 * @type {boolean}
 */
const DEBUG_MODE = true;

/**
 * デバッグログを出力する関数
 * @param {...any} args - ログ出力する引数
 */
function debugLog(...args) {
  if (DEBUG_MODE) {
    console.log('CYBERXEED自動ログイン [BACKGROUND]:', ...args);
  }
}

/**
 * 暗号化キーのハッシュ値を生成する関数
 * @param {string} key - 暗号化キー
 * @returns {string} - ハッシュ値
 */
function generateKeyHash(key) {
  // 単純なハッシュ関数
  let hash = '';
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash += String.fromCharCode(((char * 17) % 126) + 33);
  }
  
  // ハッシュ値が16文字未満の場合は繰り返して16文字以上にする
  while (hash.length < 16) {
    hash += hash;
  }
  
  return hash.substring(0, 16);
}

/**
 * データを暗号化する関数
 * @param {string} data - 暗号化するデータ
 * @param {string} key - 暗号化キー
 * @returns {string} - 暗号化されたデータ（Base64エンコード）
 */
function encryptData(data, key) {
  try {
    // キーのハッシュ値を生成
    const keyHash = generateKeyHash(key || 'CYBERXEED_FIXED_KEY_2025');
    
    // XOR暗号化
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      const keyCharCode = keyHash.charCodeAt(i % keyHash.length);
      encrypted += String.fromCharCode(charCode ^ keyCharCode);
    }
    
    // Base64エンコード
    return btoa(encrypted);
  } catch (error) {
    debugLog('データの暗号化中にエラーが発生しました:', error);
    return '';
  }
}

/**
 * データを復号化する関数
 * @param {string} encryptedData - 暗号化されたデータ（Base64エンコード）
 * @param {string} key - 暗号化キー
 * @returns {string} - 復号化されたデータ
 */
function decryptData(encryptedData, key) {
  try {
    // Base64デコード
    const base64Decoded = atob(encryptedData);
    
    // キーのハッシュ値を生成
    const keyHash = generateKeyHash(key || 'CYBERXEED_FIXED_KEY_2025');
    
    // XOR復号化
    let decrypted = '';
    for (let i = 0; i < base64Decoded.length; i++) {
      const charCode = base64Decoded.charCodeAt(i);
      const keyCharCode = keyHash.charCodeAt(i % keyHash.length);
      decrypted += String.fromCharCode(charCode ^ keyCharCode);
    }
    
    return decrypted;
  } catch (error) {
    debugLog('データの復号化中にエラーが発生しました:', error);
    return '';
  }
}

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  debugLog('メッセージを受信しました:', request.action);
  
  // メッセージのアクションに応じて処理を分岐
  switch (request.action) {
    case 'encryptData':
      // データを暗号化
      const encryptedData = encryptData(request.data, request.key);
      sendResponse({ success: true, result: encryptedData });
      break;
      
    case 'decryptData':
      // データを復号化
      const decryptedData = decryptData(request.data, request.key);
      sendResponse({ success: true, result: decryptedData });
      break;
      
    case 'settingsChanged':
      // 設定が変更された
      debugLog('設定が変更されました');
      sendResponse({ success: true });
      break;
      
    default:
      // 未知のアクション
      sendResponse({ success: false, error: '未知のアクションです: ' + request.action });
      break;
  }
  
  // 非同期レスポンスを示すためにtrueを返す
  return true;
});

// 拡張機能インストール/更新時の処理
chrome.runtime.onInstalled.addListener(function(details) {
  debugLog('拡張機能がインストール/更新されました:', details.reason);
  
  if (details.reason === 'install') {
    // 初回インストール時の処理
    chrome.storage.local.set({
      installDate: new Date().toISOString(),
      encryptionKey: 'CYBERXEED_FIXED_KEY_2025'
    }, function() {
      debugLog('初期設定を保存しました');
    });
    
    // オプションページを開く
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    // 更新時の処理
    chrome.storage.local.set({
      updateDate: new Date().toISOString()
    }, function() {
      debugLog('更新日時を保存しました');
    });
  }
});

// 初期化処理
(function() {
  debugLog('バックグラウンドスクリプトを初期化しています');
  
  // 暗号化キーが存在しない場合は作成
  chrome.storage.local.get('encryptionKey', function(data) {
    if (!data.encryptionKey) {
      chrome.storage.local.set({
        encryptionKey: 'CYBERXEED_FIXED_KEY_2025'
      }, function() {
        debugLog('暗号化キーを作成しました');
      });
    }
  });
})();
