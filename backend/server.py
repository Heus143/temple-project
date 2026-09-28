from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, List

import jwt
import bcrypt
import httpx
from html import escape
from urllib.parse import urlparse
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Body, BackgroundTasks
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, EmailStr

# ----------------------------------------------------------------------------
# Setup
# ----------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("temple")

app = FastAPI(title="Sri Annapurnamma Temple API")
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

EMAIL_BASE_URL = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip().rstrip("/") or "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME") or "Sri Annapurnamma Temple"


# ----------------------------------------------------------------------------
# Password / JWT helpers
# ----------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str, token_version: int = 0) -> str:
    payload = {"sub": user_id, "email": email, "ver": token_version,
               "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str, token_version: int = 0) -> str:
    payload = {"sub": user_id, "ver": token_version,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        try:
            oid = ObjectId(payload["sub"])
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": oid})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if payload.get("ver", 0) != user.get("token_version", 0):
            raise HTTPException(status_code=401, detail="Session expired")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ----------------------------------------------------------------------------
# Email (password reset)
# ----------------------------------------------------------------------------
async def send_password_reset_email(to_email: str, token: str) -> bool:
    base = FRONTEND_URL.rstrip("/")
    link = f"{base}/reset-password?token={token}"
    if not EMAIL_KEY or EMAIL_KEY.startswith("{") or not base.startswith("https://"):
        if urlparse(base).hostname in ("localhost", "127.0.0.1", "::1"):
            logger.warning("Email not configured; password reset link: %s", link)
        else:
            logger.error("Password reset email not configured (EMERGENT_EMAIL_KEY / FRONTEND_URL)")
        return False
    brand = escape(EMAIL_FROM_NAME)
    html = (
        f'<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif">'
        f'<p>We received a request to reset your {brand} admin password.</p>'
        f'<p><a href="{escape(link)}">Reset your password</a></p>'
        f'<p>This link expires in 1 hour and can be used once. If you did not request it, ignore this email.</p>'
        f'</td></tr></table>'
    )
    try:
        async with httpx.AsyncClient(timeout=30) as http_client:
            resp = await http_client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json={"to": [to_email], "subject": f"Reset your {EMAIL_FROM_NAME} password",
                      "html": html, "from_name": EMAIL_FROM_NAME},
            )
        resp.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Password reset email failed: {e}")
        return False


# ----------------------------------------------------------------------------
# Brute force helpers
# ----------------------------------------------------------------------------
async def is_locked_out(identifier: str) -> bool:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=15)
    count = await db.login_attempts.count_documents({
        "identifier": identifier,
        "created_at": {"$gt": cutoff.isoformat()}
    })
    return count >= 5


async def record_failed_attempt(identifier: str, email: str):
    await db.login_attempts.insert_one({
        "identifier": identifier, "email": email,
        "created_at": datetime.now(timezone.utc).isoformat()
    })


async def clear_attempts(identifier: str):
    await db.login_attempts.delete_many({"identifier": identifier})


# ----------------------------------------------------------------------------
# Auth models & endpoints
# ----------------------------------------------------------------------------
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class EmailInput(BaseModel):
    email: EmailStr


class ResetInput(BaseModel):
    token: str
    password: str


def public_user(u: dict) -> dict:
    return {"id": str(u["_id"]), "email": u["email"], "name": u.get("name", "Admin"), "role": u.get("role", "admin")}


def client_ip(request: Request) -> str:
    fwd = (request.headers.get("x-forwarded-for") or "").split(",")[0].strip()
    if fwd:
        return fwd
    return request.client.host if request.client else "unknown"


@api_router.post("/auth/login")
async def login(data: LoginInput, request: Request, response: Response):
    email = data.email.lower().strip()
    ip = client_ip(request)
    identifier = f"{ip}:{email}"
    if await is_locked_out(identifier):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Please try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        await record_failed_attempt(identifier, email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await clear_attempts(identifier)
    ver = user.get("token_version", 0)
    uid = str(user["_id"])
    set_auth_cookies(response, create_access_token(uid, email, ver), create_refresh_token(uid, ver))
    return public_user(user)


@api_router.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    # Invalidate all existing tokens server-side (stateless JWTs otherwise stay valid until expiry)
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$inc": {"token_version": 1}})
    response.delete_cookie("access_token", path="/", samesite="none", secure=True)
    response.delete_cookie("refresh_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        try:
            oid = ObjectId(payload["sub"])
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": oid})
        if not user or payload.get("ver", 0) != user.get("token_version", 0):
            raise HTTPException(status_code=401, detail="Session expired")
        uid = str(user["_id"])
        response.set_cookie("access_token", create_access_token(uid, user["email"], user.get("token_version", 0)),
                            httponly=True, secure=True, samesite="none", max_age=900, path="/")
        return {"message": "refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


GENERIC_RESET_MSG = {"message": "If that email is registered, a reset link has been sent."}


@api_router.post("/auth/forgot-password")
async def forgot_password(data: EmailInput, background_tasks: BackgroundTasks):
    email = data.email.lower().strip()
    now = datetime.now(timezone.utc)
    await db.password_reset_requests.insert_one({"email": email, "created_at": now.isoformat()})
    cutoff = (now - timedelta(minutes=15)).isoformat()
    recent = await db.password_reset_requests.count_documents({"email": email, "created_at": {"$gt": cutoff}})
    if recent > 5:
        return GENERIC_RESET_MSG
    user = await db.users.find_one({"email": email})
    if not user:
        return GENERIC_RESET_MSG
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    await db.password_reset_tokens.insert_one({
        "token_hash": token_hash, "user_id": str(user["_id"]), "email": email,
        "expires_at": (now + timedelta(hours=1)).isoformat(), "used": False,
        "created_at": now.isoformat(),
    })
    background_tasks.add_task(send_password_reset_email, user["email"], token)
    return GENERIC_RESET_MSG


@api_router.post("/auth/reset-password")
async def reset_password(data: ResetInput):
    token_hash = hashlib.sha256(data.token.encode()).hexdigest()
    now = datetime.now(timezone.utc).isoformat()
    doc = await db.password_reset_tokens.find_one_and_update(
        {"token_hash": token_hash, "used": False, "expires_at": {"$gt": now}},
        {"$set": {"used": True}},
    )
    if not doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    await db.users.update_one(
        {"_id": ObjectId(doc["user_id"])},
        {"$set": {"password_hash": hash_password(data.password)}, "$inc": {"token_version": 1}},
    )
    await db.password_reset_tokens.delete_many({"user_id": doc["user_id"], "used": False})
    await db.login_attempts.delete_many({"email": doc["email"]})
    return {"message": "Password has been reset. You can now log in."}


# ----------------------------------------------------------------------------
# Content helpers
# ----------------------------------------------------------------------------
def clean(doc: dict) -> dict:
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---- Singleton content (settings, home, about, temple, location, contact) ----
SINGLETONS = {"website_settings", "home_content", "about_content", "temple_info", "location_info", "contact_info"}


@api_router.get("/content/{key}")
async def get_singleton(key: str):
    if key not in SINGLETONS:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await db.singletons.find_one({"key": key})
    return clean(doc)["data"] if doc else {}


@api_router.put("/content/{key}")
async def put_singleton(key: str, data: dict = Body(...), admin: dict = Depends(get_current_admin)):
    if key not in SINGLETONS:
        raise HTTPException(status_code=404, detail="Not found")
    await db.singletons.update_one(
        {"key": key},
        {"$set": {"key": key, "data": data, "updated_at": now_iso()}},
        upsert=True,
    )
    return data


# ---- Generic collections ----
# name -> (mongo collection, public sort spec)
COLLECTIONS = {
    "events": [("display_order", 1), ("event_date", -1), ("created_at", -1)],
    "previous_years": [("display_order", 1), ("year", -1)],
    "gallery": [("display_order", 1), ("created_at", -1)],
    "gallery_categories": [("display_order", 1), ("name", 1)],
    "committee_members": [("display_order", 1), ("created_at", 1)],
    "vamshavali": [("display_order", 1), ("created_at", 1)],
    "announcements": [("priority", -1), ("display_order", 1), ("created_at", -1)],
    "media_library": [("created_at", -1)],
}


def coll(name: str):
    return db[name]


@api_router.get("/collection/{name}")
async def list_public(name: str):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    query = {"published": True}
    if name == "announcements":
        today = datetime.now(timezone.utc).date().isoformat()
        query["$and"] = [
            {"$or": [{"start_date": {"$in": [None, ""]}}, {"start_date": {"$lte": today}}]},
            {"$or": [{"end_date": {"$in": [None, ""]}}, {"end_date": {"$gte": today}}]},
        ]
    docs = await coll(name).find(query).sort(COLLECTIONS[name]).to_list(1000)
    return [clean(d) for d in docs]


@api_router.get("/admin/collection/{name}")
async def list_admin(name: str, admin: dict = Depends(get_current_admin)):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    docs = await coll(name).find({}).sort(COLLECTIONS[name]).to_list(2000)
    return [clean(d) for d in docs]


@api_router.get("/collection/{name}/{item_id}")
async def get_item(name: str, item_id: str):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await coll(name).find_one({"id": item_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    return clean(doc)


@api_router.post("/admin/collection/{name}")
async def create_item(name: str, data: dict = Body(...), admin: dict = Depends(get_current_admin)):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    data = dict(data)
    data.pop("_id", None)
    data["id"] = str(uuid.uuid4())
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    data.setdefault("published", False)
    data.setdefault("display_order", 0)
    await coll(name).insert_one(data)
    return clean(data)


@api_router.put("/admin/collection/{name}/{item_id}")
async def update_item(name: str, item_id: str, data: dict = Body(...), admin: dict = Depends(get_current_admin)):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    data = dict(data)
    data.pop("_id", None)
    data.pop("id", None)
    data["updated_at"] = now_iso()
    res = await coll(name).update_one({"id": item_id}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    doc = await coll(name).find_one({"id": item_id})
    return clean(doc)


@api_router.delete("/admin/collection/{name}/{item_id}")
async def delete_item(name: str, item_id: str, admin: dict = Depends(get_current_admin)):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    res = await coll(name).delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Deleted"}


@api_router.post("/admin/collection/{name}/reorder")
async def reorder_items(name: str, order: List[str] = Body(..., embed=True), admin: dict = Depends(get_current_admin)):
    if name not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Not found")
    for idx, item_id in enumerate(order):
        await coll(name).update_one({"id": item_id}, {"$set": {"display_order": idx}})
    return {"message": "Reordered"}


# ---- Media upload (base64 data URLs stored in Mongo) ----
@api_router.post("/admin/media")
async def upload_media(data: dict = Body(...), admin: dict = Depends(get_current_admin)):
    url = data.get("data_url")
    if not url or not isinstance(url, str) or not url.startswith("data:"):
        raise HTTPException(status_code=400, detail="Invalid image data")
    if len(url) > 12_000_000:
        raise HTTPException(status_code=413, detail="Image too large. Please upload an image under ~8MB.")
    doc = {
        "id": str(uuid.uuid4()),
        "filename": data.get("filename", "upload"),
        "data_url": url,
        "size": data.get("size", 0),
        "created_at": now_iso(),
        "display_order": 0,
    }
    await db.media_library.insert_one(doc)
    return clean(doc)


# ---- Contact messages ----
class ContactMessageInput(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


@api_router.post("/contact-messages")
async def create_message(data: ContactMessageInput):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["read"] = False
    doc["created_at"] = now_iso()
    await db.contact_messages.insert_one(doc)
    return {"message": "Your message has been sent. Thank you."}


@api_router.get("/admin/contact-messages")
async def list_messages(admin: dict = Depends(get_current_admin)):
    docs = await db.contact_messages.find({}).sort([("created_at", -1)]).to_list(2000)
    return [clean(d) for d in docs]


@api_router.put("/admin/contact-messages/{item_id}")
async def update_message(item_id: str, data: dict = Body(...), admin: dict = Depends(get_current_admin)):
    await db.contact_messages.update_one({"id": item_id}, {"$set": {"read": bool(data.get("read", True))}})
    doc = await db.contact_messages.find_one({"id": item_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return clean(doc)


@api_router.delete("/admin/contact-messages/{item_id}")
async def delete_message(item_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.contact_messages.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


# ---- Dashboard stats ----
@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_current_admin)):
    return {
        "events": await db.events.count_documents({}),
        "previous_years": await db.previous_years.count_documents({}),
        "gallery": await db.gallery.count_documents({}),
        "committee_members": await db.committee_members.count_documents({}),
        "vamshavali": await db.vamshavali.count_documents({}),
        "announcements": await db.announcements.count_documents({}),
        "media_library": await db.media_library.count_documents({}),
        "unread_messages": await db.contact_messages.count_documents({"read": False}),
        "total_messages": await db.contact_messages.count_documents({}),
    }


@api_router.get("/")
async def root():
    return {"message": "Sri Annapurnamma Temple API"}


# ----------------------------------------------------------------------------
# Seeding & startup
# ----------------------------------------------------------------------------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Temple Administrator", "role": "admin",
            "token_version": 0, "created_at": now_iso(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}, "$inc": {"token_version": 1}})
        logger.info("Updated admin password")


async def seed_committee():
    if await db.committee_members.count_documents({}) > 0:
        return
    for i in range(1, 18):
        await db.committee_members.insert_one({
            "id": str(uuid.uuid4()),
            "name": "",
            "position": "",
            "description": "",
            "photo": f"/assets/committee/member_{i}.jpg",
            "published": True,
            "display_order": i,
            "created_at": now_iso(),
            "updated_at": now_iso(),
        })
    logger.info("Seeded 17 committee members from banner")


async def seed_defaults():
    if not await db.singletons.find_one({"key": "website_settings"}):
        await db.singletons.insert_one({"key": "website_settings", "data": {
            "website_title": "Sri Annapurnamma Temple",
            "temple_name_en": "SRI ANNAPURNAMMA TEMPLE",
            "temple_name_te": "శ్రీ అన్నపూర్ణమ్మ అమ్మ వారి దేవర మందిరము",
            "mantra": "ఓం శ్రీ అన్నపూర్ణా దేవి",
            "footer_text": "",
            "address": "Avvaru Vari Street, Chirala, Bapatla District, Andhra Pradesh – 523155",
            "phone": "", "email": "",
            "maps_link": "",
            "seo_title": "Sri Annapurnamma Temple, Chirala",
            "seo_description": "Official website of Sri Annapurnamma Ammavari Devara Mandiram, Avvaru Vari Street, Chirala.",
        }, "updated_at": now_iso()})
    if not await db.singletons.find_one({"key": "location_info"}):
        await db.singletons.insert_one({"key": "location_info", "data": {
            "address": "Avvaru Vari Street, Chirala, Bapatla District, Andhra Pradesh – 523155",
            "maps_link": "", "embed_link": "", "directions": "",
        }, "updated_at": now_iso()})
    logger.info("Seeded default settings")


async def ensure_indexes():
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.password_reset_tokens.create_index("token_hash", unique=True)
    await db.login_attempts.create_index("email")
    await db.login_attempts.create_index("identifier")
    await db.password_reset_requests.create_index("email")
    await db.singletons.create_index("key", unique=True)
    for c in COLLECTIONS:
        await db[c].create_index("id", unique=True)


@app.on_event("startup")
async def on_startup():
    await ensure_indexes()
    await seed_admin()
    await seed_committee()
    await seed_defaults()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
