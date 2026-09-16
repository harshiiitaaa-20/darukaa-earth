from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator, ConfigDict


class GeoJSONPolygon(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]] = Field(
        ...,
        description="Coordinates of polygon ring [[ [lng, lat], [lng, lat], ... ]]"
    )

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v != "Polygon":
            raise ValueError("Geometry type must be 'Polygon'")
        return v

    @field_validator("coordinates")
    @classmethod
    def validate_coordinates(cls, v):
        if not v or len(v) == 0 or len(v[0]) < 4:
            raise ValueError("Polygon outer ring must contain at least 4 coordinate pairs (closed ring)")
        first = v[0][0]
        last = v[0][-1]
        if first != last:
            v[0].append(first)
        return v


class SiteCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    geometry: Dict[str, Any] = Field(..., description="GeoJSON Polygon geometry object")


class SiteResponse(BaseModel):
    id: int
    project_id: int
    name: str
    description: Optional[str] = None
    area_hectares: float
    geometry: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeatureProperties(BaseModel):
    id: int
    site_name: str
    project_id: int
    project_name: str
    area_hectares: float


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: int
    geometry: Dict[str, Any]
    properties: FeatureProperties


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
