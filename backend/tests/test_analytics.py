def test_get_site_analytics(client):
    # Fetch first site
    sites_res = client.get("/api/v1/sites/geojson")
    first_site_id = sites_res.json()["features"][0]["id"]

    res = client.get(f"/api/v1/sites/{first_site_id}/analytics?timeframe=ALL")
    assert res.status_code == 200
    data = res.json()
    assert data["site_id"] == first_site_id
    assert "summary" in data
    assert len(data["metrics"]) > 0
    assert data["summary"]["latest_ndvi"] > 0.0
    assert data["summary"]["total_carbon_sequestered_tco2"] > 0.0
