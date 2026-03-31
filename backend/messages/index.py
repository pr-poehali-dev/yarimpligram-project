"""
Сообщения Яримплиграмм: отправка и получение сообщений между друзьями.
Маршрут: ?action=send|list|chats
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
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(body, ensure_ascii=False, default=str)}

def get_user(cur, token: str):
    safe_t = token.replace("'", "''")
    cur.execute(f"SELECT u.id, u.username, u.display_name, u.avatar_gradient FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = '{safe_t}' AND s.expires_at > NOW()")
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    token = event.get("headers", {}).get("X-Auth-Token", "")

    if not token:
        return resp(401, {"error": "Не авторизован"})

    conn = get_conn()
    cur = conn.cursor()
    me = get_user(cur, token)
    if not me:
        conn.close()
        return resp(401, {"error": "Сессия истекла"})
    my_id = me[0]

    # GET ?action=chats — список диалогов (последнее сообщение с каждым другом)
    if method == "GET" and action == "chats":
        cur.execute(f"""
            SELECT
                u.id, u.username, u.display_name, u.avatar_gradient,
                (u.last_seen > NOW() - INTERVAL '5 minutes') AS online,
                m.text AS last_text,
                m.created_at AS last_time,
                m.sender_id,
                (SELECT COUNT(*) FROM {SCHEMA}.messages m2
                 WHERE m2.receiver_id = {my_id} AND m2.sender_id = u.id
                 AND m2.id > COALESCE((
                     SELECT MAX(id) FROM {SCHEMA}.messages
                     WHERE sender_id = {my_id} AND receiver_id = u.id
                 ), 0)
                ) AS unread,
                u.verified
            FROM {SCHEMA}.friendships f
            JOIN {SCHEMA}.users u ON u.id = CASE WHEN f.user_id = {my_id} THEN f.friend_id ELSE f.user_id END
            LEFT JOIN LATERAL (
                SELECT text, created_at, sender_id FROM {SCHEMA}.messages
                WHERE (sender_id = {my_id} AND receiver_id = u.id)
                   OR (sender_id = u.id AND receiver_id = {my_id})
                ORDER BY created_at DESC LIMIT 1
            ) m ON TRUE
            WHERE (f.user_id = {my_id} OR f.friend_id = {my_id}) AND f.status = 'accepted'
            ORDER BY m.last_time DESC NULLS LAST
        """)
        rows = cur.fetchall()
        conn.close()
        chats = []
        for r in rows:
            chats.append({
                "id": r[0],
                "username": r[1],
                "display_name": r[2],
                "avatar_gradient": r[3],
                "online": bool(r[4]),
                "last_text": r[5] or "",
                "last_time": r[6].strftime("%H:%M") if r[6] else "",
                "unread": r[8] or 0,
                "verified": bool(r[9]),
            })
        return resp(200, {"chats": chats})

    # GET ?action=list&with_user_id=X — история чата
    if method == "GET" and action == "list":
        with_id = int(params.get("with_user_id", 0))
        if not with_id:
            conn.close()
            return resp(400, {"error": "with_user_id обязателен"})
        offset = int(params.get("offset", 0))
        cur.execute(f"""
            SELECT m.id, m.sender_id, m.text, m.created_at
            FROM {SCHEMA}.messages m
            WHERE (m.sender_id = {my_id} AND m.receiver_id = {with_id})
               OR (m.sender_id = {with_id} AND m.receiver_id = {my_id})
            ORDER BY m.created_at ASC
            LIMIT 100 OFFSET {offset}
        """)
        rows = cur.fetchall()
        conn.close()
        msgs = [{"id": r[0], "sender_id": r[1], "text": r[2], "time": r[3].strftime("%H:%M"), "out": r[1] == my_id} for r in rows]
        return resp(200, {"messages": msgs})

    # POST ?action=send
    if method == "POST" and action == "send":
        body = {}
        if event.get("body"):
            body = json.loads(event["body"])
        receiver_id = int(body.get("receiver_id", 0))
        text = (body.get("text") or "").strip()
        if not receiver_id or not text:
            conn.close()
            return resp(400, {"error": "receiver_id и text обязательны"})
        if len(text) > 4000:
            conn.close()
            return resp(400, {"error": "Сообщение слишком длинное"})

        cur.execute(f"SELECT id FROM {SCHEMA}.friendships WHERE ((user_id = {my_id} AND friend_id = {receiver_id}) OR (user_id = {receiver_id} AND friend_id = {my_id})) AND status = 'accepted'")
        if not cur.fetchone():
            conn.close()
            return resp(403, {"error": "Можно писать только друзьям"})

        safe_text = text.replace("'", "''")
        cur.execute(f"INSERT INTO {SCHEMA}.messages (sender_id, receiver_id, text) VALUES ({my_id}, {receiver_id}, '{safe_text}') RETURNING id, created_at")
        msg_id, created_at = cur.fetchone()
        cur.execute(f"UPDATE {SCHEMA}.users SET last_seen = NOW() WHERE id = {my_id}")
        conn.commit()
        conn.close()
        return resp(200, {"ok": True, "message": {"id": msg_id, "sender_id": my_id, "text": text, "time": created_at.strftime("%H:%M"), "out": True}})

    conn.close()
    return resp(404, {"error": "Not found"})