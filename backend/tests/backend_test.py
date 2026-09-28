"""Backend API tests for Sri Annapurnamma Temple CMS."""
import os
import time
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sri-ammavari-chirala.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "kumardivvelaa@gmail.com"
ADMIN_PASSWORD = "Annapurnamma@2026#Admin"


# ----------------- fixtures -----------------
@pytest.fixture(scope="module")
def anon():
    return requests.Session()


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return s


# ----------------- health -----------------
def test_root_api():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


# ----------------- auth -----------------
def test_login_success_sets_cookies(admin):
    r = admin.get(f"{API}/auth/me")
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert data["role"] == "admin"


def test_me_unauthenticated_401(anon):
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_login_invalid_password():
    r = requests.post(f"{API}/auth/login", json={"email": "notanadmin@example.com", "password": "wrong"})
    assert r.status_code in (401, 429)


def test_admin_endpoints_reject_anon():
    r = requests.post(f"{API}/admin/collection/events", json={"title": "x"})
    assert r.status_code in (401, 403)
    r = requests.get(f"{API}/admin/collection/events")
    assert r.status_code in (401, 403)
    r = requests.get(f"{API}/admin/contact-messages")
    assert r.status_code in (401, 403)
    r = requests.get(f"{API}/admin/stats")
    assert r.status_code in (401, 403)
    r = requests.put(f"{API}/content/website_settings", json={"x": 1})
    assert r.status_code in (401, 403)


def test_forgot_password_generic_response():
    r1 = requests.post(f"{API}/auth/forgot-password", json={"email": ADMIN_EMAIL})
    r2 = requests.post(f"{API}/auth/forgot-password", json={"email": "nobody-xyz@example.com"})
    assert r1.status_code == 200 and r2.status_code == 200
    assert r1.json() == r2.json()


def test_reset_password_invalid_token():
    r = requests.post(f"{API}/auth/reset-password", json={"token": "invalidxxx", "password": "newpass123"})
    assert r.status_code == 400


def test_brute_force_lockout():
    email = f"bruteforce_{uuid.uuid4().hex[:6]}@example.com"
    codes = []
    for _ in range(7):
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"})
        codes.append(r.status_code)
    # After 5 failed attempts, expect 429
    assert 429 in codes, f"expected lockout, got: {codes}"


# ----------------- singletons -----------------
def test_singleton_put_get(admin):
    payload = {"website_title": "TEST Temple", "footer_text": "TEST footer"}
    r = admin.put(f"{API}/content/website_settings", json=payload)
    assert r.status_code == 200
    r2 = requests.get(f"{API}/content/website_settings")
    assert r2.status_code == 200
    got = r2.json()
    assert got.get("website_title") == "TEST Temple"


def test_singleton_all_keys(admin):
    for key in ["home_content", "about_content", "temple_info", "location_info", "contact_info"]:
        r = admin.put(f"{API}/content/{key}", json={"marker": f"TEST_{key}"})
        assert r.status_code == 200
        r2 = requests.get(f"{API}/content/{key}")
        assert r2.status_code == 200
        assert r2.json().get("marker") == f"TEST_{key}"


def test_singleton_unknown_key_404():
    r = requests.get(f"{API}/content/bogus_key")
    assert r.status_code == 404


# ----------------- committee seed -----------------
def test_committee_seeded_17():
    r = requests.get(f"{API}/collection/committee_members")
    assert r.status_code == 200
    members = r.json()
    assert len(members) == 17
    for m in members:
        assert m["photo"].startswith("/assets/committee/member_")


# ----------------- events crud + publish -----------------
def test_events_crud_publish(admin):
    payload = {"title": "TEST Event", "event_date": "2027-01-15", "description": "test", "published": False}
    r = admin.post(f"{API}/admin/collection/events", json=payload)
    assert r.status_code == 200
    eid = r.json()["id"]

    # not visible on public since unpublished
    pub = requests.get(f"{API}/collection/events").json()
    assert not any(e["id"] == eid for e in pub)

    # publish
    r = admin.put(f"{API}/admin/collection/events/{eid}", json={"published": True})
    assert r.status_code == 200
    assert r.json()["published"] is True

    pub = requests.get(f"{API}/collection/events").json()
    assert any(e["id"] == eid and e["title"] == "TEST Event" for e in pub)

    # cleanup
    r = admin.delete(f"{API}/admin/collection/events/{eid}")
    assert r.status_code == 200
    # verify gone
    r = requests.get(f"{API}/collection/events/{eid}")
    assert r.status_code == 404


def test_previous_years_no_year_limit(admin):
    ids = []
    for yr in (2026, 2027):
        r = admin.post(f"{API}/admin/collection/previous_years",
                        json={"year": yr, "title": f"TEST {yr}", "published": True})
        assert r.status_code == 200
        ids.append(r.json()["id"])
    pub = requests.get(f"{API}/collection/previous_years").json()
    years = [p.get("year") for p in pub if p["id"] in ids]
    assert 2026 in years and 2027 in years
    for i in ids:
        admin.delete(f"{API}/admin/collection/previous_years/{i}")


# ----------------- committee update persists -----------------
def test_committee_update_persists(admin):
    members = requests.get(f"{API}/collection/committee_members").json()
    mid = members[0]["id"]
    orig_name = members[0].get("name", "")
    r = admin.put(f"{API}/admin/collection/committee_members/{mid}",
                  json={"name": "TEST Member", "position": "TEST President"})
    assert r.status_code == 200
    assert r.json()["name"] == "TEST Member"
    # verify via public
    pub = requests.get(f"{API}/collection/committee_members").json()
    m = next(x for x in pub if x["id"] == mid)
    assert m["name"] == "TEST Member"
    # restore
    admin.put(f"{API}/admin/collection/committee_members/{mid}",
              json={"name": orig_name, "position": ""})


# ----------------- gallery + media -----------------
def test_media_upload_and_gallery(admin):
    tiny_png = ("data:image/png;base64,"
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")
    r = admin.post(f"{API}/admin/media", json={"data_url": tiny_png, "filename": "test.png", "size": 100})
    assert r.status_code == 200
    media_id = r.json()["id"]
    assert r.json()["data_url"].startswith("data:image/png")

    # invalid
    bad = admin.post(f"{API}/admin/media", json={"data_url": "not-a-data-url"})
    assert bad.status_code == 400

    # create category + image
    cat = admin.post(f"{API}/admin/collection/gallery_categories",
                     json={"name": "TEST Category", "published": True}).json()
    img = admin.post(f"{API}/admin/collection/gallery",
                     json={"title": "TEST img", "image_url": tiny_png,
                           "category_id": cat["id"], "published": True}).json()
    pub = requests.get(f"{API}/collection/gallery").json()
    assert any(g["id"] == img["id"] for g in pub)

    # cleanup
    admin.delete(f"{API}/admin/collection/gallery/{img['id']}")
    admin.delete(f"{API}/admin/collection/gallery_categories/{cat['id']}")


# ----------------- announcements date filtering -----------------
def test_announcements_date_filter(admin):
    past = (datetime.now(timezone.utc).date() - timedelta(days=2)).isoformat()
    future = (datetime.now(timezone.utc).date() + timedelta(days=10)).isoformat()

    a_past = admin.post(f"{API}/admin/collection/announcements",
                        json={"title": "TEST past", "message": "x", "end_date": past, "published": True}).json()
    a_future = admin.post(f"{API}/admin/collection/announcements",
                          json={"title": "TEST future", "message": "y", "end_date": future,
                                "published": True, "priority": 5}).json()
    a_none = admin.post(f"{API}/admin/collection/announcements",
                        json={"title": "TEST none", "message": "z", "published": True, "priority": 1}).json()

    pub_ids = [p["id"] for p in requests.get(f"{API}/collection/announcements").json()]
    assert a_past["id"] not in pub_ids
    assert a_future["id"] in pub_ids
    assert a_none["id"] in pub_ids

    for aid in (a_past["id"], a_future["id"], a_none["id"]):
        admin.delete(f"{API}/admin/collection/announcements/{aid}")


# ----------------- vamshavali -----------------
def test_vamshavali(admin):
    r = admin.post(f"{API}/admin/collection/vamshavali",
                   json={"name": "TEST ancestor", "published": True}).json()
    pub = requests.get(f"{API}/collection/vamshavali").json()
    assert any(v["id"] == r["id"] for v in pub)
    admin.delete(f"{API}/admin/collection/vamshavali/{r['id']}")


# ----------------- contact messages -----------------
def test_contact_message_flow(admin):
    body = {"name": "TEST user", "email": "test@example.com", "message": "hi from tests"}
    r = requests.post(f"{API}/contact-messages", json=body)
    assert r.status_code == 200

    # public cannot GET
    r = requests.get(f"{API}/admin/contact-messages")
    assert r.status_code in (401, 403)

    msgs = admin.get(f"{API}/admin/contact-messages").json()
    my = [m for m in msgs if m["name"] == "TEST user" and m.get("message") == "hi from tests"]
    assert my, "message not stored"
    mid = my[0]["id"]

    r = admin.put(f"{API}/admin/contact-messages/{mid}", json={"read": True})
    assert r.status_code == 200 and r.json()["read"] is True

    r = admin.delete(f"{API}/admin/contact-messages/{mid}")
    assert r.status_code == 200


# ----------------- reorder -----------------
def test_reorder(admin):
    ids = []
    for i in range(3):
        r = admin.post(f"{API}/admin/collection/events",
                       json={"title": f"TEST reorder {i}", "published": False}).json()
        ids.append(r["id"])
    reversed_ids = list(reversed(ids))
    r = admin.post(f"{API}/admin/collection/events/reorder", json={"order": reversed_ids})
    assert r.status_code == 200

    # verify display_order updated
    all_ev = admin.get(f"{API}/admin/collection/events").json()
    by_id = {e["id"]: e for e in all_ev}
    for idx, i in enumerate(reversed_ids):
        assert by_id[i]["display_order"] == idx

    for i in ids:
        admin.delete(f"{API}/admin/collection/events/{i}")


# ----------------- stats -----------------
def test_admin_stats(admin):
    r = admin.get(f"{API}/admin/stats")
    assert r.status_code == 200
    data = r.json()
    for k in ["events", "previous_years", "gallery", "committee_members", "vamshavali",
              "announcements", "media_library", "unread_messages", "total_messages"]:
        assert k in data
    assert data["committee_members"] == 17
