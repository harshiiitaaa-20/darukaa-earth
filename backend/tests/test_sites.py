def test_get_sites_geojson(client):
    res = client.get("/api/v1/sites/geojson")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 3


def test_create_site_with_polygon(client, admin_token):
    # First get existing project ID
    proj_res = client.get("/api/v1/projects")
    proj_id = proj_res.json()[0]["id"]

    site_payload = {
        "name": "New Test Polygon Site",
        "description": "Test site with area calculation.",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-83.50, 8.53],
                [-83.47, 8.53],
                [-83.47, 8.50],
                [-83.50, 8.50],
                [-83.50, 8.53]
            ]]
        }
    }
    res = client.post(
        f"/api/v1/projects/{proj_id}/sites",
        json=site_payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "New Test Polygon Site"
    assert data["area_hectares"] > 0.0
