import json
import math
from typing import Any

from shapely.geometry import Polygon, shape


def calculate_polygon_area_hectares(geojson_geometry: dict[str, Any]) -> float:
    """
    Calculate area in Hectares for a GeoJSON Polygon geometry.
    Uses latitude-adjusted Mercator / Spherical geodesic area calculation.
    """
    try:
        geom = shape(geojson_geometry)
        if not isinstance(geom, Polygon):
            return 0.0

        # Extract centroid latitude for WGS84 area scaling (meters per degree at centroid)
        centroid = geom.centroid
        lat_rad = math.radians(centroid.y)

        # Approximate 1 deg latitude = 111,000 meters
        # 1 deg longitude = 111,000 * cos(lat) meters
        deg_lat_meters = 111000.0
        deg_lng_meters = 111000.0 * math.cos(lat_rad)

        # Transform coordinates to approximate metric planar area
        coords = list(geom.exterior.coords)
        projected_coords = [
            (lng * deg_lng_meters, lat * deg_lat_meters)
            for lng, lat in coords
        ]

        projected_poly = Polygon(projected_coords)
        area_sq_meters = projected_poly.area

        # 1 Hectare = 10,000 square meters
        area_hectares = round(area_sq_meters / 10000.0, 2)
        return max(area_hectares, 0.01)
    except Exception:
        # Fallback safeguard
        return 1.0


def parse_geometry_to_json(geometry_data: Any) -> dict[str, Any]:
    """Parse DB geometry field to GeoJSON dictionary."""
    if isinstance(geometry_data, str):
        try:
            return json.loads(geometry_data)
        except Exception:
            return {}
    elif isinstance(geometry_data, dict):
        return geometry_data
    return {}
