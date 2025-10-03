import { Circle, Square, Pentagon, Minus } from 'lucide-react';
import { useFeatureStore } from '../store/featureStore';
import type { ShapeType } from '../config/constants';
import { SHAPE_LIMITS } from '../config/constants';

const tools: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
  { type: 'circle', label: 'Circle', icon: <Circle className="w-5 h-5" /> },
  { type: 'rectangle', label: 'Rectangle', icon: <Square className="w-5 h-5" /> },
  { type: 'polygon', label: 'Polygon', icon: <Pentagon className="w-5 h-5" /> },
  { type: 'lineString', label: 'Line', icon: <Minus className="w-5 h-5" /> },
];

export function DrawingToolbar() {
  const { selectedTool, setSelectedTool, getFeaturesByType } = useFeatureStore();

  const getToolStatus = (type: ShapeType) => {
    const count = getFeaturesByType(type).length;
    const limit = SHAPE_LIMITS[type];
    return { count, limit, disabled: count >= limit };
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-64">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Drawing Tools</h2>
      <div className="space-y-2">
        {tools.map((tool) => {
          const status = getToolStatus(tool.type);
          const isActive = selectedTool === tool.type;

          return (
            <button
              key={tool.type}
              onClick={() => setSelectedTool(isActive ? null : tool.type)}
              disabled={status.disabled && !isActive}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-500 text-white shadow-md'
                  : status.disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow'
              }`}
            >
              <div className="flex items-center gap-3">
                {tool.icon}
                <span className="font-medium">{tool.label}</span>
              </div>
              <span className="text-sm">
                {status.count}/{status.limit}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
