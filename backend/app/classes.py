from pydantic import BaseModel, Field
from enum import Enum


class Priority(str, Enum):
    Normal = "Normal"
    Emergency = "Emergency"


class PatientIn(BaseModel):
    name: str = Field(..., min_length=3)
    problem: str = Field(..., min_length=3)
    priority: Priority = Priority.Normal


class Patient(BaseModel):
    id: int
    name: str
    problem: str
    priority: Priority
    arrivalTime: str
    status: str
