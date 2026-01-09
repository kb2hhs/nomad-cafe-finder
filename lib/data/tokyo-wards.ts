/**
 * 東京23区の定義データ
 * 各区の境界（bounds）と中心座標を定義
 */

export interface TokyoWard {
  code: string;
  name: string;
  nameKana: string;
  bounds: {
    north: number;  // 緯度
    south: number;
    east: number;  // 経度
    west: number;
  };
  center: {
    lat: number;
    lng: number;
  };
}

export const TOKYO_23_WARDS: TokyoWard[] = [
  {
    code: 'chiyoda',
    name: '千代田区',
    nameKana: 'チヨダク',
    bounds: { north: 35.70, south: 35.68, east: 139.78, west: 139.73 },
    center: { lat: 35.69, lng: 139.755 },
  },
  {
    code: 'chuo',
    name: '中央区',
    nameKana: 'チュウオウク',
    bounds: { north: 35.68, south: 35.65, east: 139.79, west: 139.76 },
    center: { lat: 35.665, lng: 139.775 },
  },
  {
    code: 'minato',
    name: '港区',
    nameKana: 'ミナトク',
    bounds: { north: 35.68, south: 35.63, east: 139.76, west: 139.72 },
    center: { lat: 35.655, lng: 139.74 },
  },
  {
    code: 'shinjuku',
    name: '新宿区',
    nameKana: 'シンジュクク',
    bounds: { north: 35.72, south: 35.68, east: 139.72, west: 139.68 },
    center: { lat: 35.70, lng: 139.70 },
  },
  {
    code: 'bunkyo',
    name: '文京区',
    nameKana: 'ブンキョウク',
    bounds: { north: 35.73, south: 35.70, east: 139.76, west: 139.73 },
    center: { lat: 35.715, lng: 139.745 },
  },
  {
    code: 'taito',
    name: '台東区',
    nameKana: 'タイトウク',
    bounds: { north: 35.73, south: 35.70, east: 139.80, west: 139.76 },
    center: { lat: 35.715, lng: 139.78 },
  },
  {
    code: 'sumida',
    name: '墨田区',
    nameKana: 'スミダク',
    bounds: { north: 35.73, south: 35.70, east: 139.83, west: 139.80 },
    center: { lat: 35.715, lng: 139.815 },
  },
  {
    code: 'koto',
    name: '江東区',
    nameKana: 'コトウク',
    bounds: { north: 35.70, south: 35.63, east: 139.85, west: 139.80 },
    center: { lat: 35.665, lng: 139.825 },
  },
  {
    code: 'shinagawa',
    name: '品川区',
    nameKana: 'シナガワク',
    bounds: { north: 35.65, south: 35.60, east: 139.76, west: 139.70 },
    center: { lat: 35.625, lng: 139.73 },
  },
  {
    code: 'meguro',
    name: '目黒区',
    nameKana: 'メグロク',
    bounds: { north: 35.66, south: 35.61, east: 139.70, west: 139.66 },
    center: { lat: 35.635, lng: 139.68 },
  },
  {
    code: 'ota',
    name: '大田区',
    nameKana: 'オオタク',
    bounds: { north: 35.63, south: 35.55, east: 139.78, west: 139.70 },
    center: { lat: 35.59, lng: 139.74 },
  },
  {
    code: 'setagaya',
    name: '世田谷区',
    nameKana: 'セタガヤク',
    bounds: { north: 35.68, south: 35.60, east: 139.68, west: 139.60 },
    center: { lat: 35.64, lng: 139.64 },
  },
  {
    code: 'shibuya',
    name: '渋谷区',
    nameKana: 'シブヤク',
    bounds: { north: 35.68, south: 35.63, east: 139.72, west: 139.68 },
    center: { lat: 35.655, lng: 139.70 },
  },
  {
    code: 'nakano',
    name: '中野区',
    nameKana: 'ナカノク',
    bounds: { north: 35.73, south: 35.68, east: 139.68, west: 139.63 },
    center: { lat: 35.705, lng: 139.655 },
  },
  {
    code: 'suginami',
    name: '杉並区',
    nameKana: 'スギナミク',
    bounds: { north: 35.73, south: 35.66, east: 139.68, west: 139.60 },
    center: { lat: 35.695, lng: 139.64 },
  },
  {
    code: 'toshima',
    name: '豊島区',
    nameKana: 'トシマク',
    bounds: { north: 35.75, south: 35.70, east: 139.73, west: 139.68 },
    center: { lat: 35.725, lng: 139.705 },
  },
  {
    code: 'kita',
    name: '北区',
    nameKana: 'キタク',
    bounds: { north: 35.78, south: 35.72, east: 139.76, west: 139.70 },
    center: { lat: 35.75, lng: 139.73 },
  },
  {
    code: 'arakawa',
    name: '荒川区',
    nameKana: 'アラカワク',
    bounds: { north: 35.75, south: 35.72, east: 139.80, west: 139.76 },
    center: { lat: 35.735, lng: 139.78 },
  },
  {
    code: 'itabashi',
    name: '板橋区',
    nameKana: 'イタバシク',
    bounds: { north: 35.80, south: 35.73, east: 139.72, west: 139.66 },
    center: { lat: 35.765, lng: 139.69 },
  },
  {
    code: 'nerima',
    name: '練馬区',
    nameKana: 'ネリマク',
    bounds: { north: 35.78, south: 35.70, east: 139.66, west: 139.58 },
    center: { lat: 35.74, lng: 139.62 },
  },
  {
    code: 'adachi',
    name: '足立区',
    nameKana: 'アダチク',
    bounds: { north: 35.80, south: 35.73, east: 139.85, west: 139.78 },
    center: { lat: 35.765, lng: 139.815 },
  },
  {
    code: 'katsushika',
    name: '葛飾区',
    nameKana: 'カツシカク',
    bounds: { north: 35.78, south: 35.70, east: 139.90, west: 139.83 },
    center: { lat: 35.74, lng: 139.865 },
  },
  {
    code: 'edogawa',
    name: '江戸川区',
    nameKana: 'エドガワク',
    bounds: { north: 35.73, south: 35.65, east: 139.90, west: 139.85 },
    center: { lat: 35.69, lng: 139.875 },
  },
];

/**
 * 区コードから区情報を取得
 */
export function getWardByCode(code: string): TokyoWard | undefined {
  return TOKYO_23_WARDS.find(ward => ward.code === code);
}

/**
 * 座標が指定された区の境界内にあるかチェック
 */
export function isPointInWard(lat: number, lng: number, ward: TokyoWard): boolean {
  return (
    lat >= ward.bounds.south &&
    lat <= ward.bounds.north &&
    lng >= ward.bounds.west &&
    lng <= ward.bounds.east
  );
}

/**
 * 座標から所属する区を判定
 */
export function getWardByLocation(lat: number, lng: number): TokyoWard | undefined {
  return TOKYO_23_WARDS.find(ward => isPointInWard(lat, lng, ward));
}

