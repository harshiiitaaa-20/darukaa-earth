import json
import math
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.models import Project, Site, SiteMetric, User


def seed_metrics_for_site(db: Session, site_id: int, months: int = 36):
    """Seed synthetic environmental time-series telemetry metrics for a site."""
    # Check if metrics already exist
    existing_count = db.query(SiteMetric).filter(SiteMetric.site_id == site_id).count()
    if existing_count >= months:
        return

    today = date.today()
    metrics_to_add = []

    # Environmental progression model params
    base_ndvi = 0.52
    base_canopy = 42.0
    base_carbon = 18.5
    base_soc = 35.0
    base_biodiversity = 5.4

    for i in range(months, -1, -1):
        record_date = today - timedelta(days=i * 30)
        t = (months - i) / 12.0  # Time in years

        # Seasonal Sine Fluctuations (Growth peak in summer/rainy season)
        season_phase = (record_date.month / 12.0) * 2 * math.pi
        seasonal_var = math.sin(season_phase) * 0.08

        # Growth trajectories
        ndvi = min(round(base_ndvi + (0.09 * t) + seasonal_var, 3), 0.96)
        canopy = min(round(base_canopy + (3.8 * t) + (seasonal_var * 15), 1), 94.0)
        carbon = round(base_carbon + (12.4 * (t ** 1.1)), 2)
        soc = round(base_soc + (2.1 * t), 2)
        biodiversity = min(round(base_biodiversity + (0.5 * t) + (seasonal_var * 0.3), 2), 9.8)

        metric = SiteMetric(
            site_id=site_id,
            recorded_at=record_date,
            ndvi=max(ndvi, 0.1),
            canopy_cover_pct=max(canopy, 5.0),
            carbon_sequestered_tco2=max(carbon, 0.0),
            soil_organic_carbon=max(soc, 0.0),
            biodiversity_index=max(biodiversity, 1.0)
        )
        metrics_to_add.append(metric)

    db.bulk_save_objects(metrics_to_add)
    db.commit()


def seed_initial_demo_data(db: Session):
    """Seed initial demo projects and sites for Darukaa.Earth platform."""
    # 1. Admin User
    user = db.query(User).filter(User.email == "admin@darukaa.earth").first()
    if not user:
        user = User(
            email="admin@darukaa.earth",
            full_name="Environmental Administrator",
            hashed_password=get_password_hash("Admin123!"),
            role="admin"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Check if projects exist
    if db.query(Project).count() > 0:
        return

    # Demo Project 1: Osa Peninsula Reforestation (Costa Rica)
    p1 = Project(
        name="Osa Rainforest Restoration Corridor",
        description="Restoring primary rainforest canopy and wildlife corridors between Corcovado National Park and Piedras Blancas.",
        project_type="Reforestation",
        country="Costa Rica",
        target_carbon_offset=45000.0,
        status="active",
        created_by_id=user.id
    )

    # Demo Project 2: Delta Mangrove Blue Carbon (Indonesia)
    p2 = Project(
        name="Mahakam Coastal Mangrove Blue Carbon",
        description="Restoring coastal mangrove wetland ecosystems in East Kalimantan to protect shorelines and capture soil carbon.",
        project_type="Blue Carbon",
        country="Indonesia",
        target_carbon_offset=82000.0,
        status="active",
        created_by_id=user.id
    )

    # Demo Project 3: Scottish Highland Peatland Reserve
    p3 = Project(
        name="Cairngorms Peatland Carbon Sink",
        description="Rewetting degraded blanket bogs across the Scottish Highlands to prevent carbon release and boost biodiversity.",
        project_type="Peatland",
        country="United Kingdom",
        target_carbon_offset=30000.0,
        status="active",
        created_by_id=user.id
    )

    db.add_all([p1, p2, p3])
    db.commit()
    db.refresh(p1)
    db.refresh(p2)
    db.refresh(p3)

    # Site Polygons (WGS84 EPSG:4326)
    poly_osa = {
        "type": "Polygon",
        "coordinates": [[
            [-83.52, 8.54],
            [-83.48, 8.54],
            [-83.48, 8.51],
            [-83.52, 8.51],
            [-83.52, 8.54]
        ]]
    }

    poly_indonesia = {
        "type": "Polygon",
        "coordinates": [[
            [117.25, -0.45],
            [117.29, -0.45],
            [117.29, -0.48],
            [117.25, -0.48],
            [117.25, -0.45]
        ]]
    }

    poly_scotland = {
        "type": "Polygon",
        "coordinates": [[
            [-3.65, 57.12],
            [-3.60, 57.12],
            [-3.60, 57.08],
            [-3.65, 57.08],
            [-3.65, 57.12]
        ]]
    }

    site1 = Site(
        project_id=p1.id,
        name="Sector A - Drake Bay Reserve",
        description="Lowland tropical rainforest plot with high species endemism.",
        area_hectares=1420.5,
        geometry_json=json.dumps(poly_osa)
    )

    site2 = Site(
        project_id=p2.id,
        name="Mahakam Estuary Plot Alpha",
        description="Rhizophora mangrove species zone with deep sediment carbon pools.",
        area_hectares=1860.0,
        geometry_json=json.dumps(poly_indonesia)
    )

    site3 = Site(
        project_id=p3.id,
        name="Rothiemurchus Moorland Site",
        description="Sphagnum moss peat bog with active re-wetting dams.",
        area_hectares=980.2,
        geometry_json=json.dumps(poly_scotland)
    )

    db.add_all([site1, site2, site3])
    db.commit()

    # Seed time-series metrics
    seed_metrics_for_site(db, site1.id, months=36)
    seed_metrics_for_site(db, site2.id, months=36)
    seed_metrics_for_site(db, site3.id, months=36)
