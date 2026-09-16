from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    project_type: str = Field(...)
    country: str = Field(...)
    target_carbon_offset: float = Field(0.0, ge=0.0, description="Target carbon offset in tCO2e")
    status: str = Field("active")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    project_type: Optional[str] = None
    country: Optional[str] = None
    target_carbon_offset: Optional[float] = None
    status: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: int
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    site_count: int = 0
    total_area_hectares: float = 0.0

    model_config = ConfigDict(from_attributes=True)
