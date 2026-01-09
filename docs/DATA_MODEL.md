# データモデル仕様書

## 概要

Nomad Cafe Finderで使用するデータモデルとデータベーススキーマを定義する。

## TypeScript型定義

### コアエンティティ

```typescript
// カフェ情報
interface Cafe {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  
  // ノマドワーカー向け情報
  hasWifi: boolean;
  wifiSpeed: WifiSpeed;
  hasPowerOutlets: boolean;
  powerOutletCount: PowerOutletCount;
  noiseLevel: NoiseLevel;
  seatingTypes: string[];
  isStayFriendly: boolean;
  
  // 基本情報
  openingHours: OpeningHour[];
  rating: number;
  userRatingsTotal: number;
  priceLevel: PriceLevel;
  photos: Photo[];
  website?: string;
  phoneNumber?: string;
  
  // スコア
  nomadScore: number;
  nomadScoreBreakdown: NomadScoreBreakdown;
  
  // AI分析
  aiSummary: string;
  
  // ソース情報
  sources: CafeSources;
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
}

type WifiSpeed = 'fast' | 'medium' | 'slow' | 'unknown';
type PowerOutletCount = 'many' | 'few' | 'none' | 'unknown';
type NoiseLevel = 'quiet' | 'moderate' | 'noisy' | 'unknown';
type PriceLevel = 1 | 2 | 3 | 4;

interface OpeningHour {
  day: number;       // 0=日曜, 1=月曜, ... 6=土曜
  open: string;      // "09:00"
  close: string;     // "22:00"
  isClosed?: boolean;
}

interface Photo {
  url: string;
  width: number;
  height: number;
  attribution?: string;
}

interface NomadScoreBreakdown {
  wifi: number;         // 0-25
  power: number;        // 0-20
  noise: number;        // 0-20
  seating: number;      // 0-20
  stayFriendly: number; // 0-15
}

interface CafeSources {
  google?: GooglePlaceSource;
  tabelog?: TabelogSource;
  retty?: RettySource;
}

interface GooglePlaceSource {
  placeId: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel?: number;
  url: string;
}

interface TabelogSource {
  id: string;
  rating: number;
  reviewCount: number;
  url: string;
}

interface RettySource {
  id: string;
  rating: number;
  reviewCount: number;
  url: string;
}
```

### ユーザー関連

```typescript
// ユーザー（Supabase Authで管理）
interface User {
  id: string;              // UUID
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
}

// お気に入り
interface Favorite {
  id: string;              // UUID
  userId: string;          // FK to users
  cafeId: string;
  cafeData: Cafe;          // スナップショット保存
  note?: string;
  createdAt: Date;
}

// 検索履歴
interface SearchHistory {
  id: string;              // UUID
  userId?: string;         // FK to users (nullable for anonymous)
  sessionId: string;       // 匿名ユーザー識別用
  location: string;
  radius: number;
  resultCount: number;
  createdAt: Date;
}
```

### キャッシュ

```typescript
// 検索結果キャッシュ
interface SearchCache {
  id: string;
  cacheKey: string;        // `${locationHash}_${radius}`
  location: string;
  lat: number;
  lng: number;
  radius: number;
  results: Cafe[];
  expiresAt: Date;
  createdAt: Date;
}
```

---

## Supabaseデータベーススキーマ

### テーブル定義

```sql
-- エリアマスターテーブル（23区管理用）
CREATE TABLE areas (
  code TEXT PRIMARY KEY,  -- 'shibuya', 'shinjuku' など
  name TEXT NOT NULL,  -- '渋谷区'
  name_kana TEXT NOT NULL,  -- 'シブヤク'
  bounds JSONB NOT NULL,  -- {north, south, east, west}
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  cafe_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- カフェマスターテーブル（事前構築データ）
CREATE TABLE cafes (
  id TEXT PRIMARY KEY,  -- 'google_place_id' または 'tabelog_id'
  name TEXT NOT NULL,
  name_kana TEXT,  -- カタカナ名（検索用）
  address TEXT NOT NULL,
  prefecture TEXT NOT NULL DEFAULT '東京都',
  city TEXT NOT NULL,  -- 区名（例: '渋谷区'）
  ward_code TEXT,  -- 区コード（23区の識別用）
  postal_code TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  
  -- ノマドワーカー向け情報
  has_wifi BOOLEAN DEFAULT FALSE,
  wifi_speed TEXT CHECK (wifi_speed IN ('fast', 'medium', 'slow', 'unknown')),
  has_power_outlets BOOLEAN DEFAULT FALSE,
  power_outlet_count TEXT CHECK (power_outlet_count IN ('many', 'few', 'none', 'unknown')),
  noise_level TEXT CHECK (noise_level IN ('quiet', 'moderate', 'noisy', 'unknown')),
  seating_types TEXT[],  -- ARRAY型
  is_stay_friendly BOOLEAN DEFAULT FALSE,
  
  -- 基本情報
  opening_hours JSONB,  -- OpeningHour[]のJSON
  rating DOUBLE PRECISION,
  user_ratings_total INTEGER DEFAULT 0,
  price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
  photos JSONB,  -- Photo[]のJSON
  website TEXT,
  phone_number TEXT,
  
  -- スコア
  nomad_score INTEGER CHECK (nomad_score BETWEEN 0 AND 100),
  nomad_score_breakdown JSONB,
  
  -- AI分析
  ai_summary TEXT,
  
  -- ソース情報
  sources JSONB NOT NULL,  -- CafeSourcesのJSON
  
  -- メタデータ
  data_quality_score INTEGER DEFAULT 0,  -- データの完全性スコア（0-100）
  last_verified_at TIMESTAMPTZ,  -- 最終確認日時
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザープロファイル（Supabase Auth連携）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- お気に入り
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cafe_id TEXT NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 同じユーザーが同じカフェを重複登録しない
  UNIQUE(user_id, cafe_id)
);

-- 検索履歴
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius INTEGER NOT NULL,
  result_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 検索キャッシュ（将来の拡張用、現在はcafesテーブルから直接検索）
CREATE TABLE search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius INTEGER NOT NULL,
  results JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
-- エリア
CREATE INDEX idx_areas_code ON areas(code);

-- カフェ
CREATE INDEX idx_cafes_city ON cafes(city);
CREATE INDEX idx_cafes_ward_code ON cafes(ward_code);
CREATE INDEX idx_cafes_nomad_score ON cafes(nomad_score DESC);
CREATE INDEX idx_cafes_updated_at ON cafes(updated_at DESC);
CREATE INDEX idx_cafes_location ON cafes USING GIST (
  ll_to_earth(lat, lng)
);  -- PostGIS拡張を使用（または単純なB-tree）
CREATE INDEX idx_cafes_sources ON cafes USING GIN(sources);  -- JSONB検索用
CREATE INDEX idx_cafes_data_quality ON cafes(data_quality_score DESC);

-- 重複チェック用（同じカフェを複数ソースから取得した場合）
CREATE UNIQUE INDEX idx_cafes_google_place_id ON cafes((sources->'google'->>'placeId'))
  WHERE sources->'google'->>'placeId' IS NOT NULL;

-- ユーザー関連
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_cafe_id ON favorites(cafe_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX idx_search_cache_cache_key ON search_cache(cache_key);
CREATE INDEX idx_search_cache_expires_at ON search_cache(expires_at);
```

### Row Level Security (RLS)

```sql
-- RLSを有効化
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- areas: 全員が閲覧可能
CREATE POLICY "Anyone can view areas" ON areas
  FOR SELECT USING (true);

-- cafes: 全員が閲覧可能（公開データ）
CREATE POLICY "Anyone can view cafes" ON cafes
  FOR SELECT USING (true);

-- profiles: 本人のみ読み書き可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- favorites: 本人のみCRUD可能
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- search_history: 本人のみ閲覧可能、挿入は誰でも可能
CREATE POLICY "Users can view own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert search history" ON search_history
  FOR INSERT WITH CHECK (true);

-- search_cache: サービスロールのみ操作可能（API経由）
CREATE POLICY "Service role can manage cache" ON search_cache
  FOR ALL USING (auth.role() = 'service_role');
```

### トリガー

```sql
-- updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER areas_updated_at
  BEFORE UPDATE ON areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cafes_updated_at
  BEFORE UPDATE ON cafes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 新規ユーザー登録時にprofilesレコードを自動作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 期限切れキャッシュの自動削除（定期実行が必要）
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM search_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- エリアのカフェ数を自動更新
CREATE OR REPLACE FUNCTION update_area_cafe_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE areas
    SET cafe_count = (
      SELECT COUNT(*) FROM cafes WHERE ward_code = NEW.ward_code
    )
    WHERE code = NEW.ward_code;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE areas
    SET cafe_count = (
      SELECT COUNT(*) FROM cafes WHERE ward_code = OLD.ward_code
    )
    WHERE code = OLD.ward_code;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cafes_area_count_insert
  AFTER INSERT ON cafes
  FOR EACH ROW EXECUTE FUNCTION update_area_cafe_count();

CREATE TRIGGER cafes_area_count_delete
  AFTER DELETE ON cafes
  FOR EACH ROW EXECUTE FUNCTION update_area_cafe_count();
```

---

## データ変換

### 外部APIデータからの変換

```typescript
// Google Places APIレスポンスからの変換
function transformGooglePlace(place: google.maps.places.PlaceResult): Partial<Cafe> {
  return {
    id: `google_${place.place_id}`,
    name: place.name || '',
    address: place.formatted_address || '',
    lat: place.geometry?.location?.lat() || 0,
    lng: place.geometry?.location?.lng() || 0,
    openingHours: transformOpeningHours(place.opening_hours),
    rating: place.rating || 0,
    userRatingsTotal: place.user_ratings_total || 0,
    priceLevel: (place.price_level || 2) as PriceLevel,
    photos: transformPhotos(place.photos),
    website: place.website,
    phoneNumber: place.formatted_phone_number,
    sources: {
      google: {
        placeId: place.place_id || '',
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        priceLevel: place.price_level,
        url: place.url || '',
      },
    },
  };
}

// 食べログスクレイピング結果からの変換
function transformTabelogData(data: TabelogScrapedData): TabelogSource {
  return {
    id: data.restaurantId,
    rating: data.rating,
    reviewCount: data.reviewCount,
    url: data.url,
  };
}

// Rettyスクレイピング結果からの変換
function transformRettyData(data: RettyScrapedData): RettySource {
  return {
    id: data.restaurantId,
    rating: data.rating,
    reviewCount: data.reviewCount,
    url: data.url,
  };
}
```

### ノマドスコア算出

```typescript
interface ScoreInput {
  hasWifi: boolean;
  wifiSpeed: WifiSpeed;
  hasPowerOutlets: boolean;
  powerOutletCount: PowerOutletCount;
  noiseLevel: NoiseLevel;
  seatingTypes: string[];
  isStayFriendly: boolean;
  reviews: Review[];  // ノマド関連レビューの分析結果
}

function calculateNomadScore(input: ScoreInput): NomadScoreBreakdown {
  const breakdown: NomadScoreBreakdown = {
    wifi: 0,
    power: 0,
    noise: 0,
    seating: 0,
    stayFriendly: 0,
  };
  
  // Wi-Fi (最大25点)
  if (input.hasWifi) {
    breakdown.wifi += 15;
    if (input.wifiSpeed === 'fast') breakdown.wifi += 10;
    else if (input.wifiSpeed === 'medium') breakdown.wifi += 5;
  }
  
  // 電源 (最大20点)
  if (input.hasPowerOutlets) {
    breakdown.power += 12;
    if (input.powerOutletCount === 'many') breakdown.power += 8;
    else if (input.powerOutletCount === 'few') breakdown.power += 4;
  }
  
  // 静かさ (最大20点)
  if (input.noiseLevel === 'quiet') breakdown.noise = 20;
  else if (input.noiseLevel === 'moderate') breakdown.noise = 12;
  else if (input.noiseLevel === 'noisy') breakdown.noise = 4;
  
  // 席 (最大20点)
  const hasComfortableSeating = input.seatingTypes.some(
    s => ['カウンター', 'ソファ', '個室'].includes(s)
  );
  if (hasComfortableSeating) breakdown.seating += 10;
  if (input.seatingTypes.length >= 2) breakdown.seating += 10;
  
  // 長居しやすさ (最大15点)
  if (input.isStayFriendly) breakdown.stayFriendly = 15;
  else breakdown.stayFriendly = 5; // デフォルト
  
  return breakdown;
}

function getTotalNomadScore(breakdown: NomadScoreBreakdown): number {
  return (
    breakdown.wifi +
    breakdown.power +
    breakdown.noise +
    breakdown.seating +
    breakdown.stayFriendly
  );
}
```

---

## キャッシュ戦略

### キャッシュキー生成

```typescript
function generateCacheKey(location: string, radius: number): string {
  // 位置情報を正規化してハッシュ化
  const normalizedLocation = location.trim().toLowerCase();
  const hash = crypto
    .createHash('md5')
    .update(`${normalizedLocation}_${radius}`)
    .digest('hex')
    .substring(0, 16);
  return hash;
}
```

### TTL設定

| データ種類 | TTL | 理由 |
|-----------|-----|------|
| 検索結果キャッシュ | 24時間 | カフェ情報は頻繁に変わらない |
| オートコンプリート | 1時間 | Places APIの制限対策 |
| カフェ詳細 | 12時間 | 詳細情報は更新頻度低 |

---

## データ整合性

### バリデーション

```typescript
import { z } from 'zod';

const CafeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  hasWifi: z.boolean(),
  wifiSpeed: z.enum(['fast', 'medium', 'slow', 'unknown']),
  hasPowerOutlets: z.boolean(),
  powerOutletCount: z.enum(['many', 'few', 'none', 'unknown']),
  noiseLevel: z.enum(['quiet', 'moderate', 'noisy', 'unknown']),
  seatingTypes: z.array(z.string()),
  rating: z.number().min(0).max(5),
  priceLevel: z.number().min(1).max(4),
  nomadScore: z.number().min(0).max(100),
});

const FavoriteSchema = z.object({
  cafeId: z.string().min(1),
  note: z.string().max(500).optional(),
});

const SearchRequestSchema = z.object({
  location: z.string().min(1).max(200),
  radius: z.number().min(50).max(5000).default(1000),
  limit: z.number().min(1).max(50).default(20),
  minNomadScore: z.number().min(0).max(100).optional(),
  filters: z.object({
    hasWifi: z.boolean().optional(),
    hasPowerOutlets: z.boolean().optional(),
    noiseLevel: z.enum(['quiet', 'moderate', 'any']).optional(),
  }).optional(),
});
```

