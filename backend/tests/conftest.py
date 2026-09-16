import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.db.seed import seed_initial_demo_data
from app.main import app

# In-memory SQLite DB for fast unit tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    seed_initial_demo_data(session)
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def _get_test_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _get_test_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_token(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@darukaa.earth", "password": "Admin123!"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]
