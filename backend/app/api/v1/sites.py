import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.db.models import Project, Site, User
from app.schemas.site import SiteCreate, SiteResponse, GeoJSONFeatureCollection, GeoJSONFeature, FeatureProperties
from app.services.spatial import calculate_polygon_area_hectares, parse_geometry_to_json
from app.db.seed import seed_metrics_for_site

router = APIRouter(tags=["Sites"])


@router.get("/sites/geojson", response_model=GeoJSONFeatureCollection)
def list_all_sites_geojson(db: Session = Depends(get_db)):
    """Return all sites across all projects as a GeoJSON FeatureCollection for Mapbox GL JS."""
    sites = db.query(Site).all()
    features = []
    
    for s in sites:
        geom_dict = parse_geometry_to_json(s.geometry_json)
        proj_name = s.project.name if s.project else "Unknown Project"
        
        feature = GeoJSONFeature(
            type="Feature",
            id=s.id,
            geometry=geom_dict,
            properties=FeatureProperties(
                id=s.id,
                site_name=s.name,
                project_id=s.project_id,
                project_name=proj_name,
                area_hectares=s.area_hectares
            )
        )
        features.append(feature)
        
    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)


@router.get("/projects/{project_id}/sites", response_model=List[SiteResponse])
def get_project_sites(project_id: int, db: Session = Depends(get_db)):
    """Get all sites for a specific project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )
        
    sites = db.query(Site).filter(Site.project_id == project_id).all()
    result = []
    for s in sites:
        geom_dict = parse_geometry_to_json(s.geometry_json)
        result.append(SiteResponse(
            id=s.id,
            project_id=s.project_id,
            name=s.name,
            description=s.description,
            area_hectares=s.area_hectares,
            geometry=geom_dict,
            created_at=s.created_at
        ))
    return result


@router.post("/projects/{project_id}/sites", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site_for_project(
    project_id: int,
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new geographical site polygon to a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )

    # Validate and calculate polygon surface area in hectares
    area_ha = calculate_polygon_area_hectares(site_in.geometry)
    geom_str = json.dumps(site_in.geometry)

    site = Site(
        project_id=project_id,
        name=site_in.name,
        description=site_in.description,
        area_hectares=area_ha,
        geometry_json=geom_str
    )
    db.add(site)
    db.commit()
    db.refresh(site)

    # Automatically seed multi-year synthetic environmental telemetry metrics for instant analysis
    seed_metrics_for_site(db, site.id, months=24)

    return SiteResponse(
        id=site.id,
        project_id=site.project_id,
        name=site.name,
        description=site.description,
        area_hectares=site.area_hectares,
        geometry=site_in.geometry,
        created_at=site.created_at
    )


@router.get("/sites/{site_id}", response_model=SiteResponse)
def get_site(site_id: int, db: Session = Depends(get_db)):
    """Get site details by ID."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found."
        )
    geom_dict = parse_geometry_to_json(site.geometry_json)
    return SiteResponse(
        id=site.id,
        project_id=site.project_id,
        name=site.name,
        description=site.description,
        area_hectares=site.area_hectares,
        geometry=geom_dict,
        created_at=site.created_at
    )


@router.delete("/sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a site by ID."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found."
        )
    db.delete(site)
    db.commit()
    return None
