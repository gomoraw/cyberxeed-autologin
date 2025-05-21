// security_utils_fixed.js
// CYBERXEEDシステムのセキュリティ対策を強化するスクリプト（簡素化版）

/**
 * 強化された暗号化関数
 * Web Crypto APIを使用した安全な暗号化
 * @param {string} text - 暗号化する文字列
 * @param {string} key - 暗号化キー
 * @returns {Promise<string>} - 暗号化された文字列
 */
async function enhancedEncrypt(text, key) {
  try {
    // キーからハッシュを生成
    const keyMaterial = await getKeyMaterial(key);
    const cryptoKey = await deriveKey(keyMaterial);
    
    // テキストをUTF-8エンコード
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // 初期化ベクトル（IV）を生成
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // 暗号化を実行
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      data
    );
    
    // 暗号化データとIVを結合して保存
    const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength);
    encryptedArray.set(iv, 0);
    encryptedArray.set(new Uint8Array(encryptedData), iv.length);
    
    // Base64エンコードして返す
    return btoa(String.fromCharCode.apply(null, encryptedArray));
  } catch (error) {
    console.error('強化された暗号化に失敗しました:', error);
    // フォールバックとして既存の暗号化関数を使用
    return encryptData(text, key);
  }
}

/**
 * 強化された復号化関数
 * Web Crypto APIを使用した安全な復号化
 * @param {string} encryptedText - 暗号化された文字列
 * @param {string} key - 暗号化キー
 * @returns {Promise<string>} - 復号化された文字列
 */
async function enhancedDecrypt(encryptedText, key) {
  try {
    // Base64デコード
    const encryptedArray = new Uint8Array(atob(encryptedText).split('').map(char => char.charCodeAt(0)));
    
    // IVと暗号化データを分離
    const iv = encryptedArray.slice(0, 12);
    const encryptedData = encryptedArray.slice(12);
    
    // キーからハッシュを生成
    const keyMaterial = await getKeyMaterial(key);
    const cryptoKey = await deriveKey(keyMaterial);
    
    // 復号化を実行
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      encryptedData
    );
    
    // UTF-8デコード
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('強化された復号化に失敗しました:', error);
    // フォールバックとして既存の復号化関数を使用
    return decryptData(encryptedText, key);
  }
}

/**
 * キーマテリアルを生成する関数
 * @param {string} key - 元のキー
 * @returns {Promise<CryptoKey>} - キーマテリアル
 */
async function getKeyMaterial(key) {
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
}

/**
 * 暗号化キーを派生させる関数
 * @param {CryptoKey} keyMaterial - キーマテリアル
 * @returns {Promise<CryptoKey>} - 派生したキー
 */
async function deriveKey(keyMaterial) {
  // 固定ソルトを使用（ランダムソルトだと復号化時に問題が発生するため）
  const salt = new TextEncoder().encode('CYBERXEED_SECURE_SALT_FIXED');
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 安全なブラウザ識別子を取得する関数
 * @returns {Promise<string>} - ブラウザの一意識別子
 */
async function getSecureBrowserIdentifier() {
  try {
    // ブラウザの情報を収集
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    };
    
    // 情報を文字列化
    const infoString = JSON.stringify(browserInfo);
    
    // SHA-256ハッシュを生成
    const encoder = new TextEncoder();
    const data = encoder.encode(infoString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // ハッシュをBase64エンコード
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('安全なブラウザ識別子の取得に失敗しました:', error);
    // フォールバックとして既存の方法を使用
    return getBrowserIdentifier();
  }
}

/**
 * 安全な暗号化キーを生成または取得する関数
 * @returns {Promise<string>} - 暗号化キー
 */
async function getSecureEncryptionKey() {
  return new Promise((resolve) => {
    // ストレージから既存のキーを取得
    chrome.storage.local.get('secureEncryptionKey', async (data) => {
      if (data.secureEncryptionKey) {
        // 既存のキーがあれば使用
        resolve(data.secureEncryptionKey);
      } else {
        try {
          // 新しいキーを生成
          const browserIdentifier = await getSecureBrowserIdentifier();
          
          // 安全な乱数を生成
          const randomBuffer = new Uint8Array(32);
          crypto.getRandomValues(randomBuffer);
          const randomPart = Array.from(randomBuffer)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          // キーを組み合わせる
          const newKey = browserIdentifier + randomPart;
          
          // 生成したキーを保存
          chrome.storage.local.set({ secureEncryptionKey: newKey }, () => {
            resolve(newKey);
          });
        } catch (error) {
          console.error('安全な暗号化キーの生成に失敗しました:', error);
          // フォールバックとして既存の方法を使用
          getEncryptionKey().then(resolve);
        }
      }
    });
  });
}

/**
 * XSS対策のためのテキストサニタイズ関数
 * @param {string} text - サニタイズするテキスト
 * @returns {string} - サニタイズされたテキスト
 */
function sanitizeText(text) {
  if (!text) return '';
  
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
}

/**
 * 安全なストレージアクセス関数
 * @param {string} key - ストレージキー
 * @param {any} defaultValue - デフォルト値
 * @returns {Promise<any>} - 取得した値
 */
async function safeGetStorage(key, defaultValue) {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get(key, (data) => {
        if (chrome.runtime.lastError) {
          console.error('ストレージアクセスエラー:', chrome.runtime.lastError);
          resolve(defaultValue);
        } else {
          resolve(data[key] !== undefined ? data[key] : defaultValue);
        }
      });
    } catch (error) {
      console.error('ストレージアクセス例外:', error);
      resolve(defaultValue);
    }
  });
}

/**
 * 安全なストレージ保存関数
 * @param {Object} data - 保存するデータ
 * @returns {Promise<boolean>} - 保存成功フラグ
 */
async function safeSetStorage(data) {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error('ストレージ保存エラー:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (error) {
      console.error('ストレージ保存例外:', error);
      resolve(false);
    }
  });
}

// グローバルに公開する関数
window.enhancedEncryptData = enhancedEncrypt;
window.enhancedDecryptData = enhancedDecrypt;
window.getSecureBrowserIdentifier = getSecureBrowserIdentifier;
window.getSecureEncryptionKey = getSecureEncryptionKey;
window.sanitizeText = sanitizeText;
window.safeGetStorage = safeGetStorage;
window.safeSetStorage = safeSetStorage;
