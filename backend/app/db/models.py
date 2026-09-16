from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="admin")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    projects = relationship("Project", back_populates="created_by", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    project_type = Column(String(100), nullable=False)  # Reforestation, Blue Carbon, Avoided Deforestation, Peatland
    country = Column(String(100), nullable=False)
    target_carbon_offset = Column(Float, default=0.0)  # in tCO2e
    status = Column(String(50), default="active")       # active, draft, verified
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    created_by = relationship("User", back_populates="projects")
    sites = relationship("Site", back_populates="project", cascade="all, delete-orphan")


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    area_hectares = Column(Float, nullable=False, default=0.0)
    geometry_json = Column(Text, nullable=False)  # GeoJSON Polygon string representation
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="sites")
    metrics = relationship("SiteMetric", back_populates="site", cascade="all, delete-orphan", order_by="SiteMetric.recorded_at.asc()")


class SiteMetric(Base):
    __tablename__ = "site_metrics"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = Column(Date, nullable=False, index=True)
    ndvi = Column(Float, nullable=False)                    # Normalized Difference Vegetation Index (0.0 to 1.0)
    canopy_cover_pct = Column(Float, nullable=False)        # Canopy Cover % (0 to 100)
    carbon_sequestered_tco2 = Column(Float, nullable=False) # Carbon stock sequestered (tCO2e / ha)
    soil_organic_carbon = Column(Float, nullable=False)     # Soil Organic Carbon (tonnes C / ha)
    biodiversity_index = Column(Float, nullable=False)       # Ecosystem Health / Biodiversity Score (0.0 to 10.0)

    site = relationship("Site", back_populates="metrics")
