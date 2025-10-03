import { create } from 'zustand';
import type { DrawnFeature, MapFeatureStore } from '../types/feature';
import type { ShapeType } from '../config/constants';

export const useFeatureStore = create<MapFeatureStore>((set, get) => ({
  features: [],
  selectedTool: null,

  addFeature: (feature: DrawnFeature) => {
    set((state) => ({
      features: [...state.features, feature],
    }));
  },

  removeFeature: (id: string) => {
    set((state) => ({
      features: state.features.filter((f) => f.id !== id),
    }));
  },

  setSelectedTool: (tool: ShapeType | null) => {
    set({ selectedTool: tool });
  },

  clearAllFeatures: () => {
    set({ features: [] });
  },

  getFeaturesByType: (type: ShapeType) => {
    return get().features.filter((f) => f.type === type);
  },

  exportGeoJSON: () => {
    const features = get().features;
    return {
      type: 'FeatureCollection',
      features: features.map((f) => ({
        type: 'Feature',
        id: f.id,
        geometry: f.geometry,
        properties: {
          ...f.properties,
          shapeType: f.type,
        },
      })),
    } as GeoJSON.FeatureCollection;
  },
}));
