"""Tests for the /content endpoints."""

CONTENT_PAYLOAD = {
    "title": "Introduction to Algebra",
    "description": "Basics of algebra for Grade 9",
    "content_type": "pdf",
    "file_source": "https://storage.example.com/algebra-intro.pdf",
    "target_grade": "9",
}


def test_admin_can_create_content(client, admin_headers):
    resp = client.post("/api/v1/content/", json=CONTENT_PAYLOAD, headers=admin_headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "Introduction to Algebra"
    assert body["target_grade"] == "9"
    assert "id" in body


def test_student_cannot_create_content(client, auth_headers):
    resp = client.post("/api/v1/content/", json=CONTENT_PAYLOAD, headers=auth_headers)
    assert resp.status_code == 403


def test_create_content_requires_auth(client):
    resp = client.post("/api/v1/content/", json=CONTENT_PAYLOAD)
    assert resp.status_code == 401


def test_student_can_list_content(client, admin_headers, auth_headers):
    client.post("/api/v1/content/", json=CONTENT_PAYLOAD, headers=admin_headers)
    resp = client.get("/api/v1/content/", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_list_content_requires_auth(client):
    resp = client.get("/api/v1/content/")
    assert resp.status_code == 401


def test_filter_content_by_grade(client, admin_headers, auth_headers):
    client.post("/api/v1/content/", json=CONTENT_PAYLOAD, headers=admin_headers)
    client.post("/api/v1/content/", json={**CONTENT_PAYLOAD, "target_grade": "10"}, headers=admin_headers)

    resp = client.get("/api/v1/content/?grade=9", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()
    assert all(i["target_grade"] == "9" for i in items)


def test_filter_content_by_type(client, admin_headers, auth_headers):
    client.post("/api/v1/content/", json=CONTENT_PAYLOAD, headers=admin_headers)
    client.post(
        "/api/v1/content/",
        json={**CONTENT_PAYLOAD, "content_type": "video", "title": "Video Lesson"},
        headers=admin_headers,
    )
    resp = client.get("/api/v1/content/?content_type=video", headers=auth_headers)
    assert resp.status_code == 200
    assert all(i["content_type"] == "video" for i in resp.json())


def test_get_single_content_item(client, admin_headers, auth_headers):
    create_resp = client.post("/api/v1/content/", json=CONTENT_PAYLOAD, headers=admin_headers)
    content_id = create_resp.json()["id"]

    resp = client.get(f"/api/v1/content/{content_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == content_id


def test_get_nonexistent_content_returns_404(client, auth_headers):
    resp = client.get("/api/v1/content/99999", headers=auth_headers)
    assert resp.status_code == 404


def test_admin_can_update_content(client, admin_headers):
    create_resp = client.post("/api/v1/content/", json=CONTENT_PAYLOAD, headers=admin_headers)
    content_id = create_resp.json()["id"]

    updated = {**CONTENT_PAYLOAD, "title": "Advanced Algebra", "target_grade": "11"}
    resp = client.put(f"/api/v1/content/{content_id}", json=updated, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Advanced Algebra"
    assert resp.json()["target_grade"] == "11"


def test_admin_can_delete_content(client, admin_headers, auth_headers):
    create_resp = client.post("/api/v1/content/", json=CONTENT_PAYLOAD, headers=admin_headers)
    content_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/content/{content_id}", headers=admin_headers)
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/v1/content/{content_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_student_cannot_delete_content(client, admin_headers, auth_headers):
    create_resp = client.post("/api/v1/content/", json=CONTENT_PAYLOAD, headers=admin_headers)
    content_id = create_resp.json()["id"]

    resp = client.delete(f"/api/v1/content/{content_id}", headers=auth_headers)
    assert resp.status_code == 403


def test_list_content_pagination(client, admin_headers, auth_headers):
    for i in range(5):
        client.post(
            "/api/v1/content/",
            json={**CONTENT_PAYLOAD, "title": f"Item {i}"},
            headers=admin_headers,
        )
    resp = client.get("/api/v1/content/?skip=0&limit=3", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 3
