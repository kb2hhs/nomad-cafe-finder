# Nomad Cafe Finder

東京23区のカフェ情報を事前にデータベース化し、地図UIとエリア選択の両方で閲覧できるノマドワーカー向けカフェ検索アプリケーション。

## 概要

ノマドワーカーやリモートワーカーが作業しやすいカフェを探すのは意外と難しい。Wi-Fiの有無、電源コンセント、静かさなど、通常のグルメサイトでは検索しにくい情報が必要になる。

本アプリは、**事前に東京23区の全カフェデータをデータベースに構築**し、複数のデータソース（Google Places、食べログ、Retty等）とAIエージェントを組み合わせてノマドワーカー向けの情報を統合・スコアリングして提供する。

## 主な機能

- **エリア選択**: 東京23区からエリアを選択してカフェを閲覧
- **地図UI**: Google Mapsでカフェの位置を可視化、地図操作で検索範囲を変更
- **ノマドスコア**: Wi-Fi、電源、静かさ等を総合評価した独自スコア（0-100点）
- **詳細情報**: 営業時間、レビュー、雰囲気、AI要約など
- **お気に入り**: ログインして気に入ったカフェを保存
- **フィルター**: Wi-Fi有無、電源有無、ノマドスコアで絞り込み

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS + shadcn/ui |
| 地図 | Google Maps JavaScript API |
| データベース | Supabase (PostgreSQL + Auth) |
| AIモデル | Qwen-Flash / DeepSeek-V3.2 / Gemini 2.5 Flash-Lite |
| スクレイピング | Firecrawl |
| デプロイ | Vercel |

## ディレクトリ構成

```
nomad-cafe-finder/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 検索ページ
│   │   ├── results/
│   │   │   └── page.tsx          # 検索結果ページ
│   │   ├── favorites/
│   │   │   └── page.tsx          # お気に入りページ
│   │   ├── api/
│   │   │   ├── search/
│   │   │   │   └── route.ts      # 検索API
│   │   │   ├── favorites/
│   │   │   │   └── route.ts      # お気に入りAPI
│   │   │   └── auth/
│   │   │       └── [...supabase]/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── search/
│   │   ├── cafe/
│   │   ├── map/
│   │   └── layout/
│   ├── services/
│   │   ├── google-places.ts
│   │   ├── scraper.ts
│   │   ├── ai-agent.ts
│   │   ├── nomad-scorer.ts
│   │   └── search-orchestrator.ts
│   ├── lib/
│   │   ├── supabase/
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── .env.local
├── package.json
└── README.md
```

## セットアップ

### 必要条件

- Node.js 18.x以上
- npm または yarn
- 以下のAPIキー:
  - Google Maps/Places API
  - OpenAI API
  - Firecrawl API
  - Supabase プロジェクト

### 環境変数

`.env.local`ファイルを作成し、以下を設定:

```env
# Google
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# AI Model (いずれか1つ以上)
QWEN_API_KEY=your_qwen_api_key  # Alibaba Cloud Model Studio
DEEPSEEK_API_KEY=your_deepseek_api_key
GEMINI_API_KEY=your_gemini_api_key
# または
OPENAI_API_KEY=your_openai_api_key

# Firecrawl
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### インストール

```bash
# 依存関係のインストール
npm install

# データベーススキーマの作成
# SupabaseダッシュボードでSQLエディタを開き、docs/DATA_MODEL.mdのSQLを実行

# データ収集（東京23区のカフェデータを構築）
npm run collect:cafes

# 開発サーバーの起動
npm run dev
```

http://localhost:3000 でアクセス可能。

### データ収集コマンド

```bash
# 全23区のデータ収集（初回のみ、数時間かかります）
npm run collect:cafes

# 特定の区のみ収集（テスト用）
npm run collect:cafes -- --ward shibuya

# データ更新（30日以上経過したカフェを更新）
npm run update:cafes
```

詳細は[データ収集戦略](./docs/DATA_COLLECTION.md)を参照。

## ドキュメント

- **[実装手順ガイド](./docs/IMPLEMENTATION_GUIDE.md)** ⭐ - 実装の全体像と段階的な手順
- [アーキテクチャ](./docs/ARCHITECTURE.md) - システム全体の設計
- [技術スタック選定](./docs/TECH_DECISIONS.md) - 採用技術の選定理由と比較
- [データ収集戦略](./docs/DATA_COLLECTION.md) - 東京23区カフェデータの収集方法
- [データモデル](./docs/DATA_MODEL.md) - データベーススキーマと型定義
- [API仕様](./docs/API_SPEC.md) - APIエンドポイント仕様
- [UI仕様](./docs/UI_SPEC.md) - UIコンポーネント仕様

## ライセンス

MIT
