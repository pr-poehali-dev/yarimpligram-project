"""
Аутентификация Яримплиграмм: регистрация, вход, выход, получение профиля.
Маршрут: ?action=register|login|me|logout
"""
import json
import os
import hashlib
import secrets
import re
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p63910134_yarimpligram_project")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token() -> str:
    return secrets.token_hex(32)

def resp(status: int, body: dict):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(body, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # POST ?action=register
    if method == "POST" and action == "register":
        username = (body.get("username") or "").strip().lower()
        display_name = (body.get("display_name") or "").strip()
        password = body.get("password") or ""
        phone = (body.get("phone") or "").strip()

        if not username or not display_name or not password:
            return resp(400, {"error": "Заполните все обязательные поля"})
        if not re.match(r"^[a-z0-9_]{3,32}$", username):
            return resp(400, {"error": "Юзернейм: 3-32 символа, только латиница, цифры и _"})
        if len(password) < 6:
            return resp(400, {"error": "Пароль минимум 6 символов"})

        safe_u = username.replace("'", "''")
        safe_d = display_name.replace("'", "''")
        safe_p = phone.replace("'", "''")
        ph = hash_password(password)
        gradient = secrets.randbelow(5) + 1

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = '{safe_u}'")
        if cur.fetchone():
            conn.close()
            return resp(409, {"error": "Этот юзернейм уже занят"})

        cur.execute(
            f"INSERT INTO {SCHEMA}.users (username, display_name, password_hash, phone, avatar_gradient) VALUES ('{safe_u}', '{safe_d}', '{ph}', '{safe_p}', {gradient}) RETURNING id"
        )
        user_id = cur.fetchone()[0]
        token = make_token()
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES ({user_id}, '{token}')")
        conn.commit()
        conn.close()
        return resp(200, {"token": token, "user": {"id": user_id, "username": username, "display_name": display_name, "avatar_gradient": gradient, "bio": "", "verified": False}})

    # POST ?action=login
    if method == "POST" and action == "login":
        username = (body.get("username") or "").strip().lower()
        password = body.get("password") or ""
        if not username or not password:
            return resp(400, {"error": "Введите юзернейм и пароль"})

        safe_u = username.replace("'", "''")
        ph = hash_password(password)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, username, display_name, avatar_gradient, bio, verified FROM {SCHEMA}.users WHERE username = '{safe_u}' AND password_hash = '{ph}'")
        row = cur.fetchone()
        if not row:
            conn.close()
            return resp(401, {"error": "Неверный юзернейм или пароль"})

        user_id, uname, dname, gradient, bio, verified = row
        token = make_token()
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES ({user_id}, '{token}')")
        cur.execute(f"UPDATE {SCHEMA}.users SET last_seen = NOW() WHERE id = {user_id}")
        conn.commit()
        conn.close()
        return resp(200, {"token": token, "user": {"id": user_id, "username": uname, "display_name": dname, "avatar_gradient": gradient, "bio": bio or "", "verified": bool(verified)}})

    # GET ?action=me
    if method == "GET" and action == "me":
        token = event.get("headers", {}).get("X-Auth-Token", "")
        if not token:
            return resp(401, {"error": "Не авторизован"})
        safe_t = token.replace("'", "''")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT u.id, u.username, u.display_name, u.avatar_gradient, u.bio, u.verified FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = '{safe_t}' AND s.expires_at > NOW()")
        row = cur.fetchone()
        conn.close()
        if not row:
            return resp(401, {"error": "Сессия истекла"})
        uid, uname, dname, gradient, bio, verified = row
        return resp(200, {"user": {"id": uid, "username": uname, "display_name": dname, "avatar_gradient": gradient, "bio": bio or "", "verified": bool(verified)}})

    # POST ?action=logout
    if method == "POST" and action == "logout":
        token = event.get("headers", {}).get("X-Auth-Token", "")
        if token:
            safe_t = token.replace("'", "''")
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = '{safe_t}'")
            conn.commit()
            conn.close()
        return resp(200, {"ok": True})

    return resp(404, {"error": "Not found"})