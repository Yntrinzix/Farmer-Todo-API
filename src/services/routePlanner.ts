export interface Location {
  id: string;
  latitude: number;
  longitude: number;
}

interface RouteResult {
  route: readonly Location[];
  totalDistance: number;
}

const toRad = (deg: number): number => (deg * Math.PI) / 180;

// Haversine: real great-circle distance between two GPS points in km
export const haversineDistance = (a: Location, b: Location): number => {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Find nearest unvisited location by index
const findNearest = (
  current: Location,
  locations: readonly Location[],
  visited: ReadonlySet<number>
): { index: number; distance: number } =>
  locations.reduce(
    (best, loc, i) => {
      if (visited.has(i)) return best;
      const dist = haversineDistance(current, loc);
      return dist < best.distance ? { index: i, distance: dist } : best;
    },
    { index: -1, distance: Infinity }
  );

// Recursive nearest-neighbor TSP heuristic
const buildRoute = (
  locations: readonly Location[],
  visited: ReadonlySet<number>,
  currentIdx: number,
  route: readonly Location[],
  totalDistance: number
): RouteResult => {
  if (visited.size === locations.length) return { route, totalDistance };
  const nearest = findNearest(locations[currentIdx], locations, visited);
  return buildRoute(
    locations,
    new Set([...visited, nearest.index]),
    nearest.index,
    [...route, locations[nearest.index]],
    totalDistance + nearest.distance
  );
};

export const planRoute = (locations: readonly Location[]): RouteResult => {
  if (locations.length <= 1) return { route: [...locations], totalDistance: 0 };
  return buildRoute(locations, new Set([0]), 0, [locations[0]], 0);
};
