def test_register_and_login(client):
    # Test Register
    reg_payload = {
        "email": "newuser@darukaa.earth",
        "password": "Password123!",
        "full_name": "New Scientist"
    }
    res_reg = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    assert res_reg.json()["email"] == "newuser@darukaa.earth"

    # Test Login
    login_payload = {
        "email": "newuser@darukaa.earth",
        "password": "Password123!"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    assert token is not None

    # Test Me endpoint with JWT
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["full_name"] == "New Scientist"


def test_invalid_login(client):
    res = client.post("/api/v1/auth/login", json={"email": "wrong@darukaa.earth", "password": "wrong"})
    assert res.status_code == 401
