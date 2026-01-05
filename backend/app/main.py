from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db, get_all_patients, add_patient, mark_visited, get_stats
from .classes import PatientIn, Patient
from typing import List

app = FastAPI(title="Clinic Patient Queue")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.get("/patients", response_model=List[Patient])
def list_patients():
    return get_all_patients()


@app.post("/patients", status_code=201, response_model=Patient)
def create_patient(payload: PatientIn):
    return add_patient(
        payload.name.strip(), payload.problem.strip(), payload.priority.value
    )


@app.put("/patients/{patient_id}/visit", response_model=Patient)
def visit(patient_id: int):
    patient, err = mark_visited(patient_id)

    if err == "not_found":
        raise HTTPException(404, "Patient not found")
    if err == "already_visited":
        raise HTTPException(400, "Patient already visited")

    return patient


@app.get("/patients/stats")
def stats():
    return get_stats()
