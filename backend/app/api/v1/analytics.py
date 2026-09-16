from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.db.models import Site, SiteMetric
from app.schemas.analytics import SiteAnalyticsResponse, AnalyticsSummary, MetricPoint
from app.db.seed import seed_metrics_for_site

router = APIRouter(prefix="/sites", tags=["Analytics"])


@router.get("/{site_id}/analytics", response_model=SiteAnalyticsResponse)
def get_site_analytics(
    site_id: int,
    timeframe: str = Query("ALL", description="Timeframe filter: 1Y, 3Y, 5Y, or ALL"),
    db: Session = Depends(get_db)
):
    """Retrieve time-series carbon and biodiversity metrics for a specific site."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found."
        )

    # Ensure site has metrics (auto-seed if empty)
    metrics_query = db.query(SiteMetric).filter(SiteMetric.site_id == site_id)
    if metrics_query.count() == 0:
        seed_metrics_for_site(db, site_id, months=36)
        metrics_query = db.query(SiteMetric).filter(SiteMetric.site_id == site_id)

    # Apply date filters based on timeframe query
    today = date.today()
    if timeframe == "1Y":
        cutoff = today - timedelta(days=365)
        metrics_query = metrics_query.filter(SiteMetric.recorded_at >= cutoff)
    elif timeframe == "3Y":
        cutoff = today - timedelta(days=365 * 3)
        metrics_query = metrics_query.filter(SiteMetric.recorded_at >= cutoff)
    elif timeframe == "5Y":
        cutoff = today - timedelta(days=365 * 5)
        metrics_query = metrics_query.filter(SiteMetric.recorded_at >= cutoff)

    metrics_list = metrics_query.order_by(SiteMetric.recorded_at.asc()).all()

    if not metrics_list:
        summary = AnalyticsSummary(
            latest_ndvi=0.0,
            latest_canopy_cover=0.0,
            total_carbon_sequestered_tco2=0.0,
            latest_soil_organic_carbon=0.0,
            latest_biodiversity_index=0.0,
            ndvi_trend_pct=0.0,
            carbon_trend_pct=0.0,
            data_points_count=0
        )
        return SiteAnalyticsResponse(
            site_id=site.id,
            site_name=site.name,
            project_id=site.project_id,
            project_name=site.project.name if site.project else "N/A",
            area_hectares=site.area_hectares,
            summary=summary,
            metrics=[]
        )

    # Calculate summary indicators & growth trends
    latest = metrics_list[-1]
    first = metrics_list[0]

    # Calculate total carbon sequestered across the site (tCO2e / ha * area_hectares)
    total_carbon = round(latest.carbon_sequestered_tco2 * site.area_hectares, 2)

    # Growth trend percentages
    ndvi_trend = round(((latest.ndvi - first.ndvi) / first.ndvi) * 100.0, 1) if first.ndvi > 0 else 0.0
    carbon_trend = round(((latest.carbon_sequestered_tco2 - first.carbon_sequestered_tco2) / first.carbon_sequestered_tco2) * 100.0, 1) if first.carbon_sequestered_tco2 > 0 else 0.0

    summary = AnalyticsSummary(
        latest_ndvi=latest.ndvi,
        latest_canopy_cover=latest.canopy_cover_pct,
        total_carbon_sequestered_tco2=total_carbon,
        latest_soil_organic_carbon=latest.soil_organic_carbon,
        latest_biodiversity_index=latest.biodiversity_index,
        ndvi_trend_pct=ndvi_trend,
        carbon_trend_pct=carbon_trend,
        data_points_count=len(metrics_list)
    )

    metric_points = [
        MetricPoint(
            recorded_at=m.recorded_at,
            ndvi=m.ndvi,
            canopy_cover_pct=m.canopy_cover_pct,
            carbon_sequestered_tco2=m.carbon_sequestered_tco2,
            soil_organic_carbon=m.soil_organic_carbon,
            biodiversity_index=m.biodiversity_index
        )
        for m in metrics_list
    ]

    return SiteAnalyticsResponse(
        site_id=site.id,
        site_name=site.name,
        project_id=site.project_id,
        project_name=site.project.name if site.project else "N/A",
        area_hectares=site.area_hectares,
        summary=summary,
        metrics=metric_points
    )


@router.post("/{site_id}/analytics/seed")
def seed_site_analytics(
    site_id: int,
    months: int = Query(36, ge=12, le=120),
    db: Session = Depends(get_db)
):
    """Seed multi-year synthetic telemetry metrics for a site."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Site with ID {site_id} not found."
        )

    seed_metrics_for_site(db, site_id, months=months)
    return {"status": "success", "message": f"Seeded {months} months of metrics for site {site_id}"}
