import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { MAP_CONFIG, SHAPE_COLORS, SHAPE_LIMITS } from '../config/constants';
import { useFeatureStore } from '../store/featureStore';
import type { DrawnFeature } from '../types/feature';
import {
  checkOverlap,
  trimOverlappingPolygon,
  convertCircleToPolygon,
  convertRectangleToPolygon,
  isPolygonalFeature,
} from '../utils/geometryUtils';

export function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const drawnLayersRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  const { features, selectedTool, addFeature, setSelectedTool, getFeaturesByType } =
    useFeatureStore();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [MAP_CONFIG.center.lat, MAP_CONFIG.center.lng],
      MAP_CONFIG.zoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
    }).addTo(map);

    drawnLayersRef.current.addTo(map);
    mapRef.current = map;

    map.on('draw:created', handleDrawCreated);

    return () => {
      map.off('draw:created', handleDrawCreated);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update draw control when tool changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (drawControlRef.current) {
      mapRef.current.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (selectedTool) {
      const drawOptions: L.Control.DrawConstructorOptions = {
        draw: {
          polyline:
            selectedTool === 'lineString'
              ? { shapeOptions: { color: '#FF0000', weight: 4 } } // red line, visible
              : false,
          polygon:
            selectedTool === 'polygon'
              ? { shapeOptions: { color: SHAPE_COLORS.polygon, weight: 2, fillOpacity: 0.3 } }
              : false,
          rectangle:
            selectedTool === 'rectangle'
              ? { shapeOptions: { color: SHAPE_COLORS.rectangle, weight: 2, fillOpacity: 0.3 }, showArea: true }
              : false,
          circle:
            selectedTool === 'circle'
              ? { shapeOptions: { color: SHAPE_COLORS.circle, weight: 2, fillOpacity: 0.3 } }
              : false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnLayersRef.current,
          remove: false,
        },
      };

      const drawControl = new L.Control.Draw(drawOptions);
      mapRef.current.addControl(drawControl);
      drawControlRef.current = drawControl;
    }
  }, [selectedTool]);

  // Render features on map
  useEffect(() => {
    const layerGroup = drawnLayersRef.current;
    layerGroup.clearLayers();

    features.forEach((feature) => {
      const geojsonLayer = L.geoJSON(feature.geometry, {
        style: {
          color: feature.properties.color,
          fillColor: feature.properties.color,
          fillOpacity: 0.4,
          weight: feature.type === 'lineString' ? 4 : 2, // make lines thicker
        },
      });

      geojsonLayer.bindPopup(`
        <div>
          <strong>${feature.properties.name}</strong><br/>
          Type: ${feature.type}<br/>
          Created: ${new Date(feature.properties.createdAt).toLocaleString()}
        </div>
      `);

      geojsonLayer.addTo(layerGroup);
    });
  }, [features]);

  const handleDrawCreated = (event: L.DrawEvents.Created) => {
    setError(null);

    const layer = event.layer;
    const layerType = event.layerType as string;

    let geometry: GeoJSON.Geometry;
    let shapeType = selectedTool!;
    let color = SHAPE_COLORS[shapeType];

    if (layerType === 'polyline') {
      const polyline = layer as L.Polyline;
      const latlngs = polyline.getLatLngs() as L.LatLng[];
      geometry = {
        type: 'LineString',
        coordinates: latlngs.map((ll) => [ll.lng, ll.lat]),
      };
      shapeType = 'lineString';
      color = '#FF0000'; // make line red for visibility
    } else if (layerType === 'polygon') {
      const polygon = layer as L.Polygon;
      const latlngs = polygon.getLatLngs()[0] as L.LatLng[];
      geometry = {
        type: 'Polygon',
        coordinates: [latlngs.map((ll) => [ll.lng, ll.lat])],
      };
      shapeType = 'polygon';
    } else if (layerType === 'rectangle') {
      const rectangle = layer as L.Rectangle;
      const bounds = rectangle.getBounds();
      geometry = convertRectangleToPolygon([
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()],
      ]);
      shapeType = 'rectangle';
    } else if (layerType === 'circle') {
      const circle = layer as L.Circle;
      const center = circle.getLatLng();
      const radius = circle.getRadius();
      geometry = convertCircleToPolygon([center.lng, center.lat], radius);
      shapeType = 'circle';
    } else {
      return;
    }

    const existingCount = getFeaturesByType(shapeType).length;
    const limit = SHAPE_LIMITS[shapeType];

    if (existingCount >= limit) {
      setError(`Maximum limit of ${limit} ${shapeType}s reached.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (isPolygonalFeature(shapeType)) {
      const { hasOverlap, isFullyEnclosed } = checkOverlap(geometry, features);

      if (isFullyEnclosed) {
        setError('Cannot create polygon: it fully encloses an existing polygon.');
        setTimeout(() => setError(null), 3000);
        return;
      }

      if (hasOverlap) {
        const trimmedGeometry = trimOverlappingPolygon(geometry, features);

        if (!trimmedGeometry) {
          setError('Cannot create polygon: overlap cannot be resolved.');
          setTimeout(() => setError(null), 3000);
          return;
        }

        geometry = trimmedGeometry;
      }
    }

    const feature: DrawnFeature = {
      id: `${shapeType}-${Date.now()}-${Math.random()}`,
      type: shapeType,
      geometry,
      properties: {
        name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${existingCount + 1}`,
        color,
        createdAt: new Date().toISOString(),
      },
    };

    addFeature(feature);
    setSelectedTool(null);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          {error}
        </div>
      )}
    </div>
  );
}
