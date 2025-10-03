export const MAP_CONFIG = {
  center: { lat: 51.505, lng: -0.09 },
  zoom: 13,
  minZoom: 3,
  maxZoom: 18,
} as const;

export const SHAPE_LIMITS = {
  circle: 10,
  rectangle: 10,
  polygon: 10,
  lineString: 5,
} as const;

export const SHAPE_COLORS = {
  circle: '#3b82f6',
  rectangle: '#10b981',
  polygon: '#f59e0b',
  lineString: '#ef4444',
} as const;

export type ShapeType = 'circle' | 'rectangle' | 'polygon' | 'lineString';
