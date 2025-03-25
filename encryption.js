// encryption.js
// ログイン情報の暗号化と復号化を行うユーティリティ関数

/**
 * 文字列を暗号化する関数
 * @param {string} text - 暗号化する文字列
 * @param {string} key - 暗号化キー（ユーザー固有の値）
 * @returns {string} - 暗号化された文字列
 */
function encryptData(text, key) {
  try {
    // キーからハッシュ値を生成（単純化のため、実際の実装ではより強力な方法を使用すべき）
    const keyHash = generateKeyHash(key);
    
    // 暗号化処理（単純なXOR暗号）
    const encryptedArray = [];
    for (let i = 0; i < text.length; i++) {
      // 文字コードをXOR演算で暗号化
      const charCode = text.charCodeAt(i) ^ keyHash[i % keyHash.length].charCodeAt(0);
      encryptedArray.push(charCode);
    }
    
    // Base64エンコードして返す
    return btoa(String.fromCharCode.apply(null, encryptedArray));
  } catch (error) {
    console.error('暗号化エラー:', error);
    return '';
  }
}

/**
 * 暗号化された文字列を復号化する関数
 * @param {string} encryptedText - 暗号化された文字列
 * @param {string} key - 暗号化キー（ユーザー固有の値）
 * @returns {string} - 復号化された文字列
 */
function decryptData(encryptedText, key) {
  try {
    // キーからハッシュ値を生成
    const keyHash = generateKeyHash(key);
    
    // Base64デコード
    const encryptedArray = [];
    const decodedText = atob(encryptedText);
    for (let i = 0; i < decodedText.length; i++) {
      encryptedArray.push(decodedText.charCodeAt(i));
    }
    
    // 復号化処理（XOR暗号の逆操作）
    let decryptedText = '';
    for (let i = 0; i < encryptedArray.length; i++) {
      // XOR演算で復号化
      const charCode = encryptedArray[i] ^ keyHash[i % keyHash.length].charCodeAt(0);
      decryptedText += String.fromCharCode(charCode);
    }
    
    return decryptedText;
  } catch (error) {
    console.error('復号化エラー:', error);
    return '';
  }
}

/**
 * キーからハッシュ値を生成する関数
 * @param {string} key - 暗号化キー
 * @returns {string} - ハッシュ値
 */
function generateKeyHash(key) {
  // 単純なハッシュ関数（実際の実装ではより強力なハッシュ関数を使用すべき）
  let hash = '';
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash += String.fromCharCode(((char * 17) % 126) + 33); // 印字可能なASCII文字の範囲に収める
  }
  
  // ハッシュの長さを確保（最低16文字）
  while (hash.length < 16) {
    hash += hash;
  }
  
  return hash;
}

/**
 * ブラウザの一意識別子を取得する関数
 * @returns {Promise<string>} - ブラウザの一意識別子
 */
async function getBrowserIdentifier() {
  // ブラウザの情報を組み合わせて一意の識別子を生成
  const browserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    // 他にも利用可能な情報があれば追加
  };
  
  // オブジェクトを文字列化してハッシュ化
  const infoString = JSON.stringify(browserInfo);
  
  // 単純なハッシュ生成（実際の実装ではより強力なハッシュ関数を使用すべき）
  return generateKeyHash(infoString);
}

/**
 * 暗号化キーを生成または取得する関数
 * @returns {Promise<string>} - 暗号化キー
 */
async function getEncryptionKey() {
  return new Promise((resolve) => {
    // ストレージから既存のキーを取得
    chrome.storage.local.get('encryptionKey', async (data) => {
      if (data.encryptionKey) {
        // 既存のキーがあれば使用
        resolve(data.encryptionKey);
      } else {
        // 新しいキーを生成
        const browserIdentifier = await getBrowserIdentifier();
        const randomPart = Math.random().toString(36).substring(2, 15);
        const newKey = browserIdentifier + randomPart;
        
        // 生成したキーを保存
        chrome.storage.local.set({ encryptionKey: newKey }, () => {
          resolve(newKey);
        });
      }
    });
  });
}
