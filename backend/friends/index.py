"""
Друзья в Яримплиграмм: поиск по юзернейму, добавление, список друзей.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p63910134_yarimpligram_project")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def resp(status: int, body: dict):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(body, ensure_ascii=False)}

def get_user_by_token(cur, token: str):
    cur.execute(f"SELECT u.id, u.username, u.display_name, u.avatar_gradient FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = '{token}' AND s.expires_at > NOW()")
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    token = event.get("headers", {}).get("X-Auth-Token", "")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    if not token:
        return resp(401, {"error": "Не авторизован"})

    conn = get_conn()
    cur = conn.cursor()
    me = get_user_by_token(cur, token)
    if not me:
        conn.close()
        return resp(401, {"error": "Сессия истекла"})
    me_id = me[0]

    # GET ?action=search&q=username
    if method == "GET" and action == "search":
        q = (params.get("q") or "").strip().lower()
        if len(q) < 2:
            conn.close()
            return resp(400, {"error": "Минимум 2 символа для поиска"})
        safe_q = q.replace("'", "''")
        cur.execute(f"""
            SELECT u.id, u.username, u.display_name, u.avatar_gradient,
                   f.status
            FROM {SCHEMA}.users u
            LEFT JOIN {SCHEMA}.friendships f
                ON (f.user_id = {me_id} AND f.friend_id = u.id) OR (f.friend_id = {me_id} AND f.user_id = u.id)
            WHERE u.username LIKE '%{safe_q}%' AND u.id != {me_id}
            LIMIT 20
        """)
        rows = cur.fetchall()
        conn.close()
        users = [{"id": r[0], "username": r[1], "display_name": r[2], "avatar_gradient": r[3], "friendship_status": r[4]} for r in rows]
        return resp(200, {"users": users})

    # POST ?action=add
    if method == "POST" and action == "add":
        username = (body.get("username") or "").strip().lower()
        if not username:
            conn.close()
            return resp(400, {"error": "Укажите юзернейм"})
        safe_u = username.replace("'", "''")
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = '{safe_u}'")
        row = cur.fetchone()
        if not row:
            conn.close()
            return resp(404, {"error": "Пользователь не найден"})
        friend_id = row[0]
        if friend_id == me_id:
            conn.close()
            return resp(400, {"error": "Нельзя добавить себя"})

        cur.execute(f"SELECT id, status FROM {SCHEMA}.friendships WHERE (user_id={me_id} AND friend_id={friend_id}) OR (user_id={friend_id} AND friend_id={me_id})")
        existing = cur.fetchone()
        if existing:
            conn.close()
            return resp(409, {"error": "Запрос уже отправлен или вы уже друзья"})

        cur.execute(f"INSERT INTO {SCHEMA}.friendships (user_id, friend_id, status) VALUES ({me_id}, {friend_id}, 'pending')")
        conn.commit()
        conn.close()
        return resp(200, {"ok": True, "message": f"Запрос отправлен пользователю @{username}"})

    # POST ?action=accept
    if method == "POST" and action == "accept":
        friend_id = body.get("user_id")
        if not friend_id:
            conn.close()
            return resp(400, {"error": "Укажите user_id"})
        cur.execute(f"UPDATE {SCHEMA}.friendships SET status='accepted' WHERE user_id={friend_id} AND friend_id={me_id} AND status='pending'")
        conn.commit()
        conn.close()
        return resp(200, {"ok": True})

    # GET ?action=list
    if method == "GET" and action == "list":
        cur.execute(f"""
            SELECT u.id, u.username, u.display_name, u.avatar_gradient, f.status,
                   CASE WHEN u.last_seen > NOW() - INTERVAL '5 minutes' THEN true ELSE false END as online
            FROM {SCHEMA}.friendships f
            JOIN {SCHEMA}.users u ON (
                CASE WHEN f.user_id = {me_id} THEN f.friend_id ELSE f.user_id END = u.id
            )
            WHERE (f.user_id = {me_id} OR f.friend_id = {me_id}) AND f.status = 'accepted'
            ORDER BY u.display_name
        """)
        rows = cur.fetchall()

        cur.execute(f"""
            SELECT u.id, u.username, u.display_name, u.avatar_gradient
            FROM {SCHEMA}.friendships f
            JOIN {SCHEMA}.users u ON f.user_id = u.id
            WHERE f.friend_id = {me_id} AND f.status = 'pending'
        """)
        pending_rows = cur.fetchall()
        conn.close()

        friends = [{"id": r[0], "username": r[1], "display_name": r[2], "avatar_gradient": r[3], "status": r[4], "online": r[5]} for r in rows]
        pending = [{"id": r[0], "username": r[1], "display_name": r[2], "avatar_gradient": r[3]} for r in pending_rows]
        return resp(200, {"friends": friends, "pending_requests": pending})

    conn.close()
    return resp(404, {"error": "Not found"})