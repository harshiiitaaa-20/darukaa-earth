def test_list_projects(client):
    res = client.get("/api/v1/projects")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3  # Initial seeded projects


def test_create_project(client, admin_token):
    payload = {
        "name": "Amazon Reforestation Test",
        "description": "Restoring degraded pastureland in Pará state.",
        "project_type": "Reforestation",
        "country": "Brazil",
        "target_carbon_offset": 50000.0,
        "status": "active"
    }
    res = client.post(
        "/api/v1/projects",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 201
    assert res.json()["name"] == "Amazon Reforestation Test"
    assert res.json()["country"] == "Brazil"
