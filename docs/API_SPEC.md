# API仕様書

## 概要

Nomad Cafe FinderのAPI仕様を定義する。すべてのAPIはNext.js Route Handlersとして実装される。

## ベースURL

- 開発環境: `http://localhost:3000/api`
- 本番環境: `https://nomad-cafe-finder.vercel.app/api`

## 認証

認証が必要なエンドポイントは、Supabase Authのセッショントークンを使用する。

```
Cookie: sb-<project-ref>-auth-token=<session-token>
```

---

## エンドポイント一覧

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| POST | `/api/search` | 不要 | カフェを検索 |
| GET | `/api/search/autocomplete` | 不要 | 場所名の補完候補 |
| GET | `/api/cafe/[id]` | 不要 | カフェ詳細を取得 |
| GET | `/api/favorites` | 必要 | お気に入り一覧を取得 |
| POST | `/api/favorites` | 必要 | お気に入りに追加 |
| DELETE | `/api/favorites/[id]` | 必要 | お気に入りから削除 |

---

## POST /api/search

カフェを検索し、ノマドスコア付きの結果を返す。

### リクエスト

```typescript
interface SearchRequest {
  location: string;       // 検索場所（駅名、地名など）
  radius?: number;        // 検索半径（メートル）。デフォルト: 1000
  limit?: number;         // 取得件数上限。デフォルト: 20
  minNomadScore?: number; // 最低ノマドスコア（0-100）
  filters?: {
    hasWifi?: boolean;
    hasPowerOutlets?: boolean;
    noiseLevel?: 'quiet' | 'moderate' | 'any';
  };
}
```

### リクエスト例

```json
{
  "location": "渋谷駅",
  "radius": 500,
  "limit": 10,
  "minNomadScore": 60,
  "filters": {
    "hasWifi": true,
    "hasPowerOutlets": true
  }
}
```

### レスポンス

```typescript
interface SearchResponse {
  success: boolean;
  data: {
    cafes: Cafe[];
    searchLocation: {
      name: string;
      lat: number;
      lng: number;
    };
    totalCount: number;
  };
  meta: {
    searchTime: number;    // 検索にかかった時間（ms）
    cached: boolean;       // キャッシュから取得したか
  };
}

interface Cafe {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  
  // ノマドワーカー向け情報
  hasWifi: boolean;
  wifiSpeed: 'fast' | 'medium' | 'slow' | 'unknown';
  hasPowerOutlets: boolean;
  powerOutletCount: 'many' | 'few' | 'unknown';
  noiseLevel: 'quiet' | 'moderate' | 'noisy' | 'unknown';
  seatingTypes: string[];
  
  // 基本情報
  openingHours: OpeningHour[];
  isOpenNow: boolean;
  rating: number;          // 1-5
  userRatingsTotal: number;
  priceLevel: number;      // 1-4
  photos: Photo[];
  
  // スコア
  nomadScore: number;      // 0-100
  nomadScoreBreakdown: {
    wifi: number;
    power: number;
    noise: number;
    seating: number;
    stayFriendly: number;
  };
  
  // AI分析
  aiSummary: string;
  
  // ソース情報
  sources: {
    google?: {
      placeId: string;
      rating: number;
    };
    tabelog?: {
      rating: number;
      url: string;
    };
    retty?: {
      rating: number;
      url: string;
    };
  };
  
  // 距離
  distance: number;        // 検索地点からの距離（メートル）
}

interface OpeningHour {
  day: number;             // 0=日曜, 1=月曜, ...
  open: string;            // "09:00"
  close: string;           // "22:00"
}

interface Photo {
  url: string;
  width: number;
  height: number;
  attribution?: string;
}
```

### レスポンス例

```json
{
  "success": true,
  "data": {
    "cafes": [
      {
        "id": "cafe_abc123",
        "name": "スターバックス 渋谷スクランブルスクエア店",
        "address": "東京都渋谷区渋谷2-24-12 渋谷スクランブルスクエア 1F",
        "lat": 35.6580,
        "lng": 139.7016,
        "hasWifi": true,
        "wifiSpeed": "fast",
        "hasPowerOutlets": true,
        "powerOutletCount": "many",
        "noiseLevel": "moderate",
        "seatingTypes": ["カウンター", "テーブル", "ソファ"],
        "openingHours": [
          { "day": 0, "open": "07:00", "close": "22:00" },
          { "day": 1, "open": "07:00", "close": "22:00" }
        ],
        "isOpenNow": true,
        "rating": 4.2,
        "userRatingsTotal": 1523,
        "priceLevel": 2,
        "photos": [
          {
            "url": "https://...",
            "width": 800,
            "height": 600
          }
        ],
        "nomadScore": 78,
        "nomadScoreBreakdown": {
          "wifi": 25,
          "power": 20,
          "noise": 13,
          "seating": 12,
          "stayFriendly": 8
        },
        "aiSummary": "高速Wi-Fiと充実した電源環境が魅力。混雑時は席確保が難しいが、朝の時間帯は比較的空いている。",
        "sources": {
          "google": { "placeId": "ChIJ...", "rating": 4.2 },
          "tabelog": { "rating": 3.5, "url": "https://tabelog.com/..." }
        },
        "distance": 120
      }
    ],
    "searchLocation": {
      "name": "渋谷駅",
      "lat": 35.6580,
      "lng": 139.7016
    },
    "totalCount": 15
  },
  "meta": {
    "searchTime": 2340,
    "cached": false
  }
}
```

### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "message": "指定された場所が見つかりませんでした"
  }
}
```

### エラーコード

| コード | 説明 |
|--------|------|
| LOCATION_NOT_FOUND | 場所が見つからない |
| INVALID_RADIUS | 半径が不正（50-5000の範囲外） |
| RATE_LIMIT_EXCEEDED | レート制限超過 |
| EXTERNAL_API_ERROR | 外部API（Google等）のエラー |
| INTERNAL_ERROR | 内部エラー |

---

## GET /api/search/autocomplete

場所名の補完候補を取得する。

### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| q | string | ○ | 検索文字列 |
| limit | number | × | 取得件数（デフォルト: 5） |

### リクエスト例

```
GET /api/search/autocomplete?q=渋谷&limit=5
```

### レスポンス

```typescript
interface AutocompleteResponse {
  success: boolean;
  data: {
    predictions: Prediction[];
  };
}

interface Prediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}
```

### レスポンス例

```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "placeId": "ChIJ...",
        "mainText": "渋谷駅",
        "secondaryText": "東京都渋谷区",
        "types": ["train_station", "transit_station"]
      },
      {
        "placeId": "ChIJ...",
        "mainText": "渋谷",
        "secondaryText": "東京都渋谷区",
        "types": ["sublocality", "political"]
      }
    ]
  }
}
```

---

## GET /api/cafe/[id]

カフェの詳細情報を取得する。

### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | string | カフェID |

### レスポンス

```typescript
interface CafeDetailResponse {
  success: boolean;
  data: {
    cafe: Cafe & {
      // 追加の詳細情報
      reviews: Review[];
      website?: string;
      phoneNumber?: string;
      googleMapsUrl: string;
    };
  };
}

interface Review {
  source: 'google' | 'tabelog' | 'retty';
  author: string;
  rating: number;
  text: string;
  time: string;       // ISO 8601
  nomadRelevant: boolean;  // ノマド関連の言及があるか
}
```

---

## GET /api/favorites

ログインユーザーのお気に入り一覧を取得する。

### ヘッダー

認証が必要。

### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| page | number | × | ページ番号（デフォルト: 1） |
| limit | number | × | 1ページの件数（デフォルト: 20） |

### レスポンス

```typescript
interface FavoritesResponse {
  success: boolean;
  data: {
    favorites: Favorite[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface Favorite {
  id: string;
  cafeId: string;
  cafe: Cafe;
  createdAt: string;   // ISO 8601
  note?: string;
}
```

---

## POST /api/favorites

カフェをお気に入りに追加する。

### ヘッダー

認証が必要。

### リクエスト

```typescript
interface AddFavoriteRequest {
  cafeId: string;
  note?: string;
}
```

### レスポンス

```typescript
interface AddFavoriteResponse {
  success: boolean;
  data: {
    favorite: Favorite;
  };
}
```

---

## DELETE /api/favorites/[id]

お気に入りから削除する。

### ヘッダー

認証が必要。

### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | string | お気に入りID |

### レスポンス

```typescript
interface DeleteFavoriteResponse {
  success: boolean;
}
```

---

## 共通エラーレスポンス

すべてのエンドポイントで共通のエラーフォーマット:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### 共通エラーコード

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| UNAUTHORIZED | 401 | 認証が必要 |
| FORBIDDEN | 403 | アクセス権限がない |
| NOT_FOUND | 404 | リソースが見つからない |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |
| INTERNAL_ERROR | 500 | 内部エラー |

---

## レート制限

- 認証なし: 10リクエスト/分/IP
- 認証あり: 60リクエスト/分/ユーザー

レート制限に達した場合、以下のヘッダーが返される:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067200
Retry-After: 45
```



