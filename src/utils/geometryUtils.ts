import * as turf from '@turf/turf';
import type { DrawnFeature } from '../types/feature';

export function isPolygonalFeature(type: string): boolean {
  return ['circle', 'rectangle', 'polygon'].includes(type);
}

export function checkOverlap(
  newGeometry: GeoJSON.Geometry,
  existingFeatures: DrawnFeature[]
): { hasOverlap: boolean; isFullyEnclosed: boolean; overlappingFeatures: DrawnFeature[] } {
  const polygonalFeatures = existingFeatures.filter((f) => isPolygonalFeature(f.type));

  if (polygonalFeatures.length === 0) {
    return { hasOverlap: false, isFullyEnclosed: false, overlappingFeatures: [] };
  }

  const newPolygon = turf.polygon(
    (newGeometry as GeoJSON.Polygon).coordinates as number[][][]
  );

  const overlappingFeatures: DrawnFeature[] = [];
  let isFullyEnclosed = false;

  for (const feature of polygonalFeatures) {
    const existingPolygon = turf.polygon(
      (feature.geometry as GeoJSON.Polygon).coordinates as number[][][]
    );

    const intersection = turf.intersect(
      turf.featureCollection([newPolygon, existingPolygon])
    );

    if (intersection) {
      overlappingFeatures.push(feature);

      const newArea = turf.area(newPolygon);
      const intersectionArea = turf.area(intersection);

      if (Math.abs(newArea - intersectionArea) < 0.01) {
        isFullyEnclosed = true;
        break;
      }
    }
  }

  return {
    hasOverlap: overlappingFeatures.length > 0,
    isFullyEnclosed,
    overlappingFeatures,
  };
}

export function trimOverlappingPolygon(
  newGeometry: GeoJSON.Geometry,
  existingFeatures: DrawnFeature[]
): GeoJSON.Geometry | null {
  const polygonalFeatures = existingFeatures.filter((f) => isPolygonalFeature(f.type));

  if (polygonalFeatures.length === 0) {
    return newGeometry;
  }

  let trimmedPolygon = turf.polygon(
    (newGeometry as GeoJSON.Polygon).coordinates as number[][][]
  );

  for (const feature of polygonalFeatures) {
    const existingPolygon = turf.polygon(
      (feature.geometry as GeoJSON.Polygon).coordinates as number[][][]
    );

    try {
      const difference = turf.difference(
        turf.featureCollection([trimmedPolygon, existingPolygon])
      );

      if (!difference) {
        return null;
      }

      trimmedPolygon = difference as turf.Feature<turf.Polygon>;
    } catch (error) {
      console.error('Error trimming polygon:', error);
      return null;
    }
  }

  return trimmedPolygon.geometry;
}

export function convertCircleToPolygon(
  center: [number, number],
  radius: number,
  steps: number = 64
): GeoJSON.Polygon {
  const circleFeature = turf.circle(center, radius, { steps, units: 'meters' });
  return circleFeature.geometry;
}

export function convertRectangleToPolygon(
  bounds: [[number, number], [number, number]]
): GeoJSON.Polygon {
  const [[west, south], [east, north]] = bounds;

  return {
    type: 'Polygon',
    coordinates: [[
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ]],
  };
}
