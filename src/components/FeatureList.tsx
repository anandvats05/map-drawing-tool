import { Trash2, Layers } from 'lucide-react';
import { useFeatureStore } from '../store/featureStore';

export function FeatureList() {
  const { features, removeFeature, clearAllFeatures } = useFeatureStore();

  if (features.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-4 w-64">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Features</h2>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">No features drawn yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-64 max-h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Features</h2>
        </div>
        <span className="text-sm text-gray-500">{features.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: feature.properties.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {feature.properties.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{feature.type}</p>
              </div>
            </div>
            <button
              onClick={() => removeFeature(feature.id)}
              className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
              title="Delete feature"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={clearAllFeatures}
        className="w-full py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
      >
        Clear All
      </button>
    </div>
  );
}
