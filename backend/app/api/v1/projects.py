
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.db.models import Project, Site, User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    search: str | None = Query(None, description="Search by project name or country"),
    project_type: str | None = Query(None, description="Filter by project type"),
    status_filter: str | None = Query(None, alias="status", description="Filter by status"),
    db: Session = Depends(get_db)
):
    """Retrieve all projects with site count and spatial area summary."""
    query = db.query(Project)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Project.name.ilike(search_pattern)) |
            (Project.country.ilike(search_pattern)) |
            (Project.description.ilike(search_pattern))
        )
    if project_type:
        query = query.filter(Project.project_type == project_type)
    if status_filter:
        query = query.filter(Project.status == status_filter)

    projects = query.order_by(Project.created_at.desc()).all()

    result = []
    for proj in projects:
        site_count = db.query(func.count(Site.id)).filter(Site.project_id == proj.id).scalar() or 0
        total_area = db.query(func.sum(Site.area_hectares)).filter(Site.project_id == proj.id).scalar() or 0.0

        proj_dict = ProjectResponse(
            id=proj.id,
            name=proj.name,
            description=proj.description,
            project_type=proj.project_type,
            country=proj.country,
            target_carbon_offset=proj.target_carbon_offset,
            status=proj.status,
            created_by_id=proj.created_by_id,
            created_at=proj.created_at,
            updated_at=proj.updated_at,
            site_count=site_count,
            total_area_hectares=round(total_area, 2)
        )
        result.append(proj_dict)
    return result


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new carbon/biodiversity project."""
    project = Project(
        name=project_in.name,
        description=project_in.description,
        project_type=project_in.project_type,
        country=project_in.country,
        target_carbon_offset=project_in.target_carbon_offset,
        status=project_in.status,
        created_by_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        country=project.country,
        target_carbon_offset=project.target_carbon_offset,
        status=project.status,
        created_by_id=project.created_by_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
        site_count=0,
        total_area_hectares=0.0
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get project details by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )

    site_count = db.query(func.count(Site.id)).filter(Site.project_id == project.id).scalar() or 0
    total_area = db.query(func.sum(Site.area_hectares)).filter(Site.project_id == project.id).scalar() or 0.0

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        country=project.country,
        target_carbon_offset=project.target_carbon_offset,
        status=project.status,
        created_by_id=project.created_by_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
        site_count=site_count,
        total_area_hectares=round(total_area, 2)
    )


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project metadata."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )

    update_data = project_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    site_count = db.query(func.count(Site.id)).filter(Site.project_id == project.id).scalar() or 0
    total_area = db.query(func.sum(Site.area_hectares)).filter(Site.project_id == project.id).scalar() or 0.0

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        project_type=project.project_type,
        country=project.country,
        target_carbon_offset=project.target_carbon_offset,
        status=project.status,
        created_by_id=project.created_by_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
        site_count=site_count,
        total_area_hectares=round(total_area, 2)
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete project and associated sites."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found."
        )
    db.delete(project)
    db.commit()
