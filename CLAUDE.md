# Hungul LOL プロジェクトガイドライン

## プロジェクト概要
このプロジェクトは、League of LegendsとEternal Returnのキャラクター名を通じて韓国語（ハングル）を学習するWebアプリケーションです。

## 技術スタック
- React + TypeScript
- Vite (ビルドツール)
- Material-UI (MUI) - UIコンポーネントライブラリ
- React Router - ルーティング
- Tailwind CSS - 追加スタイリング（MUIと併用）

## 重要な開発ガイドライン

### 1. UIライブラリの使用
**必ずMaterial-UI (MUI)を使用してください**
- 新しいコンポーネントを作成する際は、既存のコンポーネントを参考にMUIコンポーネントを使用する
- カスタムCSSやTailwindクラスは最小限に抑え、MUIのsxプロパティやthemeを活用する

### 2. 既存ファイルの参考
新機能を実装する際は、以下のファイルを参考にしてください：

#### ページコンポーネントの例
- `/src/pages/LoLPage.tsx` - ゲーム別ページの実装例
- `/src/pages/CharacterStatsPage.tsx` - データテーブル表示の実装例
- `/src/pages/HangulBasicsPage.tsx` - 学習コンテンツ表示の実装例

#### 共通コンポーネントの例
- `/src/components/ChampionCard.tsx` - MUIカードコンポーネントの使用例
- `/src/components/SimpleNavigation.tsx` - MUIナビゲーションバーの実装例
- `/src/components/ChampionDetailModal.tsx` - MUIモーダルの実装例

### 3. テーマとダークモード
- `/src/contexts/ThemeContext.tsx` - テーマコンテキストの実装
- `/src/utils/theme.ts` - MUIテーマ設定
- 必ずダークモード対応を考慮する（`useTheme`フックを使用）

### 4. コーディング規約

#### インポート順序
```typescript
import React from 'react';
import { MUIコンポーネント } from '@mui/material';
import { その他の外部ライブラリ } from 'xxx';
import { 内部コンポーネント } from './components/xxx';
import { ユーティリティ関数 } from './utils/xxx';
import { 型定義 } from './types/xxx';
```

#### MUIコンポーネントの使用例
```typescript
import { Box, Typography, Card, Button } from '@mui/material';

// 良い例：MUIのsxプロパティを使用
<Box sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
  <Typography variant="h4" component="h1">
    タイトル
  </Typography>
</Box>

// 避けるべき例：インラインスタイルやクラス名の直接指定
<div style={{ padding: 16 }} className="custom-box">
  <h1>タイトル</h1>
</div>
```

#### レスポンシブデザイン
```typescript
// MUIのブレークポイントを使用
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 1, sm: 2, md: 3 }
}}>
```

### 5. 状態管理
- ローカル状態：`useState`
- グローバル状態：Context API（例：ThemeContext, LearningProgressContext）
- 永続化が必要なデータ：LocalStorage + Context

### 6. エラーハンドリング
- try-catchブロックでエラーをキャッチ
- ユーザーフレンドリーなエラーメッセージを表示
- MUIのSnackbarやAlertコンポーネントを使用

### 7. パフォーマンス最適化
- 重い計算は`useMemo`でメモ化
- コールバック関数は`useCallback`でメモ化
- 大きなリストは仮想スクロール（必要に応じて）

### 8. アクセシビリティ
- 適切なaria-labelを設定
- キーボードナビゲーション対応
- 適切な色コントラスト比を維持

### 9. テストとビルド
```bash
# 開発サーバー起動
npm run dev

# ビルド実行
npm run build

# リント実行
npm run lint

# 型チェック
npm run type-check
```

### 10. Git コミット規約
- feat: 新機能追加
- fix: バグ修正
- refactor: リファクタリング
- style: スタイル変更
- docs: ドキュメント更新
- test: テスト追加・修正
- chore: その他の変更

## プロジェクト構造
```
src/
├── components/     # 再利用可能なコンポーネント
├── pages/         # ページコンポーネント
├── contexts/      # Reactコンテキスト
├── types/         # TypeScript型定義
├── utils/         # ユーティリティ関数
├── data/          # 静的データ（JSON）
└── api/           # API関連
```

## 注意事項
1. 新しい依存関係を追加する前に、既存のライブラリで実現できないか検討する
2. コンポーネントは単一責任の原則に従って小さく保つ
3. 必ずTypeScriptの型を適切に定義する
4. コメントは必要最小限に留め、コード自体を読みやすくする
5. 絵文字の使用は避ける（ユーザーが明示的に要求した場合を除く）