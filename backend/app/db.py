import os
import json
import sqlite3
from datetime import datetime, timezone

ROOT = os.path.dirname(__file__)
DATA_FILE = os.path.join(ROOT, "data.json")
DB_PATH = os.path.join(ROOT, "data.db")


def get_db_connection():
    conn = sqlite3.connect(
        DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES
    )
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            problem TEXT NOT NULL,
            priority TEXT NOT NULL,
            arrivalTime TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """
    )

    conn.commit()

    cur.execute("SELECT COUNT(*) as c FROM patients")
    if cur.fetchone()["c"] == 0 and os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            for p in data:
                cur.execute(
                    """
                    INSERT INTO patients (id, name, problem, priority, arrivalTime, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                """,
                    (
                        p.get("id"),
                        p.get("name"),
                        p.get("problem"),
                        p.get("priority"),
                        p.get("arrivalTime"),
                        p.get("status"),
                    ),
                )
            conn.commit()
        except Exception:
            pass

    conn.close()


def row_to_patient(r: sqlite3.Row) -> dict:
    return {
        "id": r["id"],
        "name": r["name"],
        "problem": r["problem"],
        "priority": r["priority"],
        "arrivalTime": r["arrivalTime"],
        "status": r["status"],
    }


def get_all_patients():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM patients WHERE status='Waiting'")
    rows = cur.fetchall()
    patients = [row_to_patient(r) for r in rows]

    def sort_key(p):
        pri = 0 if p["priority"] == "Emergency" else 1
        try:
            at = datetime.fromisoformat(p["arrivalTime"].replace("Z", "+00:00"))
        except:
            at = datetime.max.replace(tzinfo=timezone.utc)
        return (pri, at)

    patients.sort(key=sort_key)
    conn.close()
    return patients


def add_patient(name, problem, priority):
    conn = get_db_connection()
    cur = conn.cursor()

    arrival = datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

    cur.execute(
        """
        INSERT INTO patients (name, problem, priority, arrivalTime, status)
        VALUES (?, ?, ?, ?, ?)
    """,
        (name, problem, priority, arrival, "Waiting"),
    )

    conn.commit()
    pid = cur.lastrowid

    cur.execute("SELECT * FROM patients WHERE id=?", (pid,))
    row = cur.fetchone()

    conn.close()
    return row_to_patient(row)


def mark_visited(patient_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM patients WHERE id=?", (patient_id,))
    row = cur.fetchone()

    if not row:
        conn.close()
        return None, "not_found"

    if row["status"] == "Visited":
        conn.close()
        return None, "already_visited"

    cur.execute("UPDATE patients SET status='Visited' WHERE id=?", (patient_id,))
    conn.commit()

    cur.execute("SELECT * FROM patients WHERE id=?", (patient_id,))
    updated = cur.fetchone()

    conn.close()
    return row_to_patient(updated), None


def get_stats():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM patients WHERE status='Waiting'")
    waiting = cur.fetchone()[0]

    cur.execute(
        """
        SELECT COUNT(*) FROM patients
        WHERE status='Waiting' AND priority='Emergency'
    """
    )
    emergency = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM patients WHERE status='Visited'")
    visited = cur.fetchone()[0]

    conn.close()

    return {
        "totalWaiting": waiting,
        "totalEmergency": emergency,
        "totalVisited": visited,
    }
