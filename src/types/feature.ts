import type { ShapeType } from '../config/constants';

export interface DrawnFeature {
  id: string;
  type: ShapeType;
  geometry: GeoJSON.Geometry;
  properties: {
    name: string;
    color: string;
    createdAt: string;
  };
}

export interface MapFeatureStore {
  features: DrawnFeature[];
  selectedTool: ShapeType | null;
  addFeature: (feature: DrawnFeature) => void;
  removeFeature: (id: string) => void;
  setSelectedTool: (tool: ShapeType | null) => void;
  clearAllFeatures: () => void;
  getFeaturesByType: (type: ShapeType) => DrawnFeature[];
  exportGeoJSON: () => GeoJSON.FeatureCollection;
}
