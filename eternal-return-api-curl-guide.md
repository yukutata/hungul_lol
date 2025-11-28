# Eternal Return API - curl コマンドガイド

## 基本情報

### ベースURL
```
https://open-api.bser.io
```

### APIキー取得
Nimble Neuron社からAPIキーを取得する必要があります。
開発者ポータル: https://developer.eternalreturn.io/

## 認証方法

### Bearer Token方式
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://open-api.bser.io/v1/endpoint
```

### APIキーヘッダー方式（サポートされている場合）
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
     https://open-api.bser.io/v1/endpoint
```

## 言語対応について

### ローカライゼーションエンドポイント
APIレスポンス自体は英語ですが、各言語のテキストデータは別途取得可能：

```bash
# 対応言語
- Japanese - 日本語
- Korean - 韓国語
- English - 英語
- ChineseSimplified - 簡体字中国語
- ChineseTraditional - 繁体字中国語
- French - フランス語
- Spanish - スペイン語
- SpanishLatin - スペイン語（ラテンアメリカ）
- Portuguese - ポルトガル語
- Thai - タイ語
- Indonesian - インドネシア語
- German - ドイツ語
- Russian - ロシア語
- Vietnamese - ベトナム語
- Italian - イタリア語
```

### 言語別キャラクター名の例（Jackie）
- 日本語: ジャッキー
- 韓国語: 재키
- 英語: Jackie

## 主要エンドポイント

### 1. メタデータ取得（キャラクター、アイテムなど）
```bash
# キャラクター情報（英語）
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/data/Character?hl=en

# キャラクター情報（日本語）
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/data/Character?hl=ja

# キャラクター情報（韓国語）
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/data/Character?hl=ko

# アイテム情報（言語指定あり）
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/data/Item?hl=ja
```

### 2. ユーザー情報取得
```bash
# ユーザー基本情報（言語指定あり）
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/user/{userNum}?hl=ja

# ユーザーの試合履歴（言語指定あり）
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/user/{userNum}/games?hl=ja
```

### 3. 試合詳細情報
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/games/{gameId}?hl=ja
```

### 4. ランキング情報
```bash
# シーズンとチームモードを指定（言語指定あり）
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/rank/{seasonId}/{teamMode}?hl=ja
```

## 実用的な使用例

### 環境変数を使用した安全な実行
```bash
# APIキーを環境変数に設定
export BSER_API_KEY="YOUR_API_KEY"

# curlコマンドで使用（日本語で取得）
curl -H "Authorization: Bearer $BSER_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/data/Character?hl=ja
```

### レスポンスを整形して表示
```bash
# jqを使用した場合（日本語データ）
curl -s -H "Authorization: Bearer $BSER_API_KEY" \
     https://open-api.bser.io/v1/data/Character?hl=ja | jq .

# Pythonを使用した場合（韓国語データ）
curl -s -H "Authorization: Bearer $BSER_API_KEY" \
     https://open-api.bser.io/v1/data/Character?hl=ko | python -m json.tool
```

### デバッグ用の詳細出力
```bash
curl -v \
     -H "Authorization: Bearer $BSER_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/data/Character
```

### ファイルへの保存
```bash
# レスポンスをファイルに保存
curl -H "Authorization: Bearer $BSER_API_KEY" \
     -o character_data.json \
     https://open-api.bser.io/v1/data/Character
```

### エラーハンドリング
```bash
# HTTPステータスコードの確認
curl -w "\nHTTP Status: %{http_code}\n" \
     -H "Authorization: Bearer $BSER_API_KEY" \
     https://open-api.bser.io/v1/data/Character

# エラーのみ表示
curl -f -s -S \
     -H "Authorization: Bearer $BSER_API_KEY" \
     https://open-api.bser.io/v1/data/Character || echo "Request failed"
```

## 複数パラメータの組み合わせ

言語オプションと他のパラメータを組み合わせる場合：

```bash
# ページネーション付き（言語指定あり）
curl -H "Authorization: Bearer $BSER_API_KEY" \
     "https://open-api.bser.io/v1/user/{userNum}/games?hl=ja&next={nextId}"

# 複数のクエリパラメータ
curl -H "Authorization: Bearer $BSER_API_KEY" \
     "https://open-api.bser.io/v1/rank/{seasonId}/{teamMode}?hl=ko&page=1&per_page=100"
```

## レート制限対策

APIにはレート制限がある可能性があるため、以下の対策を推奨：

```bash
# sleep を使用した簡単な遅延
for i in {1..10}; do
    curl -H "Authorization: Bearer $BSER_API_KEY" \
         https://open-api.bser.io/v1/user/$i/games
    sleep 1  # 1秒待機
done
```

## テスト結果と注意点

### 実際のテスト結果
- APIキー認証は `X-API-Key` ヘッダーを使用（`Authorization: Bearer` では403エラー）
- 言語パラメータ `hl=ja` や `hl=ko` を指定してもAPIレスポンスは英語のまま
- ローカライズされたテキストは別途 `/v1/l10n/{language}` エンドポイントから取得
- キャラクターの基本ステータスデータは正常に取得可能
- APIバージョンは `v1` と `v2` が存在（v2には `hash` エンドポイントあり）

### 実際に動作したコマンド例
```bash
# キャラクターデータ取得（成功）
curl -H "X-API-Key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://open-api.bser.io/v1/data/Character

# データハッシュ値取得（v2 API）
curl -H "X-API-Key: YOUR_API_KEY" \
     https://open-api.bser.io/v2/data/hash

# ローカライゼーションファイル取得（日本語）
curl -H "X-API-Key: YOUR_API_KEY" \
     https://open-api.bser.io/v1/l10n/Japanese

# ローカライゼーションファイル取得（韓国語）
curl -H "X-API-Key: YOUR_API_KEY" \
     https://open-api.bser.io/v1/l10n/Korean
```

### ローカライゼーションデータの使用例
```bash
# 日本語のローカライゼーションファイルURLを取得してダウンロード
L10N_URL=$(curl -s -H "X-API-Key: YOUR_API_KEY" https://open-api.bser.io/v1/l10n/Japanese | jq -r '.data.l10Path')
curl -s "$L10N_URL" > l10n_japanese.txt

# キャラクター名の日本語を取得
grep "Character/Name/" l10n_japanese.txt | head -20

# 結果例：
# Character/Name/1┃ジャッキー
# Character/Name/2┃アヤ
# Character/Name/3┃フィオラ
# ...
```

## 注意事項

1. `YOUR_API_KEY` を実際のAPIキーに置き換える
2. `{userNum}` を実際のユーザー番号に置き換える
3. `{gameId}` を実際のゲームIDに置き換える
4. HTTPSを使用して安全な通信を確保
5. APIキーは公開しないよう注意
6. 最新の仕様は公式ドキュメントで確認

## 参考リンク

- 公式開発者ポータル: https://developer.eternalreturn.io/
- APIドキュメント（PDF）: https://developer.eternalreturn.io/static/media/Docs_EN_20221107.pdf