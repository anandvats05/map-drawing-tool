import { Download } from 'lucide-react';
import { useFeatureStore } from '../store/featureStore';

export function ExportButton() {
  const { exportGeoJSON, features } = useFeatureStore();

  const handleExport = () => {
    const geojson = exportGeoJSON();
    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `map-features-${Date.now()}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={features.length === 0}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        features.length === 0
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
      }`}
    >
      <Download className="w-5 h-5" />
      Export GeoJSON
    </button>
  );
}
