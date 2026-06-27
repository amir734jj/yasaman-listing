// Simplified Iran national outline (lon, lat), bundled locally so the map view makes no
// external/CDN requests. Source: simplified public-domain country polygon (75 points).

export const IRAN_BBOX = { minLon: 44.109, maxLon: 63.317, minLat: 25.078, maxLat: 39.713 };

const MID_LAT_RAD = (((IRAN_BBOX.minLat + IRAN_BBOX.maxLat) / 2) * Math.PI) / 180;
const LON_SCALE = Math.cos(MID_LAT_RAD);

/** Logical view width; height keeps Iran's real-world proportions. */
export const VIEW_WIDTH = 1000;
export const VIEW_HEIGHT =
  (VIEW_WIDTH / ((IRAN_BBOX.maxLon - IRAN_BBOX.minLon) * LON_SCALE)) *
  (IRAN_BBOX.maxLat - IRAN_BBOX.minLat);

const UNIT = VIEW_WIDTH / ((IRAN_BBOX.maxLon - IRAN_BBOX.minLon) * LON_SCALE);

/** Projects geographic lon/lat into the local SVG view coordinate space. */
export function projectToView(lon: number, lat: number): { x: number; y: number } {
  return {
    x: (lon - IRAN_BBOX.minLon) * LON_SCALE * UNIT,
    y: (IRAN_BBOX.maxLat - lat) * UNIT,
  };
}

export const iranOutline: ReadonlyArray<readonly [number, number]> = [
  [53.9216, 37.1989],
  [54.8003, 37.3924],
  [55.5116, 37.9641],
  [56.1804, 37.9351],
  [56.6194, 38.1214],
  [57.3304, 38.0292],
  [58.4362, 37.5223],
  [59.2348, 37.413],
  [60.3776, 36.5274],
  [61.1231, 36.4916],
  [61.2108, 35.6501],
  [60.8032, 34.4041],
  [60.5284, 33.6764],
  [60.9637, 33.5288],
  [60.5361, 32.9813],
  [60.8637, 32.1829],
  [60.9419, 31.5481],
  [61.6993, 31.3795],
  [61.7812, 30.7358],
  [60.8742, 29.8292],
  [61.3693, 29.3033],
  [61.7719, 28.6993],
  [62.7278, 28.2596],
  [62.7554, 27.3789],
  [63.2339, 27.217],
  [63.3166, 26.7565],
  [61.8742, 26.24],
  [61.4974, 25.0782],
  [59.6161, 25.3802],
  [58.5258, 25.61],
  [57.3973, 25.7399],
  [56.9708, 26.9661],
  [56.4921, 27.1433],
  [55.7237, 26.9646],
  [54.7151, 26.4807],
  [53.4931, 26.8124],
  [52.4836, 27.5808],
  [51.5208, 27.8657],
  [50.8529, 28.8145],
  [50.115, 30.1478],
  [49.5768, 29.9857],
  [48.9413, 30.3171],
  [48.568, 29.9268],
  [48.0146, 30.4525],
  [48.0047, 30.9851],
  [47.6853, 30.9849],
  [47.8492, 31.7092],
  [47.3347, 32.4692],
  [46.1094, 33.0173],
  [45.4167, 33.9678],
  [45.6485, 34.7481],
  [46.1518, 35.0933],
  [46.0763, 35.6774],
  [45.4206, 35.9775],
  [44.7727, 37.1704],
  [44.2258, 37.9716],
  [44.4214, 38.2813],
  [44.1092, 39.4281],
  [44.794, 39.713],
  [44.9527, 39.3358],
  [45.4577, 38.8741],
  [46.1436, 38.7412],
  [46.5057, 38.7706],
  [47.6851, 39.5084],
  [48.0601, 39.5822],
  [48.3555, 39.2888],
  [48.0107, 38.794],
  [48.6344, 38.2704],
  [48.8832, 38.3202],
  [49.1996, 37.5829],
  [50.1478, 37.3746],
  [50.8424, 36.8728],
  [52.264, 36.7004],
  [53.8258, 36.965],
  [53.9216, 37.1989],
];
