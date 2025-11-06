# LoLで学ぶハングル語

League of Legendsのチャンピオン名を通じて韓国語（ハングル）を学習するWebアプリケーションです。

## 🎮 機能

- **チャンピオン一覧**: 168体のLoLチャンピオンのアイコンとハングル名を表示
- **音韻分解分析**: 各チャンピオンの韓国語名を音節単位で分解し、ローマ字変換を表示
- **ハングル基礎表**: 子音・母音の対応表と変換ルールの学習
- **検索機能**: 日本語・英語・韓国語での検索が可能
- **レスポンシブデザイン**: モバイル・タブレット・PCに対応

## 🛠️ 技術スタック

- **フロントエンド**: React + TypeScript
- **UIライブラリ**: Material-UI (MUI) v7
- **開発環境**: Docker Compose
- **デプロイ**: Vercel

## 📦 セットアップ

### 前提条件

- Node.js 18以上
- Docker Desktop（開発環境用）
- Git

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd hungul_lol

# 依存関係のインストール
cd hungul_lol/app
npm install
```

### 開発環境の起動

```bash
# Dockerを使用する場合（推奨）
docker compose up

# ローカル環境で直接起動する場合
cd hungul_lol/app
npm start
```

アプリケーションは http://localhost:3005 で起動します。

## 🚀 Vercelへのデプロイ

### 方法1: Vercel CLIを使用

```bash
# Vercel CLIのインストール（未インストールの場合）
npm i -g vercel

# プロジェクトルートで実行
vercel

# 初回は以下の質問に答えてください：
# - Set up and deploy: Y
# - Which scope: あなたのアカウントを選択
# - Link to existing project?: N（新規の場合）
# - Project name: hungul-lol（任意）
# - Directory: ./hungul_lol/app
# - Override settings?: N
```

### 方法2: GitHubと連携

1. このプロジェクトをGitHubにプッシュ
2. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
3. "New Project"をクリック
4. GitHubリポジトリをインポート
5. 以下の設定を確認：
   - **Framework Preset**: Other
   - **Root Directory**: `./`（変更しない）
   - **Build Command**: `cd hungul_lol/app && npm run build`
   - **Output Directory**: `hungul_lol/app/build`
   - **Install Command**: `cd hungul_lol/app && npm install`

### 環境変数（必要な場合）

Vercelダッシュボードで以下を設定：
- `REACT_APP_ENV`: production

## 📁 プロジェクト構造

```
hungul_lol/
├── docker-compose.yml      # Docker開発環境設定
├── Dockerfile             # Dockerイメージ設定
├── vercel.json           # Vercelデプロイ設定
├── README.md             # このファイル
└── hungul_lol/
    └── app/              # Reactアプリケーション
        ├── public/
        │   └── images/   # チャンピオンアイコン画像
        ├── src/
        │   ├── components/   # Reactコンポーネント
        │   ├── data/        # JSONデータ
        │   ├── types/       # TypeScript型定義
        │   └── utils/       # ユーティリティ関数
        └── package.json
```

## 🔧 利用可能なスクリプト

```bash
# 開発サーバー起動
npm start

# プロダクションビルド
npm run build

# テスト実行
npm test

# チャンピオン画像のダウンロード
npm run download-images

# 特定の画像を更新
npm run update-specific-images

# 画像統計情報の確認
node scripts/optimizeImages.js
```

## 🤝 貢献

プルリクエストは歓迎します。大きな変更の場合は、まずイシューを作成して変更内容を議論してください。

## 📄 ライセンス

[MITライセンス](LICENSE)

## 🎯 今後の機能追加予定

- [ ] 発音音声の追加
- [ ] クイズモード
- [ ] 学習進捗の保存
- [ ] より詳細な文法説明
- [ ] 他のゲームキャラクターの追加

---

Made with ❤️ for LoL and Korean learners