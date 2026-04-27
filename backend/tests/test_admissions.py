"""Tests for the /admissions endpoints."""

ADMISSION_PAYLOAD = {
    "father_name": "John Doe Sr.",
    "grade": "10",
    "contact_number": "0300-1234567",
    "address": "123 Main Street, Lahore",
}


def test_student_can_submit_admission(client, auth_headers):
    resp = client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=auth_headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["grade"] == "10"
    assert body["status"] == "pending"
    assert "id" in body


def test_admission_requires_auth(client):
    resp = client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD)
    assert resp.status_code == 401


def test_student_can_view_own_admissions(client, auth_headers):
    client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=auth_headers)
    resp = client.get("/api/v1/admissions/mine", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_student_cannot_list_all_admissions(client, auth_headers):
    resp = client.get("/api/v1/admissions/", headers=auth_headers)
    assert resp.status_code == 403


def test_admin_can_list_all_admissions(client, auth_headers, admin_headers):
    client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=auth_headers)
    resp = client.get("/api/v1/admissions/", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_admin_can_get_single_admission(client, auth_headers, admin_headers):
    create_resp = client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=auth_headers)
    admission_id = create_resp.json()["id"]

    resp = client.get(f"/api/v1/admissions/{admission_id}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == admission_id


def test_student_can_view_own_admission_by_id(client, auth_headers):
    create_resp = client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=auth_headers)
    admission_id = create_resp.json()["id"]

    resp = client.get(f"/api/v1/admissions/{admission_id}", headers=auth_headers)
    assert resp.status_code == 200


def test_student_cannot_view_other_students_admission(client, admin_headers):
    # Create a second student
    client.post("/api/v1/auth/signup", json={
        "full_name": "Other Student",
        "email": "other@test.com",
        "password": "pass123",
        "role": "standard",
    })
    login_resp = client.post("/api/v1/auth/login", data={
        "username": "other@test.com",
        "password": "pass123",
    })
    other_token = login_resp.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Other student submits an admission
    create_resp = client.post(
        "/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=other_headers
    )
    admission_id = create_resp.json()["id"]

    # Create a third student who tries to view it
    client.post("/api/v1/auth/signup", json={
        "full_name": "Spy Student",
        "email": "spy@test.com",
        "password": "spy123",
        "role": "standard",
    })
    spy_resp = client.post("/api/v1/auth/login", data={"username": "spy@test.com", "password": "spy123"})
    spy_headers = {"Authorization": f"Bearer {spy_resp.json()['access_token']}"}

    resp = client.get(f"/api/v1/admissions/{admission_id}", headers=spy_headers)
    assert resp.status_code == 403


def test_admin_can_approve_admission(client, auth_headers, admin_headers):
    create_resp = client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=auth_headers)
    admission_id = create_resp.json()["id"]

    resp = client.patch(
        f"/api/v1/admissions/{admission_id}",
        json={"status": "approved"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"


def test_admin_can_reject_admission(client, auth_headers, admin_headers):
    create_resp = client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=auth_headers)
    admission_id = create_resp.json()["id"]

    resp = client.patch(
        f"/api/v1/admissions/{admission_id}",
        json={"status": "rejected"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "rejected"


def test_patch_nonexistent_admission_returns_404(client, admin_headers):
    resp = client.patch("/api/v1/admissions/99999", json={"status": "approved"}, headers=admin_headers)
    assert resp.status_code == 404


def test_student_cannot_change_status(client, auth_headers):
    create_resp = client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=auth_headers)
    admission_id = create_resp.json()["id"]

    resp = client.patch(
        f"/api/v1/admissions/{admission_id}",
        json={"status": "approved"},
        headers=auth_headers,
    )
    assert resp.status_code == 403


def test_list_admissions_pagination(client, auth_headers, admin_headers):
    for _ in range(3):
        client.post("/api/v1/admissions/", json=ADMISSION_PAYLOAD, headers=auth_headers)

    resp = client.get("/api/v1/admissions/?skip=0&limit=2", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2
