from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: str | None = None
    project_type: str = Field(...)
    country: str = Field(...)
    target_carbon_offset: float = Field(0.0, ge=0.0, description="Target carbon offset in tCO2e")
    status: str = Field("active")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    project_type: str | None = None
    country: str | None = None
    target_carbon_offset: float | None = None
    status: str | None = None


class ProjectResponse(ProjectBase):
    id: int
    created_by_id: int | None = None
    created_at: datetime
    updated_at: datetime
    site_count: int = 0
    total_area_hectares: float = 0.0

    model_config = ConfigDict(from_attributes=True)
