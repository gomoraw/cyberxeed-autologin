# CYBERXEED自動ログイン拡張機能 インストールガイド

## インストール手順

### 1. 拡張機能ファイルの準備

1. GitHubリポジトリから最新のリリースをダウンロードするか、リポジトリをクローンします
2. ZIPファイルをダウンロードした場合は、任意の場所に解凍します

### 2. Microsoft Edgeへのインストール

1. Microsoft Edgeを起動します
2. アドレスバーに「edge://extensions/」と入力してEnterキーを押します
3. 拡張機能管理ページの右上にある「開発者モード」をオンにします
4. 「展開して読み込み」ボタンをクリックします
5. ファイル選択ダイアログで、解凍した「cyberxeed-autologin」フォルダを選択します
6. 「フォルダーの選択」をクリックします
7. 拡張機能が正常にインストールされると、拡張機能リストに「CYBERXEED 自動ログイン」が表示されます

### 3. Google Chromeへのインストール

1. Google Chromeを起動します
2. アドレスバーに「chrome://extensions/」と入力してEnterキーを押します
3. 拡張機能管理ページの右上にある「開発者モード」をオンにします
4. 「パッケージ化されていない拡張機能を読み込む」ボタンをクリックします
5. ファイル選択ダイアログで、解凍した「cyberxeed-autologin」フォルダを選択します
6. 「フォルダーの選択」をクリックします
7. 拡張機能が正常にインストールされると、拡張機能リストに「CYBERXEED 自動ログイン」が表示されます

## 設定方法

### 設定画面へのアクセス（v1.5.3以降）

拡張機能のアイコンをクリックし、表示されるポップアップで「設定画面を表示」ボタンをクリックします。
ポップアップ内に設定画面が表示されます。

### ログイン情報の設定

1. 設定画面で以下の情報を入力します：
   * 会社コード: あなたの会社コード
   * 従業員コード: あなたの従業員コード
   * パスワード: あなたのパスワード
2. 「設定を保存」ボタンをクリックします
3. 「設定が保存されました」というメッセージが表示されれば成功です
4. 「戻る」ボタンでメイン画面に戻ります

### CYBERXEED URLの設定（v1.5.3新機能）

1. 設定画面の「詳細設定」タブをクリックします
2. 「CYBERXEED URL」欄に使用するサーバーのURLを入力します
   * デフォルト: https://cxg9.i-abs.co.jp/CYBERXEED/
   * 会社独自のCYBERXEEDサーバーを使用している場合は、そのURLを入力
3. 「設定を保存」ボタンをクリックします
4. 「戻る」ボタンでメイン画面に戻ります

## 使用方法

1. ログイン情報を設定した後、CYBERXEEDのURLにアクセスします
   * ブックマークから開く
   * または直接URLを入力する
2. 拡張機能が自動的に設定したログイン情報を入力します
3. ログインボタンが自動的にクリックされ、システムにログインします

## セキュリティ機能

この拡張機能では、ログイン情報を暗号化して保存する機能が実装されています。

### セキュリティの特徴

* ブラウザのストレージに保存されるログイン情報が暗号化されるため、他のアプリケーションからの不正アクセスを防止できます
* 暗号化キーはブラウザ固有の情報から生成されるため、同じアカウントでも異なるデバイスでは復号化できません
* 設定画面でも暗号化状態が表示されるため、セキュリティ状態を確認できます

### セキュリティに関する注意事項

* 暗号化はブラウザレベルでの保護であり、デバイス自体のセキュリティには影響しません
* 共有PCを使用している場合は、ブラウザからログアウトするか、拡張機能を削除することをお勧めします

## トラブルシューティング

### 自動ログインが動作しない場合

1. 拡張機能が有効になっているか確認します
   * 拡張機能管理ページにアクセスし、「CYBERXEED 自動ログイン」が有効になっているか確認
2. ログイン情報が正しく設定されているか確認します
   * 設定画面にアクセスし、すべての項目が入力されているか確認
3. CYBERXEED URLが正しく設定されているか確認します
   * 詳細設定タブでURLを確認し、必要に応じて修正
4. ページを再読み込みしてみてください
   * F5キーを押す、または更新ボタンをクリック
5. ブラウザのコンソールを開いて（F12キーを押し、「コンソール」タブを選択）エラーメッセージを確認してください
6. 拡張機能を一度削除して再インストールしてみてください

### 設定画面に関する問題（v1.5.3以降）

1. 拡張機能のポップアップが表示されない場合は、ブラウザを再起動してみてください
2. 設定画面でエラーが表示される場合は、ブラウザのコンソールでエラーを確認してください
3. 問題が解決しない場合は、拡張機能を一度削除して再インストールしてみてください

## 更新情報

CYBERXEEDのウェブサイトが更新され、ページ構造が変更された場合は、拡張機能の更新が必要になる可能性があります。その場合は開発者にお問い合わせください。
