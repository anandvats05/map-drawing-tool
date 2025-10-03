import { MapView } from './components/MapView';
import { DrawingToolbar } from './components/DrawingToolbar';
import { FeatureList } from './components/FeatureList';
import { ExportButton } from './components/ExportButton';
import { Map } from 'lucide-react';

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">GeoFeature Mapper</h1>
              <p className="text-sm text-gray-500">Draw and manage geometrical features on OpenStreetMap</p>
            </div>
          </div>
          <ExportButton />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-auto p-4 space-y-4 overflow-y-auto bg-gray-50">
          <DrawingToolbar />
          <FeatureList />
        </aside>

        <section className="flex-1">
          <MapView />
        </section>
      </main>
    </div>
  );
}

export default App;
