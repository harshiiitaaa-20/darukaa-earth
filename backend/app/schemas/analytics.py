from datetime import date

from pydantic import BaseModel, ConfigDict


class MetricPoint(BaseModel):
    recorded_at: date
    ndvi: float
    canopy_cover_pct: float
    carbon_sequestered_tco2: float
    soil_organic_carbon: float
    biodiversity_index: float

    model_config = ConfigDict(from_attributes=True)


class AnalyticsSummary(BaseModel):
    latest_ndvi: float
    latest_canopy_cover: float
    total_carbon_sequestered_tco2: float
    latest_soil_organic_carbon: float
    latest_biodiversity_index: float
    ndvi_trend_pct: float
    carbon_trend_pct: float
    data_points_count: int


class SiteAnalyticsResponse(BaseModel):
    site_id: int
    site_name: str
    project_id: int
    project_name: str
    area_hectares: float
    summary: AnalyticsSummary
    metrics: list[MetricPoint]
